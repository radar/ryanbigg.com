---
wordpress_id: RB-1580556354
layout: post
title: Getting Started with ROM and Dry
published: false
---

The [rom-rb](https://rom-rb.org/) and [dry-rb](https://dry-rb.org/) sets of gems have come out in the last couple of years. These gems allow an alternative take on building a Ruby application, separate from Rails or Sinatra, or anything else like that.

In this _series_ of blog posts, I am going to show you how to build a simple application using these sets of gems. This application will retrieve data from a database, and present it through a JSON API.

This part will cover how to get started and will use these gems:

* rom, [rom-sql](https://rom-rb.org/5.0/learn/sql/) + pg -- We'll use these to connect to a database
* [dry-system](https://rom-rb.org/5.0/learn/sql/) -- We'll use this to load our application's dependencies
* `dotenv` -- a gem that helps load `.env` files that contain environment variables
* `rake` -- For running Rake tasks, like migrations!

In this part, we will build a small Ruby application that talks to a PostgreSQL database.

## A word on setup costs

In these guides, you may get a sense that the setup of rom-rb and dry-rb libraries takes a long time -- maybe you'll think thoughts like "this is so easy in Rails!" These are normal and understandable thoughts. The setup of this sort of thing in Rails _is_ easier, thanks to its generators.

However, Rails leads you into an application architecture that paints you into a corner, for reasons I explained in [my "Exploding Rails" talk in 2018](https://www.youtube.com/watch?v=04Kq_9scT1E).

The setup of ROM and dry-rb things _is_ harder, but leads you ultimately into a better designed application with clearer lines drawn between the classes' responsibilties.

It might help to think of it like this: setup cost is a cost that you pay _once_, whereas ease-of-application-maintenance is a cost _every single day_.

So in the long run, this will be better. I promise.

## Installing Gems + Environment Configuration

To get started, we'll create an empty directory for our application. I've called mine `bix`. Inside this directory you will need to create a basic `Gemfile`:

```
source 'https://rubygems.org'

gem 'rom'
gem 'rom-sql'
gem 'pg'

gem 'dry-system'

gem 'dotenv'
gem 'rake'
```

Once we have created that `Gemfile`, we'll need to run `bundle install` to install all of those dependencies.

Next up, we will create a file called `config/boot.rb`. This file will contain this code:

```ruby
ENV['APP_ENV'] ||= "development"

require "bundler"
Bundler.setup(:default, ENV["APP_ENV"])

require "dotenv"
Dotenv.load(".env", ".env.#{ENV["APP_ENV"]}")
```

The first block of code here will add the gem dependencies' paths to the load path, so that we can require them when we need to. The two args passed here to `Bundler.setup` tell Bundler to include all gems outside of a group, and all gems inside of a group named after whatever `APP_ENV` is set to, which is `development`.

The first one that we require is `dotenv`, and that is just so we can load the `.env` or `.env.development` files. We do not have either of these files yet.

Let's create `.env.development`:

```
DATABASE_URL=postgres://localhost/bix_dev
```

This file specifies the database we want to connect to. To create that database, we will need to run:

```
createdb bix_dev
```

Now that we have our database, we will need to create tables in that database. If this was a Rails app, we would use migrations to do such a thing. Fortunately for us, ROM "borrowed" that idea and so we can use migrations with ROM too.

However, before we do that, we will need to create another file, called `Rakefile`:

```ruby
require_relative 'config/boot'
require 'rom-sql'
require 'rom/sql/rake_task'

namespace :db do
  task :setup do
    ROM::SQL::RakeSupport.env = ROM.container(:sql, ENV['DATABASE_URL']) do |config|
      config.gateways[:default].use_logger(Logger.new($stdout))
    end`
  end
end
```

This file loads the `config/boot.rb` file that we created earlier and that will make it possible to require the other two files we use here.

In order to tell ROM's Rake tasks where our database lives, we're required to setup a Rake task of our own: one called `db:setup`. The configuration variable that this sets will connect ROM and our new database.

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

      column :created_at, DateTime, null: false
      column :updated_at, DateTime, null: false
    end
  end
end
```

In this migration, we've specified five columns. We've had to specify the `primary_key` here, because ROM does not assume that all primary keys are `id` by default.

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

To create one of these, we'll create a new file inside a new directory structure at `lib/bix/repos/user.rb`:

```ruby
module Bix
  module Repos
    class User < ROM::Repository[:users]

    end
  end
end
```

To use this class (and others that we will create later on), we'll create a new file over at `bin/console` with this in it:

```ruby
#!/usr/bin/env ruby

require_relative '../config/environment'

require 'irb'
IRB.start
```

This file will load our application's `config/environment.rb` file, which will be responsible for loading all the classes of our application, including this new `Bix::Repos::User` class. Once those classes are loaded, `bin/console` will start an IRB prompt.

To make it so that we can run `bin/console`, let's run this command:

```
chmod +x bin/console
```


Right now, that `config/environment.rb` file doesn't exist. Let's create it:

```ruby
require_relative "boot"

require "rom"
require "rom-sql"
require_relative "../lib/bix/repos/user"

module Bix
  DB = ROM.container(:sql, ENV['DATABASE_URL']) do |config|
    config.gateways[:default].use_logger(Logger.new($stdout))
  end
end
```

This file requires all the necessary things for our application, which is so far `config/boot.rb`, ROM itself, and our repository. This file then sets up a new ROM container and makes it available for us to use through the `Bix::DB` constant.

The way we use this is by running `bin/console` and then running this command:

```
>> Bix::Repos::User.new(Bix::Container)
```

This code will tell our user repository to connect to the database specified by `Bix::Container`. But unfortunately for us, another key part of configuration is missing and so we're going to see an error when we run this code:

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

However, we will need to register this relation manually with our application's container. Let's do that now back in `config/environment.rb`. First, we'll add a `require` line for the relation:

```ruby
require_relative "../lib/bix/relations/users"
```

Then we'll change the container:

```
module Bix
  Container = ROM.container(:sql, ENV['DATABASE_URL']) do |config|
    config.gateways[:default].use_logger(Logger.new($stdout))

    config.register_relation(Bix::Relations::Users)
  end
end
```

The `register_relation` method registers our relation with the container. This means that our `User` repository will be able to find the `Users` relation.

Let's run `bin/console` again and try working with our repository again:

```
>> user_repo = Bix::Repos::User.new(Bix::Container)
>> user_repo.all
NoMethodError (undefined method `all' for #<Bix::Repos::User struct_namespace=ROM::Struct auto_struct=true>)
```

Oops! Repositores are intentionally bare-bones in ROM; they do not come with very many methods at all. Let's exit the console and then we'll define some methods on our repository. While we're here, we'll add a method for finding all the users, and one for creating users. Let's open `lib/bix/repos/user.rb` and add these methods:

```
module Bix
  module Repos
    class User < ROM::Repository[:users]
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

The `commands` class method defines built in commands that we can use on our repository. This one tells ROM that we want a method called `create` that will let us create new records. The `use :timestamps` at the end tells ROM that we want `create` to set `created_at` and `updated_at` when our records are created.

The `all` method here calls the `users` relation, and the `to_a` will run a query to fetch all of the users.

With both of these things in place, let's now create and retrieve a user from the database through `bin/console`:

```
user_repo = Bix::Repos::User.new(Bix::Container)
user_repo.create(first_name: "Ryan", last_name: "Bigg")
=> #<ROM::Struct::User id=1 first_name="Ryan" last_name="Bigg" ...>

user_repo.all
=> [#<ROM::Struct::User id=1 first_name="Ryan" last_name="Bigg" ...>]
```

Hooray! We have now been able to add a










### Entities







### Dry System
