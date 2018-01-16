---
wordpress_id: RB-1515709032
layout: post
title: Exploding your Rails app with dry-rb and rom
published: false
---

When Rails came out, it was revolutionary. There was an order to everything.

Code for your business logic or code that talks to the database _obviously_
belongs in the model.

Code that presents data in either HTML or JSON formats _obviously_ belongs in
the view.

Any special view logic goes into helpers.

The thing that ties all of this together is _obviously_ the controller.

It was (and still is) neat and orderly. Getting started with a Rails
application is incredibly easy thanks to everything having a pre-assigned home.

The Rails Way™ enforces these conventions as a suggestive way that this is the
One True Way™ to organise a Rails application. This Rails Way™ suggests that,
despite there being over a decade since Rails was crafted, that there still is
no better way to organise an application than the MVC pattern that Rails
originally came with.

While I agree that this way is still extremely simple and great for getting
started within a Rails application, I do not agree that this is the best way to
organise a Rails application in 2018 with long-term maintenance in mind. A
decade of Ruby development has produced some great alternatives to Rails' MVC
directory structure.

In this guide, I want to show an _alternative_ viewpoint on how a Rails
application should be organised. It is not to say that this is The Rails Way™
2.0 and everyone would be silly to stick with The Original Rails Way™. It's merely
an _alternative_ viewpoint that I think will lead to applications that are
easier to work with over the longer-term. Think of it as a suggestion.

The Original Rails Way™ falls down in at least two major areas in my opinion:
models and controllers.

Due to the lack of choice in a Rails application, most of a Rails application's
code usually ends up in the model. Where does business logic go? The model.
Where do validations go? The model. Where do you define queries for working
with the database? The model. How do you persist a model instance back to the
database? The model takes care of that. The end result after even just a few
months can be unsightly. All this logic is muddled up as the model is the only
One True Place to put this sort of code. Rails provides no other sensible
choices; it _must_ go in the model.

The controllers aren't any better. In the controller you have code that talks
to the models, asking them to create, read, update or delete records in a
database. And then this controller code might do more: send emails, enqueue
background jobs, make requests to external services. There is no
pre-determined, widely agreed-upon location for this logic; the controller is
the place.

Testing all these intertwining parts individually is hard work. To make sure
that it all works together, you often have to write many feature and/or request
tests to test the different ways that the controller is called and utilized.
The logic of the controller's actions get intimiately accquainted with the
request for that action. The lines between the incoming request, the business
logic and the outgoing response become blurred. The controller's
responsibilities are complex.

If the controller action is even mildly complex, then the solution is to just
add more private methods to the controller. But then you have a jumble of
private methods at the bottom of the controller, with no clear indications of
what methods are used in what actions. It can be quite a mess. Or you'll just
go ahead and chuck a method into `ApplicationController` because
greater-than-one controllers use that method.

In this guide, I want to show an alternative viewpoint on how you can structure
code that talks to a database, as well as an alternative viewpoint on code that
would _usually_ belong in a controller. This code leads to a clearer separation
of concerns between the many different responsibilities of a Rails application.
Code doesn't just have to go into controllers, models, views and helpers. We
can explode it apart better than that.

