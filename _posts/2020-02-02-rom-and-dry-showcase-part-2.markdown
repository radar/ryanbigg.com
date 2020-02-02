---
wordpress_id: RB-1580636206
layout: post
title: "ROM and Dry Showcase: Part 2"
---

This is the 2nd of a 4 part series. You [can read Part 1 here](/2020/02/rom-and-dry-showcase-part-1).

In Part 1, we built an application called Bix and made it so that the application could talk to a database. We did this by using some gems from the ROM suite of gems, namely `rom` and `rom-sql`.

In this part, we're going to look at how we can tidy up our code by using two additional gems, this time from the Dry suite of gems: `dry-system` and `dry-auto_inject`.

You might be wondering: what code did we write in the last part that needs tidying up? I should definitely answer that. In Bix's `config/environment.rb`, we have this code:

```
require_relative "../lib/bix/repos/user"
require_relative "../lib/bix/relations/users"
require_relative "../lib/bix/entities/user"
```

These three lines are innocuous now, but imagine if we had [as many tables as Spree](https://github.com/spree/spree/tree/2fb3015201a1c1b4ea1f96d43afde4cef6dd2fdb/core/app/models/spree). Then there would be 3 lines for each of those and this `config/environment.rb` file would get very long, very quickly. We can tidy that up, thankfully, by using `dry-system`.

Next, when we've been using `bin/console` we've had to type this absolute beast of a line:

```ruby
Bix::Repos::User.new(Bix::Container)
```

What if we were able to get rid of that `Bix::Container` part? Well, we can do that with `dry-auto_inject` and this guide will show you how.

## DRYing our system

I like `dry-system` because when we use this gem, it epitomises the "DRY" principle: Don't Repeat Yourself. We're currently on our way to _definitely_ repeating ourself over in `config/environment.rb` if we add another table!

Let's work on fixing this by adding the `dry-system` to the `Gemfile`:

```
gem 'dry-system'
```

Next, we'll run `bundle install` to install this gem.

Then we'll go to `config/environment.rb` and start DRYing things up:

```ruby
require_relative "boot"

require "dry/system/container"

require "rom"
require "rom-sql"

module Bix
  class Application < Dry::System::Container
    configure do |config|
      config.root = File.expand_path('.')
      config.auto_register = 'lib'
      config.default_namespace = 'bix'
    end

    load_paths!('lib')
  end
end
```

This file now looks a lot simpler, and that is probably because we removed _nearly everything_. We'll find a new home for a lot that code shortly, but first let's talk about what we've done here.

We've defined a `Bix::Application` container and we've configured this container to specify that the root path for our application is one directory up from the `config` directory, that we want to "auto register" everything in `lib`, and that the default namespace is `bix`. Finally, there's a `load_paths!` thing at the end of this file.

Let's go through each of these things in turn. When we setup the `root` of our application and `auto_register` things, the `dry-system` gem will require all of the files under the `lib` directory automatically for us. This means that we will not need to require our entities, relations or repositories from now and into the future.

When we define our application's configuration with `dry-system`, it will not automatically set to requiring everything in our application on boot. Instead, the application waits for us to call `finalize!` before it will do that. So let's open `bin/console` and change the file to this:

```
#!/usr/bin/env ruby

require_relative '../config/environment'

Bix::Application.finalize!

require 'irb'
IRB.start
```

This will now trigger our application to be loaded when `bin/console` starts up. Let's give it a shot now by running `bin/console` and then putting in this code:

```
>> Bix::Repos::User
Bix::Repos::User
```

Our application has loaded `lib/bix/repos/user.rb` automatically for us!

Unfortunately, because we deleted `Bix::Container`, this class will no longer work:

```
Bix::Repos::User.new(Bix::Container)
NameError (uninitialized constant Bix::Container)
```

Let's now work on restoring that constant by using another part of `dry-system` called _dependencies_.

## Booting the persistence dependency

We've deleted `Bix::Container` out of `config/environment.rb`, perhaps a little too eagerly. Our `Bix::Repos::User` class can no longer fetch users!

To fix this up, we can create what `dry-system` refers to as a _dependency_ -- a part of our application that can be compartmentalised and booted up separately to the main application.

The code for these go into a new folder called `system/boot`, and we're going to call this new file `system/boot/persistence.rb`. Into this file, we're going to put this:

```ruby
Bix::Application.boot(:persistence) do
  init do
    require "rom"
    require "rom-sql"
  end

  start do
    container = ROM.container(:sql, Sequel.connect(ENV['DATABASE_URL'])) do |config|
      config.auto_registration(File.expand_path("lib/bix"))
    end
    register(:container, container)
  end
end
```

When we have the `require` for `rom` and `rom-sql` here, we can move them out of `config/environment.rb`. I suggest you do that now, leaving that file relatively clean:

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

Files defined in `system/boot` define dependencies for our application. This `persistence.rb` is the first of two dependencies that we'll create for our application in this series. The second one will be one called `web.rb`, and that will contain code for booting web... things.

This code in `system/boot/persistence.rb` defines a `dry-system` dependency called `:persistence`. This dependency initializes by requiring the cruicial `rom` and `rom-sql` gems. Then when this dependency starts up properly (during the application's finalization), it will create a new `ROM.container` object, and register it as `:container`.

But register it, _where_? I'm glad you asked!

Let's try restarting `bin/console` and running this code:

```
Bix::Application["container"]
# => #<ROM::Container ...>
```

Aha! That `register` call has made our database's container available as `Bix::Application["database"]`. You might be slightly horrified to find out that this is _even more typing_ required for initialising a repository. It is now:

```ruby
Bix::Repos::User.new(Bix::Application["database"])
```

But before it was:

```ruby
Bix::Repos::User.new(Bix::Container)
```

Well, this seems like a bad thing... but it is only because we've done half the job here.

We've cleaned up our `config/environment.rb` code by adding in `dry-system` and it's related configuration, and that's nice now. But you might remember that I talked about a _second_ gem at the start of this post. And that's what we're missing. Now we need to talk about `dry-auto_inject`.

### Dry Auto Inject

The `dry-auto_inject` gem provides _dependency injection_ into classes. Oh great your eyes have glazed over. Okay I'll put it another way: it will allow us to write:

```ruby
Bix::Repos::User.new
```

Instead of:

```ruby
Bix::Repos::User.new(Bix::Application["database"])
```

The _dependency_ of the _database_ will be _auto(matically) injected_ into the `Bix::Repos::User` class.

Let's get started by adding the `dry-auto_inject` gem into our `Gemfile`:

```ruby
gem 'dry-auto_inject'
```

Then we'll run `bundle install` to install this gem.

Next up we'll add two lines to `config/environment.rb`. The first one is to require this gem:

```ruby
require "dry/auto_inject"
```

The second is designed to provide another constant

```ruby
module Bix
  class Application < Dry::System::Container
    # ...
  end

  Import = Dry::AutoInject(Application)
end
```

This `Import` constant will allow us to import (or _inject_) anything registered with our application into other parts. Let's see this in action now by adding this line to `lib/repos/user.rb`:

```ruby
module Bix
  module Repos
    class User < ROM::Repository[:users]
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

### The Application container

It's worth mentioning here (briefly) that all of our application's dependencies have been registered with `dry-system`, not just the database. So if we really wanted to, we could initialize a user repository like this:

```ruby
Bix::Application["repos.user"]
```

This is a side-effect of the `auto_register` setting in `config/environment.rb`. Also worth noting in this section is the `default_namespace` setting in that same file. It's currently set to `'bix` and it means that we can initialize our repository with:

```ruby
Bix::Application["repos.user"]
```

If we did not have this setting, we would need to initialize it with:

```
Bix::Application["bix.repos.user"]
```

The `default_namespace` setting is just there to reduce what we have to type when referencing things registered in our application's container.

## Summary

By using two gems -- `dry-system` and `dry-auto_inject` -- we have been able to drastically clear up our application's code.

Most of the cleaning happened in `config/environment.rb`, thanks to `dry-system`. This gem alows us to automatically require all the files that our application has in `lib`, and have them registered with `Bix::Application` so that we can reference them easily.

The `dry-system` gem has also provided us a way of taking out our database configuration into a separate file, by way of `system/boot/persistence.rb`.

Finally, we used `dry-auto_inject` to inject the database's configuration (the ROM container object) into the `Bix::Repos::User` class. This has allowed for shorter code to initialize our repository.

In the next part, we're going to look at how to use more dry-rb gems to add validations to our application, and we'll see another benefit of `dry-auto_inject` demonstrated.
