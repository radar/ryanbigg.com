---
wordpress_id: RB-1515709032
layout: post
title: Exploding your Rails app with dry-rb and rom
published: false
---

The Rails Way™ for building applications is that code belongs in one of four
distinct locations:

* Controllers
* Models
* Views
* Helpers

The Rails Way™ enforces these conventions as a suggestive way that this is the
One True Way™ to organise a Rails application. This Rails Way™ suggests that,
despite there being over a decade since Rails was crafted, that there still is
no better way to organise an application than the MVC pattern. While I agree
that this way is extremely simple, I do not agree that this is the best way to
organise a Rails application in 2018.

In a traditional Rails app, code that talks to the database _obviously_ belongs
in the model. Code that presents data in either HTML or JSON formats
_obviously_ belongs in the view.  Any special view logic goes into helpers
(_obviously_) and the thing that ties them all together is _obviously_ the
controller.

Of course, there are more directories in `app` these days, like `mailers` and
`jobs`, but typically the 4 listed above is where the parts of your application
go.

### Service objects

If you have code that doesn't really fit any of these places, it's
community-tradition to move them out to _service objects_ to make
it easier to test those parts. However, most of the time this happens it is
simply cutting the code from the controller and pasting it into another class.
This code ends up in a new directory called `app/services`, and the guidelines
for organising this directory differ wildly from application to application.
Here's a completely contrived example of a service object, which is not too far
from the truth of a normal service object. This one lives at
`app/services/create_project.rb`:

```ruby
class CreateProject
  def self.call(params)
    project = Project.new(params)
    if project.save
      send_emails(project)
      [true, project]
    else
      [false, project.errors]
    end
  end

  private_class_method

  def self.send_emails(project)
    # code to send some emails goes here
  end
end
```

This class would then be used in a controller like this:

```ruby
def create
  [result, project] = CreateProject.call(project_params)
  if result
    flash[:notice] = "Project has been created successfully"
    redirect_to project
  else
    flash[:alert] = "Project could not be created"
    render :new
  end
end
```

The benefit of moving this code out to a service object is that you can now
test the logic for creating a project without involving a request. You can pass
it `params` and assert what the output is, all without involving the controller
at all. This may seem like a good pattern to follow, but I believe it adds a
layer of misdirection to the controller. You might think you would find the
logic of the `create` action in the `create` action, so you visit that
action... only to find your logic is in this mysterious `CreateProject` class
instead.

The code for `CreateProject` is messy: it intertwines responsibilities of
validating an object and sending emails and returning a result all within the
same method. Testing the individual parts will be difficult due to the design
of this method. If this service object is to grow, it will only get
messier and messier.

This service object has relocated the logic for the action to a separate class
with the great intention of disconnecting it from a HTTP request, but the code
inside `CreateProject` still isn't very neat or orderly.  The responsibilities
are too intertwined.

What would be better is something that would allow is to explode the call
method into a chain of connected methods. The methods should follow this order:

1. Validate the parameters for a new project
2. Persist the record to the database
3. Send emails

However, if step #1 failed then we would not expect step #2 and step #3 to run.
Similarly, if step #2 failed then we would not expect step #3 to run. We could
try writing this logic ourselves using convoluted `if` statements, but there is
a better way: the `dry-transaction` gem. Here's an example of the above service
object, written in a `dry-transaction` way:

```ruby
require "dry/transaction"

class CreateProject
  include Dry::Transaction

  step :validate
  step :persist
  step :send_emails

  def validate(input)
    project = Project.new(input)
    if project.valid?
      Success(project)
    else
      Failure(validation.errors)
    end
  end

  def persist(project)
    project.save

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
`persist` step will not be called.

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
like these. We'll end up with code like this in our controllers:


```ruby
def create
  action = Projects::Create.new
  result = action.(project_params)
  if result.success?
    flash[:notice] = "Project has been created successfully"
    redirect_to result.project
  else
    flash[:alert] = "Project could not be created"
    render :new
  end
end
```

This code is not too far off from the service object code from before, but
under the hood it will use `dry-transaction` to abstract the logic out of the
controller, away from the request / response cycle and make our application
code that much cleaner.

### The problem with Active Record Models

The major issue with The Rails Way™ is that it ties together quite a number of
things in one of these places: the model. The model is responsible for _at
least_ the following things:

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
  def contributors
    tickets.map(&:user).uniq
  end
end
```

You might know _instinctively_ that this code is going to make a database call
to the `tickets` association for the `Project` instance, and then for each of
these `Ticket` objects it's going to call its `user` method, which will load a
`User` record from the database.

Someone unfamiliar with Rails -- like, say, a junior Ruby developer -- might think
this is bog-standard Ruby code because that's _exactly_ what it looks like.

This kind of code is very, very easy to write in a Rails application because
Rails applications are intentionally designed to be easy. "Look at all the
things I'm _not_ doing" and all that.

However, this code executes one query to load all the `tickets`, and then one
query _per ticket_ to fetch its users. This is a classic N+1 query, which Rails
does not stop you from doing. It's a classic footgun, or facerake.

This code combines business logic intent with database querying and it's _the_
major problem with Active Record's design. And mongoid's too, since it follows
the Active Record pattern.

Database queries are cheap to make because Active Record makes it so darn easy.
When looking at the performance of a large, in-production Rails application,
the number one thing I come across is slow database queries caused by methods
just like this.

