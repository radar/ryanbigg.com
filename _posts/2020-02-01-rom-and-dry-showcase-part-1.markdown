---
wordpress_id: RB-1580556354
layout: post
title: "ROM + Dry Showcase: Part 1"
---

The [rom-rb](https://rom-rb.org/) and [dry-rb](https://dry-rb.org/) sets of gems have come out in the last couple of years. These gems allow an alternative take on building a Ruby application, separate from Rails or Sinatra, or anything else like that.

In this _series_ of blog posts, I am going to show you how to build a simple application that I'm calling "Bix" using some of these gems. By the end of this series, the application will:

* Part 1 (you are here) - Interact with a database using ROM
* [Part 2 - Have validation and transaction classes](/2020/02/rom-and-dry-showcase-part-2)
* Part 3 - Test our application with RSpec
* Part 4 - Have a router and a series of actions

This part will cover how to start building out an application's architecture. We'll also work on having this application speak to a database. For this, we'll use the following gems:

* `dry-system` -- Used for loading an application's dependencies automatically
* rom, [rom-sql](https://rom-rb.org/5.0/learn/sql/) + pg -- We'll use these to connect to a database
* `dotenv` -- a gem that helps load `.env` files that contain environment variables
* `rake` -- For running Rake tasks, like migrations!

In this part, we will setup a small Ruby application that talks to a PostgreSQL database, by using the `dry-system`, `rom`, `rom-sql` and `pg` gems. At the end of this guide, we will be able to insert and retrieve data from the database.

If you'd like to see the code for this application, it's at [github.com/radar/bix](https://github.com/radar/bix), and each part of this series has its own branch.

## A word on setup costs

In these guides, you may get a sense that the setup of rom-rb and dry-rb libraries takes a long time -- maybe you'll think thoughts like "this is so easy in Rails!" These are normal and understandable thoughts. The setup of this sort of thing in Rails _is_ easier, thanks to its generators.

However, Rails leads you into an application architecture that paints you into a corner, for reasons I explained in [my "Exploding Rails" talk in 2018](https://www.youtube.com/watch?v=04Kq_9scT1E).

The setup of ROM and dry-rb things _is_ harder, but leads you ultimately into a better designed application with clearer lines drawn between the classes' responsibilties.

It might help to think of it like this: setup cost is a cost that you pay _once_, whereas ease-of-application-maintenance is a cost _every single day_.

So in the long run, this will be better. I promise.

## Installing Gems

To get started, we'll create an empty directory for our application. I've called mine `bix`. Inside this directory you will need to create a basic `Gemfile`:

```
source 'https://rubygems.org'

gem 'dry-system'
gem 'rom'
gem 'rom-sql'
gem 'pg'

gem 'dotenv'
gem 'rake'
```

Once we have created that `Gemfile`, we'll need to run `bundle install` to install all of those dependencies.

## Boot Configuration

Next up, we will create an environment for our application that will allow us to load dependencies of the application, such as files in `lib` or other dependencies like database configuration. We're going to use the `dry-system` gem for this.

Before we get to using that gem, let's create a file called `config/boot.rb`. This file will contain this code to load up our application's primary gem dependencies:

```ruby
ENV['APP_ENV'] ||= "development"

require "bundler"
Bundler.setup(:default, ENV["APP_ENV"])

require "dotenv"
Dotenv.load(".env", ".env.#{ENV["APP_ENV"]}")
```

The first line of code sets up an `APP_ENV` environment variable. Our application will use this environment variable to determine what dependencies to load. For instance, when we're developing our application locally we may want to use development gems like `pry`. However, when we deploy the application to production, we will not want to use those gems. By setting `APP_ENV`, we can control what gems are loaded by our application.

The first block of code here will setup Bundler, which adds our gem dependencies' paths to the load path, so that we can require them when we need to. Note that `Bundler.setup` is different from `Bundler.require` (like in a Rails application) -- `Bundler.setup` only adds to the load path, and does not require everything at the beginning.

 The two args passed here to `Bundler.setup` tell Bundler to include all gems outside of a group, and all gems inside of a group named after whatever `APP_ENV` is set to, which is `development`.

The first one that we require is `dotenv`, and that is just so we can load the `.env` or `.env.{APP_ENV}` files. When we're working locally, we'll want to have a `.env.development` file that specifies our local database's URL. Let's create this file now: `.env.development`:

```
DATABASE_URL=postgres://localhost/bix_dev
```

This file specifies the database we want to connect to when we're developing locally. To create that database, we will need to run:

```
createdb bix_dev
```

## Application Environment Setup

To setup our application's environment and use this database configuration, we're going to use that `dry-system` gem. To do this, we'll create a new file called `config/application.rb` and put this code in it:

```ruby
require_relative "boot"

require "dry/system/container"

module Bix
  class Application < Dry::System::Container
    configure do |config|
      config.root = File.expand_path('..', __dir__)
      config.default_namespace = 'bix'

      config.auto_register = 'lib'
    end

    load_paths!('lib')
  end
end
```

This code is responsible for loading our `boot.rb` file and defining a `Bix::Application` _container_. This container is responsible for automatically loading dependencies in from `lib` (when we have them!). This container is also responsible for handling how system-level dependencies for our application are loaded -- like how our application connects to a database.

To set that database connection up, we're going to create a new file over in `system/boot/db.rb`:

```ruby
Bix::Application.boot(:db) do
  init do
    require "rom"
    require "rom-sql"

    register('db.config', ROM::Configuration.new(:sql, ENV['DATABASE_URL']))
  end
end
```

This `system/boot` directory is where we put system-level dependencies when using `dry-system`. This new file that we've created configures how our application defines its database connection.

To connect to the database, we need to use the `rom` and `rom-sql` gems. On the final line of `init`, we register a database connection to be used. This will pull the `DATABASE_URL` variable from the environment, which by default will load the one specified in `.env.development`.

Now that we have our database connection defined and our database itself created, we will need to create tables in that database. If this was a Rails app, we would use migrations to do such a thing. Fortunately for us, ROM "borrowed" that idea and so we can use migrations with ROM too.

To create migrations with ROM, we will need to create another file to define the Rake tasks, called `Rakefile`:

```ruby
require_relative 'config/application'
require 'rom-sql'
require 'rom/sql/rake_task'

namespace :db do
  task :setup do
    Bix::Application.start(:db)
    ROM::SQL::RakeSupport.env = ROM.container(Bix::Application['db.config']) do |config|
      config.gateways[:default].use_logger(Logger.new($stdout))
    end
  end
end
```

This file loads the `config/application.rb` file that we created earlier and that will make it possible to require the other two files we use here.

In order to tell ROM's Rake tasks where our database lives, we're required to setup a Rake task of our own: one called `db:setup`. This configuration starts the system-level dependency `:db` by calling `start` on `Bix::Application`. This will run the code inside the `init` block defined within `system/boot/db.rb`. This `init` block registers a `db.connection` with our application, and we can retrive that value by using `Bix::Application['db.connection']` here.

Inside this configuration, we configure something called the _default gateway_, which is the simply the default database connection that ROM has been configured with. We _could_ configure multiple gateways, but we're only going to be using the one in this series. On this gateway, we tell it to use a new `Logger` instance, which will log SQL output for our Rake tasks.

### Migrations

Like a lot of database frameworks, ROM also comes with [migrations](https://rom-rb.org/5.0/learn/sql/migrations/). We can use these to create the tables for our application.

To generate a migration with ROM, we can run:

```
rake "db:create_migration[create_users]"
```

This will create us a new file under `db/migrate` and it'll be almost empty:

```ruby
# frozen_string_literal: true

ROM::SQL.migration do
  change do
  end
end
```

It's up to us to fill this out. Let's do so:

```ruby
# frozen_string_literal: true

ROM::SQL.migration do
  change do
    create_table :users do
      primary_key :id
      column :first_name, String
      column :last_name, String
      column :age, Integer

      column :created_at, DateTime, null: false
      column :updated_at, DateTime, null: false
    end
  end
end
```

In this migration, we've specified six columns. We've had to specify the `primary_key` here, because ROM does not assume that all primary keys are `id` by default.

To run this migration, we will need to run:

```
rake db:migrate
```

If we see this:

```
... INFO -- : Finished applying migration [timestamp]_create_users.rb, direction: up, took [duration] seconds
<= db:migrate executed
```

Then the migration has been successfully applied.

### Repositories

In order to get data into and out of database tables with ROM, we need to create something called a _repository_. A repository is a class that is used to define a clear API between your database and your application.

To create one of these, we'll create a new file inside a new directory structure at `lib/bix/repos/user_repo.rb`:

```ruby
module Bix
  module Repos
    class UserRepo < ROM::Repository[:users]

    end
  end
end
```

To use this class (and others that we will create later on), we'll need to create a new file at `system/boot/persistence.rb` to setup our database configuration for our application:

```ruby
Bix::Application.boot(:persistence) do |app|
  start do
    register('container', ROM.container(:sql, app['db.connection']))
  end
end
```

This file uses the `rom` gem to define a database configuration container and registers it with our application under the `container` key.

Next up, we'll create a new file over at `bin/console` with this in it:

```ruby
#!/usr/bin/env ruby

require_relative '../config/application'

Bix::Application.finalize!

require 'irb'
IRB.start
```

This file will load our application's `config/application.rb` file. When this file is loaded, all the files in `lib` will be required. This includes our new `lib/bix/repos/user_repo.rb` file.

We call `Bix::Application.finalize!` here to start our application and all of its dependencies, this includes the two system-level dependencies specified in `system/boot`.

Once those classes are loaded and the application is finalized `bin/console` will start an IRB prompt.

To make it so that we can run `bin/console`, let's run this command:

```
chmod +x bin/console
```

We can now launch our console by running:

```
bin/console
```

When we're in this console, we can use our repository:

```
>> Bix::Repos::User.new(Bix::Application['container'])
```

This code will tell our user repository to connect to the database specified by the configuration contained within `Bix::Application['container']`. But unfortunately for us, another key part of configuration is missing and so we're going to see an error when we run this code:

```
ROM::ElementNotFoundError (:users doesn't exist in ROM::RelationRegistry registry)
```

For this code to work, we're going to need one extra class: a _relation_.

### Relations

A _relation_ class is used to represent data returning from a database, and is used most often by the repository itself. If we had a need for complex methods for working with data, they would go in "messy" relation methods, and then the repository would call those methods.

Here's an example from an app that I've worked on recently. I want to have a function that works on a `notes` table, counting up all the notes for a particular set of _elements_. In my relation, I have this code:

```ruby
module Twist
  module Relations
    class Notes < ROM::Relation[:sql]
      schema(:notes, infer: true)

      def counts_for_element_ids(element_ids)
        where(element_id: element_ids)
        .select { [element_id, function(:count, :id).as(:count)] }
        .group(:element_id)
        .order(nil)
        .to_a
      end
    end
  end
end
```

The `counts_for_elements` method defines a _query_ that will run against my database, and the final `to_a` on that query will return a _dataset_; an array of elements with their note counts.

However, this query will only return counts for elements that have counts, rather than all specified elements. In this particular application, I want a count for all elements specified in `element_ids`, regardless if they have notes or not. The place for this particular logic is in the _repository_:

```ruby
module Twist
  module Repositories
    class NoteRepo < Twist::Repository[:notes]
      def count(element_ids)
        counts = notes.counts_for_elements(element_ids)

        missing = element_ids.select { |id| counts.none? { |c| c.element_id == id } }
        counts += missing.map { |m| NoteCount.new(element_id: m, count: 0) }
        counts.map { |element_id:, count:| [element_id, count] }.to_h
      end
    end
  end
end
```

The repository's code is all about working with the data. It does not know how to build the query for the data -- that responsibility is the relation's.

In short: relations run queries to get data out of a database, repositories define methods to work data returned by relations.

Back to Bix!

Let's define our relation now at `lib/bix/relations/users.rb`:

```ruby
module Bix
  module Relations
    class Users < ROM::Relation[:sql]
      schema(:users, infer: true)
    end
  end
end
```

This relation class inherits from `ROM::Relation[:sql]`, and that will meant hat our relation is used to talk to an SQL database.

Inside the class itself, there's a method called `schema`. This method says that our relation class is for a table called `users` and that we should _infer_ the attributes for that schema -- meaning ROM will look at the table to define the attributes for this relation.

This _almost_ gets us past the error we saw previously:

```
ROM::ElementNotFoundError (:users doesn't exist in ROM::RelationRegistry registry)
```

However, we will need to register relations with our application's database container. To do this, we can change `system/boot/persistence.rb`:

```ruby
Bix::Application.boot(:persistence) do |app|
  start do
    container = ROM.container(:sql, app['db.connection']) do |config|
      config.auto_registration(app.root + "lib/bix")
    end
    register('container', container)
  end
end
```

This file will now automatically register this relation under `lib/bix`, and any other ROM things we add in later. This means that our `User` repository will be able to find the `Users` relation.

Let's run `bin/console` again and try working with our repository again:

```
>> user_repo = Bix::Repos::User.new(Bix::Application['container'])
>> user_repo.all
NoMethodError (undefined method `all' for #<Bix::Repos::User struct_namespace=ROM::Struct auto_struct=true>)
```

Oops! Repositores are intentionally bare-bones in ROM; they do not come with very many methods at all. Let's exit the console and then we'll define some methods on our repository. While we're here, we'll add a method for finding all the users, and one for creating users. Let's open `lib/bix/repos/user_repo.rb` and add these methods:

```ruby
module Bix
  module Repos
    class UserRepo < ROM::Repository[:users]
      commands :create,
        use: :timestamps,
        plugins_options: {
          timestamps: {
            timestamps: %i(created_at updated_at)
          }
        }

      def all
        users.to_a
      end
    end
  end
end
```

The `commands` class method defines built-in commands that we can use on our repository. ROM comes with three: `:create`, `:update` and `:delete`.

 This one tells ROM that we want a method called `create` that will let us create new records. The `use :timestamps` at the end tells ROM that we want `create` to set `created_at` and `updated_at` when our records are created.

The `all` method here calls the `users` relation, and the `to_a` will run a query to fetch all of the users.

With both of these things in place, let's now create and retrieve a user from the database through `bin/console`:

```
user_repo = Bix::Repos::User.new(Bix::Application['container'])
user_repo.create(first_name: "Ryan", last_name: "Bigg", age: 32)
=> #<ROM::Struct::User id=1 first_name="Ryan" last_name="Bigg" age=32 ...>

user_repo.all
=> [#<ROM::Struct::User id=1 first_name="Ryan" last_name="Bigg" age=32 ...>]
```

Hooray! We have now been able to add a record and retrieve it. We have now set up quite a few components for our application:

* `config/boot.rb` - Requires boot-level pieces of our application -- such as Bundler and `dotenv`
* `config/application.rb` - Defines a Container for our application's configuration
* `system/boot/db.rb` - Specifies how our application connects to a database
* `system/boot/persistence.rb` - Defines a ROM container that defines how the ROM pieces of our application connect to and interact with our database
* `lib/bix/relations/users.rb` - Defines a class that can contain query logic for our `users` table
* `lib/bix/repositories/user.rb` - A class that contains methods for interacting with our relation, allowing us to create + retrieve data from the databse.

ROM and Dry separate our application into small, clearly defined pieces with individual responsibilities. While this setup cost feels large _now_, it's a cost that we're only going to be paying once; Setup cost is one-time, maintenance cost is forever.

### Entities

Now what happens if we want to add a custom method on to the objects returned by our database? Let's say, a `full_name` method that would let us combine a user's `first_name` and `last_name` attributes. Currently these are `ROM::Struct::User` objects, returned from ROM. There isn't a place to define these methods in our application yet. So let's create one!

To be able to define custom methods like `full_name` for users, we're going to need a class. For this, ROM has a feature called _entities_. These are simple classes that can be considered as super-powered structs. Let's build a new one by creating it in a new directory called `lib/bix/entities`, and calling it `user.rb`:

```ruby
module Bix
  class User < ROM::Struct
    def full_name
      "#{first_name} #{last_name}"
    end
  end
end
```

Ignoring [the falsehoods programmers believe about names](https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/), this method will combine a user's `first_name` and `last_name` attributes.

To use this class though, we need to configure the repository further over in `lib/bix/repos/user_repo.rb`:

```ruby
module Bix
  module Repos
    class UserRepo < ROM::Repository[:users]
      struct_namespace Bix

      ...
    end
  end
end
```

This `struct_namespace` method tells the repository that when it builds structs, it can use the `Bix` namespace for those structs. The class name will be the singularised version of the relation specified in the `ROM::Repository` class inheritance: `Bix::User`.

Let's go back into `bin/console` and try this out:

```ruby
user_repo = Bix::Repos::User.new(Bix::Application['container'])
user_repo.all.first.full_name
# => "Ryan Bigg"
```

Great! We're now able to have a class that contains custom Ruby logic for the data that is returned from the database.

## Specifying the container automatically

When we initialize our repository, we have to use some really long code to do that:

```ruby
user_repo = Bix::Repos::User.new(Bix::Application['container'])
```

What if we were able to do this instead?

```ruby
user_repo = Bix::Repos::User.new
```

Wouldn't that be much nicer?

Well, with another one of the `dry-rb` set of gems, we can indeed do this. The last gem that we'll use in this part is one called `dry-auto_inject`. This gem will make it so that the _dependency_ of the _database container_ will be _auto(matically) injected_ into the `Bix::Repos::User` class.

Let's get started with this gem by adding the `dry-auto_inject` gem into our `Gemfile`:

```ruby
gem 'dry-auto_inject'
```

Then we'll run `bundle install` to install this gem.

Next up we'll add two lines to `config/application.rb`. The first one is to require this gem:

```ruby
require "dry/auto_inject"
```

Next, we'll need to define a new constant in this file:

```ruby
module Bix
  class Application < Dry::System::Container
    ...
  end

  Import = Dry::AutoInject(Application)
end
```

This `Import` constant will allow us to import (or _inject_) anything registered with our application into other parts. Let's see this in action now by adding this line to `lib/repos/user_repo.rb`:

```ruby
module Bix
  module Repos
    class UserRepo < ROM::Repository[:users]
      include Import["container"]

      ...
    end
  end
end
```

This line will use the `Import` constant to inject the `container` dependency into this class. This works by passing in a `container` keyword argument to `initialize` for this class.

Let's try initializing a repository again in `bin/console`:

```ruby
user_repo = Bix::Repos::User.new
# => #<Bix::Repos::User struct_namespace=Bix auto_struct=true>
user_repo.all.first.full_name
# => "Ryan Bigg"
```

Everything seems to be working correctly!

### Summary

In this first part of the ROM + Dry showcase, we've seen how to setup a small application that can talk to a database.

We have created files that allow us to bootstrap our application's environment -- `config/boot.rb` and `config/application.rb`. Along with this, we have created `system/boot`, a directory that contains system-level dependencies for our application's boot process.

In the `lib` directory, we have setup three directories:

* `entities` - Classes that represent specific data types returned from our database.
* `relations` - Classes that can contain custom methods for querying the database
* `repos` - Classes that provide a place for defining a public API between relations and our application code

This separation of concerns across our application will make it easier to work with in the long run. One more time: the setup cost is paid _once_, the maintenance cost is paid _forever_.

In the last part of this guide, we used the `dry-auto_inject` gem to inject the ROM container dependency into our `Repos::User` class. This will allow us to reduce the code that we need to write whenever we want to initialize the repository.

In the next part, we're going to look at how to use more dry-rb gems to add validations to our application, and we'll see another benefit of `dry-auto_inject` demonstrated.
