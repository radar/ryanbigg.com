---
wordpress_id: RB-1628673796
layout: post
title: A tour of Twist
published: false
---

When I'm writing [my books](/books), it's more often than not that reviewers read and review these books on an application that I built myself called [Twist](https://github.com/radar/twist-v2). It looks like this:

![Twist](https://raw.githubusercontent.com/radar/twist-v2/master/preview.png)

In this post, I'd like to cover just one half of Twist: the backend half. There's also a frontend half that's just as interesting!

What's most interesting about this backend application is that it is a Ruby application that is _not_ a Rails application, and it is _not_ a Sinatra application. While it borrows inspiration (and gems!) from the Hanami project, it is not a Hanami application. It's a hybrid application, one that is built on top of some pretty great foundations from those Hanami gems, and also some gems from the [dry-rb](https://dry-rb.org/) and [rom-rb](https://rom-rb.org/) suites of gems. I'd like to spend this post covering a few key details here about Twist and its unique structure.

To cover what Twist does in a nutshell: Twist receives webhook notifications from GitHub after new commits are pushed to a book's GitHub repository. Twist then reads a book's Markdown or AsciiDoc files and converts those formats into HTML and stores it in a database. Later on, that HTML is served out through a GraphQL endpoint in the form of books, chapters, and elements. Readers can then read the book and leave notes on the book as they go. I use these notes to improve the quality of the books I write.

## The application container

The application starts off in a similar way to a Rails application. There's a `config.ru` file that goes off and loads `config/boot.rb`. That sets up Bundler and Dotenv, configuring the gems and environment necessary for running the application. After that, we come to the application _container_.

An application container is a concept from the `dry-system` gem. It's a space to define the components of your application and how they're loaded. Twist does this with the following code:

```ruby
require 'dry/system/container'
require 'dry/auto_inject'
require 'dry/system/loader/autoloading'
require 'zeitwerk'

module Twist
  class Container < Dry::System::Container
    config.root = __dir__

    config.component_dirs.loader = Dry::System::Loader::Autoloading
    config.component_dirs.add_to_load_path = false
    config.component_dirs.default_namespace = 'twist'

    config.component_dirs.add "lib" do |dir|
      dir.auto_register = true
      dir.default_namespace = 'twist'
    end
  end

  Container.register 'oauth.client', -> {
    OAuth2::Client.new(
      ENV.fetch('OAUTH_CLIENT_ID'),
      ENV.fetch('OAUTH_CLIENT_SECRET'),
      authorize_url: '/login/oauth/authorize',
      token_url: '/login/oauth/access_token',
      site: 'https://github.com',
      raise_errors: false
    )
  }

  Import = Dry::AutoInject(Container)
end

loader = Zeitwerk::Loader.new
loader.inflector.inflect "graphql" => "GraphQL"
loader.inflector.inflect "cors" => "CORS"
loader.push_dir Twist::Container.config.root.join("lib").realpath
loader.setup
```

Let's choose some wilful ignorance around that `oauth.client` code here -- I couldn't find a better place for it than here. I am _this_ close to just moving it out to a separate file called `oauth.rb`.

When this code defines a container for our application, it specifies `component_dirs` for that application. These are directories that contain code that is useful to our application. From here, twist specifies that anything in `lib` is something we want to register as components for this application. What's great about this is that we've set this application up to be autoloaded, and so things are only ever loaded when we reference them. You get this feature with Rails, sure, but you also get it in `dry-system` too.

That autoloading is taken care of by the [Zeitwerk] gem. This gem will notice when you're referencing a constant like `Twist::Entities::Book`, and if that constant hasn't been loaded, it will attempt to load it from the `lib/twist/entities/book.rb` file. Throughout this application, all constants follow this naming pattern of where the path to the file matches the namespacing of the constant.

There are two special cases for Zeitwerk here where we want to inflect some words different to how Zeitwerk might try to. For `GraphQL`, Zeitwerk would look for a directory called `graph_q_l` by default. We can inform Zeitwerk should look for a directory called `graphql` by specifying that inflection rule near the bottom of this file.

When this container is finalized (with a call to `finalize!` in `config/environment.rb`), it will scan through the `lib` directory and register everything underneath it as keys within the application container. As a small example of the keys registered, here's what happens when we ask the container for its keys:

```ruby
Twist::Container.keys
=> ["oauth.client",
 "database",
 "authorization.book",
 "entities.book",
 "entities.book_note",
 "entities.branch",
 "entities.chapter",
 "entities.comment",
 "entities.commit",
 "entities.element",
 "entities.footnote",
 "entities.image",
 "entities.note",
 "entities.note_count",
 "entities.permission",
 "entities.reader",
 "entities.section",
 "entities.user",
 ...
 ```

 These keys and their naming will be relevant in a minute.


## System Dependencies

`dry-system` has a concept of system dependencies -- parts of your application that you can opt-in to booting along with finalizing your application container. In Twist, we have a large `core` dependency in `system/boot/core.rb`:

```ruby

Twist::Container.boot(:core, namespace: true) do
  use :persistence

  init do
    require 'babosa'
    require 'redcarpet'
    require 'nokogiri'
    require 'pygments'
    require 'sidekiq'

    require 'dry/monads'
    require 'dry/monads/do'
  end

end
```

This file is responsible for requiring the different Ruby libraries that this application will need during its runtime.

The other file in this directory is called `persistence.rb`, and it defines the `persistence` system dependency:

```ruby
Twist::Container.boot(:persistence) do
  init do
    require "rom-repository"
    require "rom-changeset"
    require "sequel"
  end

  start do
    container = ROM.container(:sql, Sequel.connect(ENV['DATABASE_URL']), extensions: [:pg_json]) do |config|
      config.auto_registration(File.expand_path("lib/twist"))

      # config.gateways[:default].use_logger Logger.new(STDOUT)
    end
    register(:database, container)
  end
end
```

It is possible to configure these dependencies in such a way that `core` _could_ be booted separately from `persistence`, but I haven't found a reason to uncouple these yet.

In `persistence`, there's `require` statements for the persistence libraries, and then when the application starts up, a new container for ROM is created here. That container automatically registers ROM-specific things from `lib/twist`, which we'll see in a little while.

## Receiving webhook requests

Twist's primary purpose is to serve as a two-endpoint Rack app. The first endpoint -- `/books/:permalink/receive` -- is used by GitHub's webhooks system. The second is `/graphql`.

GitHub notifies Twist through the "receive" endpoint whenever a book's repository is updated. The route for this request is defined in the `web` part of Twist.

It's here that it's probably best to mention that Twist's backend is split into two distinct parts. There's the regular Ruby stuff, and the web stuff.

The "regular Ruby stuff" includes things like `Twist::Entities::Book`, a class that is used to represent data about a book within the application. The "regular" side of the application also includes more complicated things, such as the _relations_ and _repositories_ -- concepts from `rom-rb` that are used to define the interfaces between this Ruby code and the database. Let's not also forget to mention that the "regular" directory also contains _transactions_, which are classes that perform one, and only one, transaction within the application. Things like creating a new note, or inviting a new reader to a book.

Over on the "web" side of the application (`lib/twist/web`), you'll find the stuff you know and love from Rails: your router, your controllers, the actions.

The router is defined as a Hanami router:

```ruby
module Twist
  module Web
    Router = Hanami::Router.new do
      if ENV['APP_ENV'] == "development"
        require 'sidekiq/web'
        mount Sidekiq::Web, at: '/sidekiq'
      end

      post '/graphql', to: Controllers::GraphQL::Run.new
      options '/graphql', to: Controllers::GraphQL::Run.new

      post '/books/:permalink/receive', to: Controllers::Books::Receive.new

      get '/oauth/authorize', to: Controllers::Oauth::Authorize.new
      get '/oauth/callback', to: Controllers::Oauth::Callback.new
    end
  end
end
```

As you can see from this code, routes do not route to one giant controller class with several actions inside it. Instead, each action is its own class. This concept makes it much easier to jump to the code for one particular action, without being confused about what code is relevant to which action inside a controller -- like what might happen to you in a standard Rails application. An example of this is that the `authorize` and `callback` actions associated with the OAuth parts of this application are their own separate classes here.

We're straying a little off track there, so let's get back on track: the `/books/:permalink/receive` route. That route goes to the `Controllers::Books::Receive` action, which is defined in `lib/twist/web/controllers/books/receive.rb`. Note here that the path here matches the constant -- this is something that Zeitwerk enforces so that it can automatically load our constant when we need it.

This controller starts out in an interesting way:

```ruby
module Twist
  module Web
    module Controllers
      module Books
        class Receive < Hanami::Action
          include Twist::Import[
            find_book: "transactions.books.find",
            find_or_create_branch: "transactions.branches.find_or_create"
          ]
```

An _include_ statement at the top of a controller that isn't doing something like `include ApplicationHelper`? This certainly seems like some sort of black magic -- at least that's what I thought when I originally saw it.

What this is doing is including two helpful transactions from within our application's container. This code will find the classes registered under the keys `transactions.books.find` and `transactions.branches.find_or_create` and it will load those classes at this point. Not only are these classes loaded, but new instances of these classes are initialized at this point too. And _not only that_, but these instances are then made available through the methods `find_book` and `find_or_create_branch` within this controller.

This is made possible by another dry-rb gem called `dry-auto_inject`.

Later on this controller, we can refer to these instances and call the `call` method on these transactions by writing code such as:

```ruby
book = find_book.(permalink: req.params[:permalink])
```

And:

```ruby
branch = find_or_create_branch.(book_id: book.id, ref: payload["ref"])
```

Why would we write this code when we could write `Twist::Transactions::Books::Find.new.call(...)`? Well, because it's shorter for starters. But more than that, too. Because these actions are within their own classes, they have their own `initialize` method, and `dry-auto_inject` will define this `initialize` method like this:

```ruby
def initialize(find_book: Twist::Container['transactions.books.find'], find_or_create_branch: Twist::Container['transactions.branches.find_or_create'])
  @find_book = find_book
  @find_or_create_branch = find_or_create_branch
end
```

This means that we _could_ change away from the default values here to something else entirely. A good example of where we might like to do that is within tests. You'll see an example of this over in `backend/spec/twist_web/controllers/books/receive_spec.rb`.

```ruby
describe Twist::Web::Controllers::Books::Receive do
  let(:find_or_create_branch) do
    ->(book_id:, ref:) { branch }
  end

  subject do
    described_class.new(
      find_or_create_branch: find_or_create_branch,
      ...
    )
  end
```

The test for this action immediately stubs out `find_or_create_branch` and will return a `branch` object for whatever's passed in. Later on in the test, that variable is defined as:

```ruby
let(:branch) { double(Twist::Entities::Branch, name: "master") }
```

This means that we don't need to set up messy test data within factories -- we can stub out our transactions to return simple doubles here instead. This means that the tests for this controller action are remarkably quick. In fact, by following this pattern throughout the whole application all of the application's tests are remarkably quick! The slowest ones are ones that need to interact with a filesystem.

There are about 150 tests for this application so far and they take about 12 seconds to run.

Speaking of: when Twist receives a book, it enqueues that book for processing through one of its processor classes, either `Twist::Processors::Markdown::BookWorker` or its AsciiDoc equivalent. Let's look at what happens then.

## Background jobs

Receiving a webhook from GitHub takes a very short time. I really wish I could say the same for processing a book! However, there are some complexities here.

First, Twist needs to pull the latest changes from GitHub. By this point, Twist has only been _notified_ that changes have happened -- it doesn't exactly know what's changed. Twist runs a background job with Sidekiq that does a `git pull` on the book's Git repository. From there, Twist will read each of the book's chapters in a _separate_ background job and convert the chapters into HTML. From there, it processes each individual HTML element using classes such as `Twist::Processors::Markdown::ElementProcessor`. I won't go so much into this code, as it's more Twist-specific than applicable to other codebases.

The complexities here involve downloading the code from GitHub, and uploading the images to S3. Each image is processed as _another_ async job separate from the book and chapter async workers. The main issue here is that, for a few brief seconds, the _words_ of a chapter can be available on Twist, but sometimes the images will not have finished processing.

In the end, what we end up with in the database is a new commit from GitHub tied to the book, and under that commit are the relevant chapters, and under those chapters their elements, such as section headings, paragraphs and images.