The intention here is very innocent: get all the users who have contributed to
the project by iterating through all the tickets and finding their users. The
ramifications on performance on a large project ([with thousands of
tickets](https://github.com/rails/rails)) are large enough to warrant concern.

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

But I think this is still too much of a mish-mash of database querying and
business logic and leads to messier-than-necessary code. This is because Active
Record _allows_ us to do this sort of messy querying very easily; intertwining
Active Record's tentacles with our business logic. To separate the two on a
large-scale Rails application is a feat nigh unaccomplishable.

Active Record’s simplicity makes it incredibly easy to get going, but in the
long-haul of a Rails project Active Record makes a model’s code hard to work
with. It’s not so straightforward to just work with an instance of a model and
not have the database be involved. Methods can intentionally or unintentionally
make database calls. Active Record makes it far too easy to call out to the
database, as we can see with the contributors method example at the start of
this guide.

It should be possible to work with the business logic of your application
without these calls being made; and without the database at all. The model
should only define a representation for the data — not knowing also about that
data’s validations, callbacks or persistence. If a model knows about those
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
other class talks to the database.

ROM draws these crystal clear lines in a simple manner. There’s code to talk to the database in one file. Code to validate that data in another. And so on. The design patterns that ROM encourages are leaps and bounds better than Active Record. This guide will serve as an example of that.


So we should try to avoid this from the outset when building new Rails
applications. The way we can accomplish that is with a few new gems:
rom-rb and the dry-rb suite of gems.

### Installing ROM

[ROM](http://rom-rb.org/) (Ruby Object Mapper) is a suite of gems designed to
make it easy to work with databases, but not as easy as Active Record. That is
an intentional design decision.

Rather than having a single class that encapsulates all of the logic of working
with databases, ROM chooses to split this logic over several separate classes:

* Mapping database rows to Ruby objects (Mappers)
* Containing validation rules for those objects (Validation schemas, with the
  [dry-validation](https://github.com/dry-rb/dry-validation)
* Managing the CRUD operations of those objects in the database (Repositories)
* A place to put complicated database queries (Relations)
* Containing business logic for your application (Plain Ol' Ruby Classes)

This makes it easier to test each part individually. The business logic in your
Plain Ol' Ruby Class isn't interspersed with Active Record methods. Instead, it
works as an individual unit in your application.

The easiest way to show you how this approach is better than the Active Record
one is to demonstrate it within a brand new Rails application, free from Active
Record's muddling.

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
  default database connection for ROM to use. This loads the `DATABASE_URL`
  environment variable, which is configured in `.env`. This `.env` file is
  loaded by the `dotenv-rails` gem in the `Gemfile`, but only in the
  `development` environment.
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



Let's create a new file at `app/models/project.rb` and put this
content in it:

```ruby
class Project

end
```


`ActiveModel::Model` makes this class pretend like a regular model, providing
the interface required for interacting with Action Controller and Action View.

It allows us to create new instances of this model, just like we would with a
traditional model:

```ruby
Project.new(name: "Test Project")
```

Code similar to this is how our mapper translates the hashes returned from the
repository to instances of the `Project` class.

Notice how the `Project` class here contains _no_ information at all about how
this entity is validated or even persisted to the database. It's a
plain-ol'-ruby class.

The only special bit of logic required here is the `persisted?` method, which
is used by Rails helpers like `form_for` / `form_with` to determine if the form
should make a `POST` request to the `create` action or a `PUT` request to the
`update` action in a controller. You might ask how that all works, so here's [a
separate blog post explaining polymorphic routes in
Rails](http://ryanbigg.com/2012/03/polymorphic-routes) for your consumption /
enjoyment.

We've now created a relation, a repository, a mapper and a model. We've
_exploded_ our traditional Rails model into 4 distinct files with 4 distinct
responsibilities:

* Relation: contains logic for making database queries
* Repository: Talks to relation, asks it to do the queries on the database
* Mapper: Converts Hash results from Repository commands (create, update,
  delete) to instances of the `Project` class
* Model: A bare-bones representation of `Project` records within our
  application.

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
configuration data about how to connect to our database. Once we've initialized
the repository, we can then perform commands against it. We call the `create`
command on the `repo`, passing it attributes just like we would with
`Model.create` within a regular Rails app.

The return value here is a `Project` instance:

```
=> #<Project:0x00007fd41cdc9810 @id=1, @name="Test Project">
```

This instance is a very lightweight one. It can respond to `id`, `name` and
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
accomplish its job.

Ok, so this is well and good but how do we tie this to our Rails application?
How do we make it so that people can create projects using ROM through the app?
Well, let's take a look at that now.

### Connecting a Rails controller with ROM

_The code for this section can be found
[here](https://github.com/radar/exploding-rails-rom-dry-example-app/tree/01-connecting-a-rails-controller-with-rom)_

In this post, I'm not suggesting to get rid of everything that Rails contains.
So far, just Active Record. Some zealots would have you ditch everything Rails
entirely, but I think Rails has some good parts too, namely things like its
router, controllers and views. In this section, we're going to use those
traditional parts of Rails in conjunction with the ROM code that we've just
written.

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

  before do
    project_repo.create(name: "Sublime Text 3")
  end

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
It calls the `all` method on that relation, but the `ProjectRelation` class
doesn't have this method defined. If we try to call `repo.all` now, it will
fail:

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
fields from the table, and to order all results by their `id`. We're not
limiting the result set here, and so we will really see _all_ projects returned
by this method.

Let's try it out in our console now:

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
=> [#<ROM::Struct::Project id=1 name="Test Project">, ...]
```

Ok, it looks like our `ProjectRepository#all` method is now working and
fetching records from the database successfully.







### Adding in validations

### Moving code to a service object

### Exploding the service object

### Listing projects


### Adding tickets

### Showing contributors to a given project


### Homework

* Adding update / destroy actions to ProjectsController
* Adding a TicketsController

### Further thoughts

* Organisation of a Rails app -- organised by type, rather than by feature
* Separating into different "contexts" and organising by that is probably a
  better move -- good idea to show an example.