The Rails Way™ doesn't have to be the _only_ way. In recent years, there's been
a groundswell of support behind gems like [rom-rb](http://rom-rb.org/), and the
[dry-rb](http://dry-rb.org/) suite of gems. These gems can make your
application's code leaner, cleaner and simpler to understand. In this guide,
I'll demonstrate how you can use them to clean up some code that you might
write in a Rails application.

But first, I want to go more into depth about the problems with Active Record
models.

### The problems with Active Record Models

An Active Record model is responsible for _at least_ the following things:

* Mapping database rows to Ruby objects
* Containing validation rules for those objects
* Managing the CRUD operations of those objects in the database (through
  inheritance from `ActiveRecord::Base`)
* Containing complicated database queries
* Containing business logic for your application

In traditional Rails models, all of this gets muddled together in the model,
making it very hard to disentangle code that talks to the database and code
that is working with plain-Ruby objects.

For instance, if you saw this code:

```ruby
class Project < ApplicationRecord
  has_many :tickets

  def contributors
    tickets.map(&:user).uniq
  end
end
```

You might know _instinctively_ that this code is going to make a database call
to the `tickets` association for the `Project` instance, and then for each of
these `Ticket` objects it's going to call its `user` method, which will load a
`User` record from the database.

Someone unfamiliar with Rails -- like, say, a junior Ruby developer with very
little prior Rails exposure -- might think this is bog-standard Ruby code
because that's _exactly_ what it looks like. There's something called
`tickets`, and you're calling a `map` method on it, so they might guess that
`tickets` is an array. Then `uniq` further indicates that. But `tickets` is an
association method, and so a database query is made to load all the associated
tickets.

This kind of code is very, very easy to write in a Rails application because
Rails applications are intentionally designed to be easy. ["Look at all the
things I'm _not_ doing"](http://youtu.be/Gzj723LkRJY) and all that.

However, this code executes one query to load all the `tickets`, and then one
query _per ticket_ to fetch its users. This is a classic N+1 query, which Rails
does not stop you from doing. It's a classic Active Record footgun. Active
Record makes it _much_ too easy to call out to the database from within the
model.

This code combines business logic intent with database querying and it's _the_
major problem with Active Record's design. And
[mongoid](https://rubygems.org/gems/mongoid)'s too, since it also follows the
Active Record pattern.

Database queries are cheap to make because Active Record makes it so darn easy.
When looking at the performance of a large, in-production Rails application,
the number one thing I come across is slow database queries caused by methods
just like this. Active Record makes it way too easy to make calls to the
database. Once these database calls are ingrained in the model like this and
things start depending on those calls being made, it becomes hard to refactor
this code to reduce those queries. Even tracking down where queries are being
made can be difficult due to the natural implicitness that _some_ method calls
produce database queries.

The intention here with the `contributors` method is very innocent: get all the
users who have contributed to the project by iterating through all the tickets
and finding their users. If we had a `Project` instance ([with thousands of
tickets](https://github.com/rails/rails)), running that contributors method
would cause thousands of database queries to be executed against our database.

Of course, there is a way to make this all into two queries through Rails:

```ruby
class Project < ApplicationRecord
  def contributors
    tickets.includes(:user).map(&:user).uniq
  end
end
```

This will load all the tickets _and_ their users in two separate queries,
rather than one for tickets and then one for each ticket's user, thanks to the
_power of eager loading_. (Which you can [read more about in the Active Record
Querying
guide](http://guides.rubyonrails.org/active_record_querying.html#eager-loading-associations).)

You can of course not load all the tickets at the start either, you could load
only the 100 most recent tickets:

```ruby
class Project < ApplicationRecord
  def contributors
    tickets.recent.includes(:user).map(&:user).uniq
  end
end
```


But I think this is still too much of a mish-mash of database querying and
business logic. Where is the clear line between database querying and business
logic in this method? It's hard to tell. This is because Active
Record _allows_ us to do this sort of super-easy querying; intertwining
Active Record's tentacles with our business logic.

Active Record’s simplicity makes it incredibly easy to get going, but in the
long-haul of a Rails project Active Record makes a model’s code hard to work
with. It’s not so straightforward to just work with an instance of a model and
not have the database be involved. Methods can intentionally or unintentionally
make database calls. Active Record makes it far too easy to call out to the
database, as we can see with the contributors method example at the start of
this guide.

It should be possible to work with the business logic of your application
without these calls being made; and without the database at all. Being able to
reach into the database from your business logic _should_ be hard work. Your
business logic should have everything it needs to work by that stage. The model
should only contain this business logic — not knowing also about that
data’s validations, callbacks or persistence too. If a model knows about those
things, it has too many responsibilities.

The Single Responsibility Principle says that a class or a module should only
be responsible for one part of the application. It should only have one reason
to change. An Active Record model of any meaningful length has many different
reasons to change. Maybe there’s a validation that needs tweaking, or an
association to be added. How about a scope, a class method or a plain old
regular method, like the contributors one? All more reasons why changes could
happen to the class.

Active Record flies in the face of the Single Responsibility Principle. I would
go as far as to say this: Active Record leads you to writing code that is hard
to maintain from the very first time you set foot in a Rails application. Just
look at any sizeable Rails application. The models are usually the messiest
part and I really believe Active Record is the cause.

Having a well-defined boundary between different pieces of code makes it easier
to work with each piece. Validations and persistence should be their own
separate responsibilities and separated into different classes, as should
business logic. There should be a class that only has the responsibility to
talk to the database. Clear lines between the responsibilities here makes it so
much easier to work with this code.

It becomes easier then to say: this class works with only validations and this
other class talks to the database. There's no muddying of the waters between
the responsibilties of the classes.

ROM draws these crystal clear lines in a simple manner. There’s code to talk to
the database in one file. Code to validate that data in another. And so on. The
design patterns that ROM encourages are leaps and bounds better than Active
Record. This guide will serve as an example of that.

We're going to use the rom-rb suite of gems -- and some from the dry-rb suite
too -- to interact with our database and to write better code for working with
objects from a database. We'll keep our validation and persistence logic
completely separate to our business logic. You will be amazed at the
cleanliness once we're done.

We'll loop back around to controllers and their organisation after this work
with ROM.

### Installing ROM

[ROM](http://rom-rb.org/) (Ruby Object Mapper) is a suite of gems designed to
make it easy to work with databases, but not as easy as Active Record. That is
an intentional design decision. ROM favours explicitness over implicitness, and
in my opinion that leads to better code design.

Rather than having a single class that encapsulates all of the logic of working
with databases, ROM chooses to split this logic over several separate classes:

* Mapping database rows to Ruby objects (Mappers)
* Containing validation rules for those objects (Validation schemas, with the
  [dry-validation](https://github.com/dry-rb/dry-validation) gem.
* Managing the CRUD operations of those objects in the database (Repositories)
* A place to put complicated database queries (Relations)
* Containing business logic for your application (Plain Ol' Ruby Classes)

This makes it easier to test each part individually. The business logic in your
Plain Ol' Ruby Class isn't interspersed with Active Record methods. It's not
easy to make database queries from this object. Instead, it works as an
individual unit in your application. It's the Relations classes that will make
those database queries instead.

The easiest way to show you how this approach is better than the Active Record
one is to demonstrate it within a brand new Rails application, free from Active
Record.

Here's a Rails 5.1.4 application I've prepared earlier: https://github.com/radar/exploding-rails-rom-dry-example-app

It has [a few
modifications](https://github.com/radar/exploding-rails-rom-dry-example-app/commit/2c4d6a7b8b9a5548b4aeaaec43e47dea7a61df72)
to the regular app:

* `config/application.rb` has been re-configured to not require `rails/all`,
  but to instead pick-and-choose the components of Rails we want. The list
  explicitly does _not_ include `active_record/railtie`, which would load
  Active Record.
* `config/environments/development.rb` had this line removed:
  `config.active_record.migration_error = :page_load`. There's no point
  configuring Active Record if it is removed.
* The `Gemfile` includes the `pg`, `rom-rb` and `rom-sql` gems, which we'll be
  using to interact with a database.
* There's a new initializer at `config/initializers/rom.rb`, which configures a
  default database connection for ROM to use. This was taken from the [ROM
  documentation, "Rails
  Setup"](http://www.rom-rb.org/4.0/learn/getting-started/rails-setup/). This
  initializer loads the `DATABASE_URL` environment variable, which is
  configured in `.env`.  This `.env` file is loaded by the `dotenv-rails` gem
  in the `Gemfile`, but only in the `development` environment.
* The `Rakefile` has this line in it: `require 'rom/sql/rake_task'`. This
  requires the Rake tasks for generating / running migrations from the
  `rom-sql` gem. We'll need these because Active Record's aren't going to be
  available.

These modifications are necessary to remove Active Record completely and to set
up ROM in our application.

To create the database for this application, there isn't a Rake task anymore,
but we can instead use PostgreSQL's `createdb` command which has the added
bonus of being really quick because it doesn't have to load an entire Rails
application:

```
createdb blog_dev
```

With our database created and configuration in place, our application should
boot successfully if we run a `rails c` session:

```
Running via Spring preloader in process 14685
Loading development environment (Rails 5.1.4)
irb(main):001:0>
```

Great! Now let's start generating the pieces for our application.

### Generating our first ROM-powered relation, repository, mapper, model and migration

The first thing we'll look at with ROM is relations. Relations are where the
queries to your tables belong. We'll gradually work up to the ROM-equivalent of
our `Project#contributors` method. To start off, we'll generate a `Project`
relation by running the generator provided by the `rom-rails` gem:

```
rails g rom:relation project
```

This generates a file at `app/relations/project_relation.rb`:

```ruby
class ProjectRelation < ROM::Relation[:sql]
  gateway :default

  schema(:projects, infer: true)

  # define your methods here ie:
  #
  # def all
  #   select(:id, :name).order(:id)
  # end
end
```

This relation is configured to use the gateway specified in
`config/initializers/rom.rb`. Then, the schema of the `projects` table of the
database is inferred automatically with the `schema` method's call. We could
choose to specify each of the attributes of the table [manually ourselves if we
wished](http://rom-rb.org/4.0/learn/core/schemas/#defining-schemas-explicitly),
but with `infer: true` we don't have to do that.

The commented out lines of code hint at what this relation class is for. It
shows that you _could_ define an `all` method that fetched the `id` and `name`
fields for the records in the table, and ordered those records by their `id`
fields. For now, we'll leave this code commented out.

Relations in ROM don't work alone; they need a repository. Repositories in ROM
are classes that your application calls to perform queries on the database.
These repository classes call out to the `Relation` classes to perform the
queries on your database. Before we can make any queries to our database, we'll
need a repository. Let's generate one now:

```
rails g rom:repository project
```

This generates a new file at `app/repositories/project_repository.rb`:

```ruby
class ProjectRepository < ROM::Repository::Root
  root :projects

  commands :create, update: :by_pk, delete: :by_pk, mapper: :project
end
```

This Repository class will let us perform queries on our database. It defines
the `root` to be `:projects`, which will use the `ProjectRelation` that we
generated just before.

The `commands` line here gives us a few commands by default: `create`,
`update` and `delete`. These will allow us to do 3-out-of-4 CRUD actions to our
database. We'll cover the 4th action (Read) in a moment.

The `mapper` configuration option on the end here tells ROM that when we
perform `create`, `update` or `delete` actions on our database that we want to
map those objects using a _mapper_, rather than ROM's default of returning
straight hashes. By default ROM will return objects like this:

```
{id: 1, name: "Test Project"}
```

But with this `mapper` option, it will convert those hashes into model instances
by using the mapper. We can create the mapper by running another generator
command:

```
rails g rom:mapper project
```

This generates the following code at `app/mappers/project_mapper.rb`:

```ruby
class ProjectMapper < ROM::Mapper
  relation :projects

  register_as :project

  # specify model and attributes ie
  #
  # model Project
  #
  # attribute :name
  # attribute :email
end
```

The `relation` line tells the mapper what relation this mapper links to. The
`register_as` registers this mapper as a mapper for `:project` resources. This
name _must_ match up with the name used in our `ProjectRepository`'s `command`
line.

The commented out lines here define the behaviour of the mapper. Let's
uncomment these and transform them into this:

```ruby
class ProjectMapper < ROM::Mapper
  relation :projects

  register_as :project

  model Project

  attribute :name
end
```

The `model` line tells the mapper which class to use to initialize new objects
during the mapping. The hashes returned from calls to our database via the
repository will be turned into `Project` instances. With the `attribute` line
here, we're telling the mapper that despite whatever the Hash may contain,
we're only interested in the `name` attribute so far.

The final piece of this puzzle is the `Project` class itself. This class will
be used to represent `Project` instances in your application, much like how a
traditional Rails model is used.

There isn't a generator for this class (because Active Record is gone and ROM
doesn't provide one), so we must create it ourselves. Thankfully, the process
is easy.

#### Creating a model class

We might be tempted here to reach for `ActiveModel::Model` here, as its
supposed to turn regular classes into ones that will be compatible with your
Rails app's forms, and calls like `Project.new(name: "New Project")`. While
this is true, it also adds in some class-level validation methods, and this
means that if we use `ActiveModel::Model` inside our class, it will still fall
prey to combining validation and business logic in the one class. This is the
sort of thing that we're trying to avoid by not using Active Record in the
first place. We're very intentionally here trying to keep our business logic
and validation separate to make our code very easy to understand.

It's for this reason that we're going to use one of dry-rb's gems:
[dry-struct](https://dry-rb.org/gems/dry-struct). This gem provides an
interface similar to another one of Piotr Solnica's gems:
[virtus](https://rubygems.org/gems/virtus). The main difference here is that
there is no attribute writers for the instances once they're initialized. For
instance, in a Rails or Virtus "model" you are able to do this:

```ruby
project = Project.new(name: "A name")
project.name = "A new name"
```

But in `dry-struct` instances, there are no attribute writers and so you can't
do this in your code at all. Instead, you would need to create a new instance
with the same attributes.

Then first thing that we need to do to use this gem is to add it to our
`Gemfile`:

```ruby
gem "dry-struct", "~> 0.4.0"
```

And then to run `bundle install`.

The second thing we need to do to use `dry-struct` is to define a `Types` module
within our application. This `Types` module provides some attribute types for
things like strings and integers that we can use to enforce that attributes are
of a given type on our model classes. You may also define custom types in this
module, if you wish.

We'll define this `Types` module at `lib/types.rb`:

```ruby
module Types
  include Dry::Types.module
end
```

To learn more about dry-types, I recommend reading the [documentation site for
dry-types](http://dry-rb.org/gems/dry-types/).

Next up, we'll create a class that will act as a root for all our application's
models. This class will be similar to `ApplicationRecord`, in that it defines
logic that is common to _all_ models in the application. We'll define this new
model at `app/models/application_model.rb`:

```ruby
require 'types'

class ApplicationModel < Dry::Struct
  def self.inherited(klass)
    super

    klass.extend ActiveModel::Naming
    klass.include ActiveModel::Conversion

    klass.constructor_type :schema

    klass.attribute :id, Types::Strict::Int.optional
  end

  def persisted?
    id.present?
  end
end
```

This class does quite a few things. The first thing is that it inherits from
`Dry::Struct`. By inheriting from `Dry::Struct`, this model acts in a similar
fashion to the Active Record models we know and... well, the ones we know.

`Dry::Struct` allows us to create new instances of this model, just like we would with a
traditional model. For example, we will still be able to run this code in `rails console`
to get a new `Project` instance with a `name` attribute set to the specified
value:

```ruby
Project.new(name: "Test Project")
```

This class defines an `inherited` method, which is automatically called
whenever another class inherits from this one. This method initially calls
`super`, which will call `Dry::Struct`'s own `inherited` method.

Immediately after the `super`, we extend the class with
the `ActiveModel::Naming` module. This adds methods to the
instances of any model, and you can read about what methods that provides [in
the
ActiveModel::Naming](http://api.rubyonrails.org/classes/ActiveModel/Naming.html)
API documentation. Particularly helpful from this particular module is the
`model_name` method, which is used in polymorphic URL routing (i.e.
`redirect_to project`) -- the kind of routing that `form_for(@project)` uses to
determine where to submit the form to. Very helpful!

The `ActiveModel::Conversion` module after that adds in methods like `to_model`
and `to_param`. These methods are used in Rails also for routing and forms.
Also helpful! This also adds a `to_partial_path` method, which will generate a
path like `"projects/project"`, so you could use code such as this in your view
to render a project partial:

```erb
<%= render @project %>
```

This is the same as writing:

```erb
<%= render partial: "projects/project", project: project %>
```

You can [read about
ActiveModel::Conversion](http://api.rubyonrails.org/classes/ActiveModel/Conversion.html)
in the Rails API docs too.

While the additions of these two modules to all our models does make it so that
our model is responsible for knowing more than just our regular run-of-the-mill
business logic, it is a necessary evil to ensure that these model instances are
compatible with Rails and can be used just like regular model instances within
a Rails app.

We _could_ avoid doing this, but the code might seem a little too alien from
the Rails that we're used to, so I am suggesting this little bit of "evil" to
save some time.

The next two lines are from `Dry::Struct`. They are setting the constructor
type and an `id` attribute on classes that inherit from `ApplicationModel`.
The `constructor_type` method tells the `dry-struct` gem that if we initialize
this object with missing keys -- like in the above example how we're missing
the `id` attribute -- that the default for that attribute (or `nil`) should be
used instead. If we didn't specify this `constructor_type`, `Dry::Struct` would
make it so that we needed to specify all the attributes:

```ruby
Project.new(id: 1, name: "Test Project")
```

But in our application, we will want to use these model instances to represent
objects that haven't yet been persisted back to the database; objects that
_don't_ have an `id` parameter. For instance, in our `new` action for a
`ProjectsController` -- yet to be
written, but stay with me -- we would expect this code to work just fine:

```ruby
def new
  @project = Project.new
end
```

We don't know what the `id` or `name` of the object at this point, and so we
can't specify either of them. The model must be OK with us leaving these out,
and so this is why we use the `constructor_type :schema` line: it relaxes
`Dry::Struct` a touch.

Underneath `constructor_type`, we outline that the models should have an `id`
attribute that is optional.By using `Types::Strict` for this attribute, if we
pass in something other than `id` as an integer the type checking built into
`Dry::Struct` will complain:

```ruby
Project.new(id: "not-an-integer-id")
Dry::Struct::Error ([Project.new] "not-an-integer-id" (String) has invalid type
for :id violates constraints (type?(Integer, "not-an-integer-id") failed))
```

This error emssage tells us that `Project.new` expects `id` to be an integer,
but it's not. This is a good idea because it enforces at the class-level that
all attributes of the model must be of a particular type. How many times have
you tried to add a number to an attribute, only to realise the attribute is a
string, not an integer? By using `Dry::Struct` we prevent these sort of issues.

The only special bit of logic required here that we have to hand-roll in the
`ApplicationModel` class is the `persisted?` method, which is used by Rails
helpers like `form_for` / `form_with` to determine if the form should make a
`POST` request to the `create` action or a `PUT` request to the `update` action
in a controller. You might ask how that all works, so here's [a separate blog
post explaining polymorphic routes in
Rails](http://ryanbigg.com/2012/03/polymorphic-routes) for your consumption /
enjoyment.

The short version is this: if the record has been persisted to the database
then it will have an `id`. This makes `persisted?` return `true`, and
`form_for` will then send its form submission to a route like `PUT
/projects/1`. If the record isn't in the database then it won't have an `id`,
and therefore `persisted?` will return `false`. The `form_for` will then submit
to the `create` action of the resource, using a route like `POST /projects`.
This is a pretty great feature of Rails: that we can use the same form for two
different actions. So we'll use this `persisted?` method to make our model play
nice with Rails' form helpers.

Ok, we've spent a lot of time talking about our model but we haven't created it
yet. Let's go ahead and create a new `Project` model at
`app/models/project.rb` and make that model inherit from `ApplicationModel`:

```ruby
class Project < ApplicationModel
  attribute :name, Types::Strict::String
end
```

In this model we define the model-specific attributes. In this case, our
`Project` model will only just have an id (from `ApplicationModel`) and a
`name` parameter.

If we go into our Rails console, we should be able to initialize a new instance
of this class with a hand-specified `id` and `name` attribute:

```ruby
Project.new(id: 1, name: "Test Project")
=> #<Project id=1 name="Hi">
```

Great! Our model is working. Code similar to this is how our mapper will
translate the hashes returned from the repository into instances of the `Project`
class.

Notice how the `Project` class here contains _no_ information at all about how
this entity is validated or even persisted to the database. It's a
plain-ol'-ruby class that is accentuated with `Dry::Struct`.

We've now created a relation, a repository, a mapper and a model. We've
_exploded_ our traditional Rails model into 4 distinct files with 4 distinct
responsibilities:

* Relation: contains logic for making database queries
* Repository: Talks to relation, asks it to do the queries on the database
* Mapper: Converts Hash results from Repository commands (create, update,
  delete) to instances of the `Project` class
* Model: A bare-bones representation of `Project` records within our
  application, accentuated with some hand-picked pieces of `ActiveModel`.

There's a clear _single responsibility_ for each of these classes that is
sorely lacking in a traditional Rails model. Exploding our Rails model into
these 4 parts makes it so much easier to reason about where particular logic
goes already, leading to smaller and easier-to-reason-about classes.

We're missing one last thing before we can see this in action, though: the
migration. Fortunately, `rom-sql` provides a Rake task for generating
migrations, so let's create one now:

```
rake db:create_migration[create_projects]
```

This will generate a migration in the usual place (`db/migrate`) and it will
look empty:

```ruby
ROM::SQL.migration do
  change do
  end
end
```

It's up to us to fill this migration out, so let's do that now:

```ruby
ROM::SQL.migration do
  change do
    create_table :projects do
      primary_key :id
      column :name, String, null: false
    end
  end
end
```

If you've used the [`sequel` gem](https://rubygems.org/gems/sequel) before, you
might recognise the syntax. This is because this syntax _is_ from the Sequel
gem! The `rom-sql` gem uses it under the hood to speak to the database. If you
want to learn more about migrations, read the [Sequel
migrations](https://github.com/jeremyevans/sequel/blob/master/doc/migration.rdoc)
documentation.

This migration will now create a table called `projects`. That table will have
a primary key called `id`, and it will have a `name` column that's a `String`,
and that column's values can _never_ be null thanks to the `null: false`
option.

We can run this migration the traditional way:

```
rake db:migrate
```

When you see this:

```
<= db:migrate executed
```

It means that the migrations have been completed successfully. It's not the
pretty output of Rails's `db:migrate`, but it does the job.

### Creating a record

Now that we have all our parts setup, let's actually do something with them.
We'll boot up a rails console session again and this time we'll create a new
project using our repository:

```
repo = ProjectRepository.new(ROM.env)
project = repo.create(name: "Test Project")
```

We must initialize the repository with `ROM.env` here, as that object contains
configuration data about how to connect to our database. Go ahead and peak at
what `ROM.env` is in the console:

```
ROM.env
=> #<ROM::Container gateways...
```

Once we've initialized the repository, we can then perform commands against it.
We call the `create` command on the `repo`, passing it attributes just like we
would with `Model.create` within a regular Rails app.

The return value here is a `Project` instance:

```
=> #<Project id=1 name="Test Project">
```

But how does the `create` method know to return a `Project` instance? When we configured our `ProjectRepository` earlier, we specified a `mapper` for our `create`, `update` and `delete` commands:

```ruby
commands :create, update: :by_pk, delete: :by_pk, mapper: :project
```

This configuration option tells the repository to use the `ProjectMapper`
class:

```ruby
class ProjectMapper < ROM::Mapper
  relation :projects

  register_as :project

  model Project

  attribute :name
end
```

This `ProjectMapper` class defines its `model` as `Project`, and that's how our
repository knows what class to use for objects returned by `create`.

This instance `Project` is a very lightweight one. It can respond to `id`, `name` and
`persisted?`:

```ruby
>> project.id
=> 1
>> project.name
=> "Test Project"
>> project.persisted?
=> true
```

The object (and its class) knows nothing about how it was brought into being.
The class knows only the bare essentials that it needs to know in order to
accomplish its job. It can't execute any more database queries. That's someone
else's job.

Ok, so this is well and good but how do we tie this to our Rails application?
How do we make it so that people can create projects using ROM through the app?
Well, let's take a look at that now.

### Connecting a Rails controller with ROM

In this guide, I'm not suggesting to get rid of everything that Rails contains.
So far, just Active Record. Some zealots would have you ditch everything Rails
entirely, but I think Rails has some good parts too, namely things like its
router and views. Controllers in Rails can be great too, just as long as the
logic in those controllers is kept to a minimum of handling incoming requests
and outgoing responses.

In this section, we're going to use those traditional parts of Rails in
conjunction with the ROM code that we've just written. We're going to write a
skinny controller to interact with our skinny ROM code.

We're going to start by create a form that lets users of this application create
projects. It's going to be a traditional Rails form:

<IMAGE GOES HERE>

The only thing special about this form is that it's going to submit data to a
controller action, and that action is going to insert data into a database
using ROM instead of Active Record.

We can start out this part by writing a feature to ensure that our code works:

```ruby
require "rails_helper"

RSpec.feature "Users can create new projects" do
  scenario "with valid attributes" do
    visit "/"

    click_link "New Project"

    fill_in "Name", with: "Sublime Text 3"
    click_button "Create Project"

    expect(page).to have_content "Project has been created."
  end
end
```

I won't walk through each step of this -- [Rails 4 in
Action](https://manning.com/books/rails-4-in-action) does that already.
Instead, I'll assume you know what this test does; or at least you can read it
well enough to understand it.

Let's setup the routes for all of this in `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  root to: "projects#index"
  resources :projects
end
```

And we'll setup the controller like this in
`app/controllers/projects_controller.rb`:

```
class ProjectsController < ApplicationController
  def new
    @project = Project.new
  end

  def create
    repo.create(project_params)
    flash[:notice] = "Project has been created."
    redirect_to projects_path
  end

  private

  def project_params
    params.require(:project).permit(:name).to_h.symbolize_keys
  end

  def repo
    ProjectRepository.new(ROM.env)
  end
end
```

Important to note here is the `repo` method right at the end which instantiates
a new `ProjectRepository` instance, just as we've done in the controller. The
`create` action in this controller looks almost _exactly_ like a normal
`create` action, but rather than calling `create` on the model class (i.e.
`Project.create`) it calls it on the repo instead: `repo.create`.

Also important to note that there's a `.to_h` and `symbolize_keys` call on the
end of the code inside `project_params`. This is because the `create` method
from ROM expects the keys to be symbols, and not the
`ActionController::Parameters` default, which is strings.

Next up, we'll have to define a couple of views for our application.

We'll need a view to present the test with the "New Project" link. Let's put
this code in `app/views/projects/index.html.erb` to accomplish that goal for
now:

```erb
<h2>Projects</h2>

<%= link_to "New Project", new_project_path %>
```

Next, we'll need the form for the new action, which belongs at
`app/views/projects/new.html.erb`:

```erb
<h2>New Project</h2>

<%= form_with(model: @project, local: true) do |form| %>
  <p>
    <%= form.label :name %>
    <%= form.text_field :name, id: :project_name %>
  </p>

  <%= form.submit %>
<% end %>
```

And we'll need to add the page for the `show` action, which is where a user is
redirected to once their project is created successfully:

```erb
<h2><%= @project.name %></h2>
```

We'll also need to edit the application layout
(`app/views/layouts/application.html.erb`) to make sure that our flash message
comes up:

```erb
<%= flash[:notice] %>
<body>
  <%= yield %>
</body>
```

There's only been one place where we've had to put ROM-specific code: the
controller. Everything else has been vanilla Rails. If we run our test with
`bundle exec rspec spec/features/creating_projects_spec.rb`, we'll see that
it's happy:

```
1 example, 0 failures
```

According to that test, a user can create a project just the same as they've
always been able to. It's just now that the project is created through ROM, and
not Active Record.

But this doesn't really demonstrate the power of rom-rb or dry-rb too much. The
intention with this section was more to just demonstrate that it's _possible_
to use ROM and Rails together very easily.

If you want to see what the code

Let's look at using our repository now for reading this project back out of the
database.

### Showing a particular project

So far, we've focussed _a lot_ on the C part of CRUD: creating. Now's the time
we're going to talk about _reading_. In particular, we'll look at the `index`
and `show` actions for the `ProjectsController` and how we can fetch data in
those actions by using the ROM classes we've built up so far.

Let's start out with the `index` action. This action should present a list of
projects to a user and allow them to view more information about them:

<IMAGE GOES HERE>

When a user clicks the project's name, they should be taken to that project's
page.

Let's write another feature to test both actions. We'll put this one at
`spec/features/viewing_projects_spec.rb`:

```ruby
require "rails_helper"

RSpec.feature "Users can view projects" do
  let(:project_repo) { ProjectRepository.new(ROM.env) }
  let!(:project) { project_repo.create(name: "Sublime Text 3") }

  scenario "with the project details" do
    visit "/"
    click_link "Sublime Text 3"
    expect(page.current_url).to eq project_url(project)
    within("h2") do
      expect(page).to have_content("Sublime Text 3")
    end
  end
end
```

In this test, we must create a project before we can view it, and so that's
what we do at the start of this feature. In the scenario, when we visit the
root of our application, there should be a link there with the text of our
project's name. When we click that link, we should be taken to that project's
URL, and on that page there should be a `<h2>` element containing the project's
name again.

We've been able to create records in our database by using the repository, but
we haven't yet tried to _read_ records out. You might think that it's as simple
as calling `all` on the repository, like this:

```ruby
repo = ProjectRepository.new(ROM.env)
repo.all
=> [<all the projects>]
```

You'd be mostly right. The only thing that we need to do is to tell the
`ProjectRepository` class about this `all` method. Active Record dictates that
the `all` method should fetch all the records (and all the fields) from a
table. But perhaps in an app that uses ROM, you don't want to do this. Perhaps
you want to only fetch _some_ of the records. Perhaps you only want to fetch
the `id` and `name` columns. So ROM leaves it up to us to choose how we would
fetch a collection of records from our table. In this case, we'll just do the
same thing as Active Record: fetch all the records.

In our `app/repositories/project_repository.rb` file, we'll add an `all`
method:

```ruby
class ProjectRepository < ROM::Repository::Root
  root :projects

  commands :create, update: :by_pk, delete: :by_pk, mapper: :project

  def all
    projects.all
  end
end
```

The `projects` method used here refers to the relation used by this repository.
It calls the `all` method on that relation and then `map_with` to use the
`ProjectMapper` class to turn results returned by `projects.all` into `Project`
instances. But the `ProjectRelation` class doesn't have this `all` method
defined. If we try to call `repo.all` now, it will fail:

```ruby
repo = ProjectRepository.new(ROM.env)
repo.all
irb(main):002:0> repo.all
Traceback (most recent call last):
        2: from (irb):2
        1: from app/repositories/project_repository.rb:7:in `all'
NoMethodError (undefined method `all' for #<ProjectRelation:0x00007fc8a0e89980>
```

This is a good time to remind you that the repository is simply the bridge
between our application and the `ProjectRelation` class, with the
`ProjectRelation` class ultimately deciding how to make calls to the database.
When those calls are made, the repository takes the data from the relation and
presents it through these methods like `create` and `all`.

Let's add the `all` method to `ProjectRelation` now
(`app/relations/project_relation.rb`). In fact, there's a method called `all`
already in that file, but commented:

```ruby
class ProjectRelation < ROM::Relation[:sql]
  gateway :default

  schema(:projects, infer: true)

  # define your methods here ie:
  #
  # def all
  #   select(:id, :name).order(:id)
  # end
end
```

That looks perfect! Let's uncomment that:

```ruby
class ProjectRelation < ROM::Relation[:sql]
  gateway :default

  schema(:projects, infer: true)

  def all
    select(:id, :name).order(:id)
  end
end
```

This uses the `rom-sql` provided methods to select just the `id` and `name`
values for these records and to order these records by their `id` field. We're
only returning `id` and `name` here for the fields as that's all our model
instance needs. We're not limiting the result set here, and so we will really
see _all_ projects returned by this method.

We'll need to add another call on the end of the `all` method's code to turn
the returned objects into `Project` objects:

```ruby
def all
  select(:id, :name).order(:id).map_with(:project)
end
```

Let's try out this `repo.all` method in a new console now:

```ruby
repo = ProjectRepository.new(ROM.env)
repo.all
=> => #<ProjectRelation
  name=ROM::Relation::Name(projects)
  dataset=#<Sequel::Postgres::Dataset: "SELECT \"projects\".\"id\", \"projects\".\"name\"
                                        FROM \"projects\"
                                        ORDER BY \"id\"">>
```

The object returned here behaves similarly to Active Record's scope objects
(instances of a class called `ActiveRecord::Relation` class), which is the type
of object returned when you call `where`, `order`, etc. on an Active Record
model or scope.

For instance, this code returns an `ActiveRecord::Relation` object in a normal
Rails application:

```ruby
Project.where(account: account)
```

In both the case of the `ProjectRelation` and `ActiveRecord::Relation` objects,
 a query is not executed until that result is iterated through (using `each`)
 or `to_a` is called on it. In the case of the `ProjectRelation`, it helpfully
 shows us the SQL that would be used to fetch the data. This can be helpful to
 determine if you're fetching unnecessary columns in a query.

Calling `to_a` on this object will return all the projects in the database:

```ruby
repo.all.to_a
=> [#<Project id=1 name="Test Project">, ...]
```

Ok, it looks like our `ProjectRepository#all` method is now working and
fetching records from the database successfully. It's time to use this in the
controller. Let's go into `app/controllers/projects_controller.rb` and define
an `index` action:

```ruby
def index
  @projects = repo.all
end
```

This is calling the `repo` method defined at the bottom of this controller:

```ruby
def repo
  ProjectRepository.new(ROM.env)
end
```


Then in the template for this action -- `app/views/projects/index.html.erb` -- we
can list these projects:

```erb
<h2>Projects</h2>

<%= link_to "New Project", new_project_path %>

<ul>
  <% @projects.each do |project| %>
    <li><%= link_to project.name, project %></li>
  <% end %>
</ul>
```

The `link_to` here will generate a link like `/projects/1` and that will go to
the `show` action. We'll need to define this `show` action in
`app/controllers/projects_controller.rb`:

```ruby
def show
  @project = repo.by_id(params[:id])
end
```

This `by_id` method works identically to the `find` method we know from a
normal model: it will return an instance of that model. The only difference
here is that we're calling the `by_id` method on the repo, rather than on the
model class.

The `ProjectRepository` does not have any method called `by_id`, so we will
need to add one. Let's open that class and add the method:

```ruby
def by_id(id)
  projects.by_id(id)
end
```

Then we'll need to define that other `by_id` method in the `ProjectRelation`
class:

```ruby
def by_id(id)
  by_pk(id).map_with(:project).one!
end
```

This method uses the in-built `ROM::Relation` methods `by_pk` and `one!` to
fetch a record with the given "pk" -- primary key -- and then to enforce that
this method should only return the first matching record. If the search for a
record returns anything but one result we'll see
a `ROM::TupleCountMismatchError` exception. This matches the regular model's
`find` behaviour: if that method doesn't find the record then an
`ActiveRecord::RecordNotFound` exception is raised.

With this method defined in our repository and relation, and also used in the
`show` action, the only thing left to do is to write the show template at
`app/views/projects/show.html.erb`:

```erb
<h2><%= @project.name %></h2>
```

If we run our tests now with `bundle exec rspec`, we'll see that they both
pass:

```
2 examples, 0 failures
```

Users can now create and view projects within our application.

In this code, we've clearly separated out the responsibilities of our
application. Code that talks to the database lives in the `ProjectRelation`
class. The application talks to this code by way of the `ProjectRepository`
class. The logic we have defined isn't overly complex, but it is very clearly
separated.

There is still no code in our model that knows about database queries. The
controller is merely a conduit to the repository and the repository merely a
conduit to the relation. The controller, repository, relation and model code
are still neat and tidy.

But we haven't really done much to make a mess. Our code so far has been pretty
straight-forward. Let's change that now by introducing another bit of
complexity to our `create` action: a validation.

### Validating projects during creation

A validation sounds innocent enough. After all, in Rails it's usually just a
single line in the model:

```ruby
validates :name, presence: true
```

But then validations tend to multiply on complex models. A single validation
becomes five. Some validations have complex logic around their validation
rules. Suddenly, the model becomes responsible for knowing how the data it is
supposed to represent is validated when that data enters the database.

#### A small interlude about that contributors method

In a regular Rails app -- one that uses Active Record -- you might wish to test
that `Project#contributors` method I mentioned near the start of this guide:

```ruby
context "contributors" do
  let(:project) { Project.create(name: "Test Project") }

  context "when the project has tickets" do
    let(:ryan) { User.create(name: "Ryan") }

    before do
      project.tickets.create!(title: "Test Ticket", user: ryan)
    end

    it "lists the contributors" do
      expect(project.contributors).to include(ryan)
    end
  end
end
```

This unit test for the `Project` model knows quite a lot. It knows how to
create projects and it knows how to create tickets and it knows how to create
users.  If any of these models had validations that were added that required
other attributes to be present, then the `create` calls here will need to be
updated with those fields. Adding something to the `Project`, `Ticket` or
`User` model would require this spec to change.

Of course, we could write the spec better and stub out these other classes:

```ruby
context "contributors" do
  let(:project) { Project.create(name: "Test Project") }

  context "when the project has tickets" do
    let(:ryan) { double(User)) }
    let(:tickets) { [double(user: ryan)] }

    before do
      allow(project).to receive(:tickets) { tickets }
    end

    it "lists the contributors" do
      expect(project.contributors).to include(ryan)
    end
  end
end
```

After all, this is a unit test of a feature of the `Project` model and it
shouldn't really be involving other classes. With our mock safely in place, our
test will work. That is, until we realise the performance issues caused by the
N+1 query in our model:

```ruby
def contributors
  tickets.map(&:user).uniq
end
```

So then we'll add that `includes` statement:

```ruby
def contributors
  tickets.includes(:user).map(&:user).uniq
end
```

But then this breaks the mock in our test. We would need to stub out the
`includes` method. This seems like a step too difficult because our test knows
too much about the implementation of the `contributors` method, and so we go back to
our original test implementation: creating items in the database:

```ruby
context "contributors" do
  let(:project) { Project.create(name: "Test Project") }

  context "when the project has tickets" do
    let(:ryan) { User.create(name: "Ryan") }

    before do
      project.tickets.create!(title: "Test Ticket", user: ryan)
    end

    it "lists the contributors" do
      expect(project.contributors).to include(ryan)
    end
  end
end
```

But then again we run into the issue that if we add validations for these
models then we'll need to update the `create` calls here to specify the new
fields. We just can't win! Active Record has trapped us into writing poor code
for our tests, just so that those tests are compatible with Active Record's way
of doing things.

We could switch our test to not using instances that are in the database,
instead relying only on initialized instances:

```ruby
context "contributors" do
  let(:project) { Project.new(name: "Test Project") }

  context "when the project has tickets" do
    let(:ryan) { User.new(name: "Ryan") }

    before do
      project.tickets.build(title: "Test Ticket", user: ryan)
    end

    it "lists the contributors" do
      expect(project.contributors).to include(ryan)
    end
  end
end
```

But then the `includes` statement means that Active Record will try to execute
a database call anyway, and so this attempt won't work. We _must_ use objects
that have been persisted to the database.

If the validations were not available in the model, then they wouldn't
interfere in the tests.

In the ROM world, validation is kept separate from the model and model classes
know nothing about how their data is validated. Model classes only know what
attributes to expect. Validating data is someone else's responsibility.

This makes it easy to test the validation logic in isolation from the business
logic of the model and vice versa. Our `contributors` method would then be back
to its simplest version:

```ruby
def contributors
  tickets.map(&:user).uniq
end
```

We will eventually get to actually writing this method in our project and
making it work. But for now, we'll focus on adding a validation for projects to
our application.

#### Creating a validator

When creating projects in our application, we want to enforce that those
projects always have names on them. Because we're not using Active Record, we
can't simply put a line in the model and be done with it. Instead, we're going
to intentionally create a separate class that is responsible for handling
validations for our projects.

To begin with, we'll add `dry-validation` to our `Gemfile`:

```ruby
gem "dry-validation", "~> 0.11.1"
```

And we'll run `bundle install` to install this gem.

We're going to create this validation class in a moment, but let's write a test
for that class first, just to see how easy it is to test the validation.
`dry-validation` calls the classes that it uses for validations _schemas_, and
so we're going to follow the same pattern here. We'll put the code for this
test at `spec/schemas/project_schema_spec.rb`:

```ruby
require 'rails_helper'

describe ProjectSchema do
  let(:result) { subject.call(attributes) }

  context "when a name is specified" do
    let(:attributes) { { name: "Test Project" } }

    it "is valid" do
      expect(result).to be_success
    end
  end

  context "when a name is not specified" do
    let(:attributes) { { } }

    it "is invalid" do
      expect(result).to be_failure
      expect(result.errors[:name]).to eq(["is missing"])
    end
  end
end
```

This test is pretty easy to read and so it does not require much explanation.
It's testing that when the schema receives attributes containing name that it
works, and when those attributes do not contain name it fails.

Running this test now will be pretty in-effectual because our `ProjectSchema`
constant doesn't exist, so let's go ahead and create it now in
`app/schemas/project_schema.rb`:

```ruby
require 'dry-validation'

ProjectSchema = Dry::Validation.Schema do
  required(:name).filled
end
```

This code defines a constant called `ProjectSchema`, which defines the
validation schema for projects. It has one rule: that `name` is required and it
must be filled in; i.e. it cannot be `nil` or a blank value.

Running the schema's specs now will show it passing:

```
2 examples, 0 failures
```

This asserts that our schema can validate the Hash that we're using in the
test. The next step is to connect the controller and this validation schema
together. We want it to be the case that if someone does not enter a project
name that it re-renders the `new` form and shows the error messages to the
user:

<IMAGE GOES HERE>

We can assert that this behaviour happens by writing another test for this in
`spec/features/creating_projects_spec.rb`:

```ruby
scenario "with no name specified" do
  visit "/"

  click_link "New Project"

  click_button "Create Project"

  expect(page).to have_content "Project could not be created."

  within("h2") do
    expect(page).to have_content("New Project")
  end

  expect(page).to have_content("There were errors that prevented this form from
  being saved")
  expect(page).to have_content("Name must be filled")
end
```

This test asserts that when a user goes to the new project page and submits the
form without filling in the name field, that they're sent back to that form and
told that the name is missing.

This test will fail at the moment when we run it because we're _always_
creating projects in the `create` action:

```ruby
def create
  repo.create(project_params)
  flash[:notice] = "Project has been created."
  redirect_to projects_path
end
```

There isn't a case here where `create` doesn't create a project if the name is
missing. To do that, we'll need to use our new `ProjectSchema` validation
schema. We'll change our `create` action to this:

```ruby
def create
  @validation = ProjectSchema.(project_params)
  if @validation.success?
    repo.create(project_params)
    flash[:notice] = "Project has been created."
    redirect_to projects_path
  else
    @project = Project.new(project_params)
    flash.now[:alert] = "Project could not be created."
    render :new
  end
end
```

We're using our `ProjectSchema` to validate if the project parameters are valid
in this case. If they are, then we go down the path of creating the project and
redirecting the user back to `projects_path`. If they aren't, then we
initialize a new `Project` instance using whatever parameters were passed in
from the form -- so the form is repopulated with its correct values, if any
were specified. We also show the "Project could not be created." message, and
render the `new` template once more.

We'll need to make two more changes to our application before our test will
pass. We'll need to add the `flash[:alert]` to display in the application
layout, which we can do with this small addition to
`app/views/layouts/application.html.erb`:

```erb
<%= flash[:notice] %>
<%= flash[:alert] %>
<body>
  <%= yield %>
</body>
```

And we'll also need to display the errors in the
`app/views/projects/new.html.erb` view, which we can do by changing the view to
this:

```erb
<h2>New Project</h2>

<%= form_with(model: @project, local: true) do |form| %>
  <% if @validation && @validation.failure? %>
    <p>
      There were errors that prevented this form from being saved:
    </p>

    <ul>
      <% @validation.errors.map do |key, errors| %>
        <% errors.each do |error| %>
          <li><%= key.to_s.capitalize %> <%= error %></li>
        <% end %>
      <% end %>
    </ul>
  <% end %>
  <p>
    <%= form.label :name %>
    <%= form.text_field :name, id: :project_name %>
  </p>

  <%= form.submit %>
<% end %>
```

This view now detects if there is a `@validation` instance variable present and
if that validation has failed it will go through the error messages from that
validation and present them.

All this code seems in line with what our test is expecting, so let's run this
test with `bundle exec rspec spec/features/creating_projects_spec.rb` and see if it passes:

```
2 examples, 0 failures
```

Excellent! Our controller now uses the `ProjectSchema` to validate the
project's parameters before the project is created in the database. If the
project is invalid, errors are shown to the user telling them what to do. And
all this is done with code that is neatly separated. We still haven't had to
add anything extra to our `Project` model. It's still devoid of validation or
persistence logic.

However, our controller is getting a little messy. It's intertwining the
validation and persistence logic with the response logic. We can do better than
this by separating out these two distinct responsibilities even further.

### Service objects

Normally when moving code out of a controller to separate the business logic
from the response logic, you would move it out to a service object. It's
"community tradition" to move them out to _service objects_ to make
it easier to test those parts in a way that's completely isolated from the
Rails request / response cycle.

However, most of the time this happens it is simply cutting the code from the
controller and pasting it into another class. This code ends up in a new
directory called `app/services`, and the guidelines for organising this
directory differ wildly from application to application. Here's what might
happen with a service object that we create from the code that we had in the
`create` action of `ProjectsController`:

```ruby
class CreateProject
  def self.call(params)
    @validation = ProjectSchema.(params)
    if @validation.success?
      project = repo.create(project_params)
      [true, {project: project}]
    else
      @project = Project.new(project_params)
      [false, {project: project, errors: @validation.errors}]
    end
  end
end
```

If we had to add another responsibility to this service such as one that made
the success path send emails, we'd just cram it on in there:

```ruby
class CreateProject
  def self.call(params)
    @validation = ProjectSchema.(params)
    if @validation.success?
      project = repo.create(project_params)
      send_emails(project)
      [true, {project: project}]
    else
      [false, {errors: @validation.errors}]
    end
  end

  def self.send_emails(project)
    # code to send emails goes here
  end
end
```

This class would then be used in a controller like this:

```ruby
def create
  [success, result] = CreateProject.call(project_params)
  if success
    flash[:notice] = "Project has been created successfully"
    redirect_to result[:project]
  else
    @project = Project.new(project_params)
    @errors = result[:errors]
    flash[:alert] = "Project could not be created"
    render :new
  end
end
```

Suddenly, the whole combination of the service object and controller code isn't
looking that pretty. The service object muddles together validation,
persistence, sending emails and returning a result all in the one method.
Testing the individual parts will be difficult due to the design of this
method. If this service object is to grow, it will only get messier and
messier.

What would be better is something that would allow is to explode the call
method into a chain of connected methods. The methods should follow this order:

1. Validate the parameters for a new project
2. Persist the record to the database
3. Send emails
4. Return a valid result

However, if step #1 failed then we would not expect step #2 and step #3 to run.
Similarly, if step #2 failed then we would not expect step #3 to run, and so
on. We could try writing this logic ourselves using convoluted `if` statements,
but there is a better way: the `dry-transaction` gem. Here's an example of the
above service object, written in a `dry-transaction` way:

```ruby
require "dry/transaction"

class CreateProject
  include Dry::Transaction

  step :validate
  step :persist
  step :send_emails

  def validate(input)
    validation = ProjectSchema.(input)
    if validation.success?
      Success(input)
    else
      Failure(validation.errors)
    end
  end

  def persist(input)
    project = repo.create(input)

    Success(project)
  end

  def send_emails(project)
    # code to send emails

    Success(project)
  end
end
```

This class represents a _transaction_ a user undertakes with your application,
hence the name `dry-transaction`. It's still a service object, but it's a
_cleaner_ service object. This class separates out each step into this own
clearly defined method. The `Success` or `Failure` constants used here come
from another `dry-rb` gem called `dry-monads`, and they indicate if the method
is successful or not. If the `validate` step returns a `Failure` then the
`persist` step will not be called. The `Success` result gets passed to the next
step, but `Failure` stops the code in its tracks.

Unlike our service object from before, if we added another step in here it
would simply mean another line in the `step` definitions, and another method in
the class. It is then very clear the order the methods run in and the new
method would likely be simple too.

If you wanted to test what `validate` did when it
received certain parameters, you can now do that. If you wanted to test the
`persist` step, you can now do that too. Previously, it was impossible to test
each step of our `CreateProject` service. To acheive this same goal of
testability and separate-ness in our old `CreateProject` class without the use
of the `dry-transaction` or `dry-monads` gem, we would need to write our code
like this:

```ruby
class CreateProject
  def call(params)
    [success, result] = validate(params)
    return result unless success

    [success, result] = persist(result)
    return result unless success

    send_emails(project)
  end

  def validate(params)
    project = Project.new(params)
    if project.valid?
      [true, project]
    else
      [false, project.errors]
    end
  end

  def persist(project)
    project.save
    [true, project]
  end

  def send_emails(project)
    # code to send emails
  end
end
```

This code is gross and really hard to mentally parse. It doesn't even come
close to the `dry-transaction` code. It's for this reason I think that
`dry-transaction` should be used as a pattern for service objects in Rails
applications. The cleanliness of the class is definitely worth it. The
testability of each steps inside the transaction is dead-simple too.

In this guide, we'll be using `dry-transaction` to build more service objects
like these. We'll end up with some really slick looking code in our controllers:

```ruby
def create
  action = CreateProject.new
  action.(project_params) do |result|
    result.success do |project|
      flash[:notice] = "Project has been created."
      redirect_to project
    end

    result.failure :validate do |errors|
      @project = Project.new(project_params)
      @errors = errors
      flash[:alert] = "Project could not be created."
      render :new
    end
  end
end
```

This code is not too far off from the service object code from before, but
under the hood it will use `dry-transaction` to abstract the logic out of the
controller, away from the request / response cycle and make our application
code that much cleaner.

#### Building our first transaction class

Ok, enough talking about it. Let's actually do it! The first step is to add
`dry-transaction` to our `Gemfile`:

```ruby
gem 'dry-transaction', '~> 0.10.2'
```

And then to run `bundle install` to install this gem.

We'll build this class up piece-by-piece, just to demonstrate how easy it is to
test each part individually. As we saw before, this class will have two
distinct steps: `validate` and `persist`. The `validate` step will wrap all the
logic for validation and all the `persist` step will wrap all the logic for
persisting the record to the database.

Let's start by writing some tests for the `validate` step. We'll put these
tests in `spec/transactions/create_project_spec.rb`:

```ruby
require 'rails_helper'

describe CreateProject do
  context "validate" do
    context "when validation is successful" do
      it "step succeeds" do
        input = { name: "Test Project" }
        result = subject.validate(input)
        expect(result).to be_success
        expect(result.value).to eq(input)
      end
    end
  end
end
```

This test asserts that when the `validate` method is called on our
`CreateProject` transaction class that it is successful, and the return value
from the result is the input parameters.

Let's setup our `CreateProject` class now in
`app/transactions/create_project.rb` and add in some code to make this test
pass:

```ruby
require 'dry-transaction'

class CreateProject
  include Dry::Transaction

  step :validate

  def validate(input)
    validation = ProjectSchema.(input)
    if validation.success?
      Success(input)
    end
  end
end
```

In this class, we define our first step: `validate`. Inside that step, the only
thing we do is call out the `ProjectSchema` and determine if the input for this
step -- the parameters coming from the controller -- would be valid or invalid
according to that schema. If they're valid, we return `Success(input)`. We
don't have a test for invalid parameters yet, so we don't have any code for
that either.

Running the test with `bundle exec rspec
spec/transactions/create_project_spec.rb` will show that it works:

```
1 example, 0 failures
```

The code for our test and the code for this transaction is dead simple. There's
no muddling of validation, persistence and business concerns. It's all about
the validation here.

Let's write another test, this time for the failure case of the validation:

```ruby
context "when validation fails" do
  it "step fails" do
    input = { }
    result = subject.validate(input)
    expect(result).to be_failure
    expect(result.value).to eq({name: ["is missing"]})
  end
end
```

For this test to pass, we'll need to handle the validation failing in our
transaction class. We'll change the `CreateProject#validate` method to this:

```ruby
def validate(input)
  validation = ProjectSchema.(input)
  if validation.success?
    Success(input)
  else
    Failure(validation.errors)
  end
end
```

In the case where the validation is unsuccessful, we're returning `Failure`
result and that result contains the validation's errors. We're returning the
errors rather than the input as the controller will use these to show the user
which attributes were wrong according to the schema.

When we run that test again, we'll see that it passes:

```
2 examples, 0 failures
```

We've now written the first of the two steps that we need, so let's now look at
the 2nd step. This step is easier to test as it can only be successful. Let's
write this test now:

```ruby
context "persist" do
  let(:repo) { double(:repo) }

  it "step is successful" do
    project = double(:project)
    expect(repo).to receive(:create).with(name: "Test Project") { project }
  end
end
```





* Write tests for persist step
* Implement CreateProject#persist
* Hook it all up the controller





### Adding tickets

### Showing contributors to a given project


### Homework

* Adding update / destroy actions to ProjectsController
* Adding a TicketsController

### Further thoughts

* Organisation of a Rails app -- organised by type, rather than by feature
* Separating into different "contexts" and organising by that is probably a
  better move -- good idea to show an example. All business code lives in `lib`
  instead of `app`, which makes it easier to test without loading rails (i.e.
  can load just `spec_helper.rb`

