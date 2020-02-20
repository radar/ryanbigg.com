---
wordpress_id: RB-1582157866
layout: post
title: "ROM and Dry Showcase: Part 4"
published: false
---

This is the 4th (and final) part of a 4 part series covering the [rom-rb](https://rom-rb.org/) and [dry-rb](https://dry-rb.org/) suites of gems.

* Part 1: [Application + Database setup](/2020/02/rom-and-dry-showcase-part-1)
* Part 2: [Validations + Transactions](/2020/02/rom-and-dry-showcase-part-2)
* Part 3: [Testing](/2020/02/rom-and-dry-showcase-part-3)

In this last part, we're going to make it so that our application can receive and respond to HTTP requests.

So far, we've been seeing how to use gems either from the `dry-rb` suite of gems, or the `rom-rb` suite of gems. In this part though, we're going to be using a gem from a _different_ suite, a suite called Hanami.

Hanami is first and foremost a web framework. It has routes, controllers, actions, views and models. Just like your _other_ favourite web framework -- Rails. But the big difference between Hanami and Rails is that with Hanami we can pick and choose the parts of the framework that we want to use.

Hanami is a _modular_ web framework, and if all we want to use is the router, controllers and actions, then we can. In this part of this showcase, we're going to look at how we can use two gems from Hanami called `hanami-router` and `hanami-controller`. These gems will provide us with the features our application needs to receive and respond to HTTP requests.

Our application will take a request to `POST /users` with a JSON body shaped like this:

```json
{
  "first_name": "Ryan",
  "last_name": "Bigg",
  "age": 32,
}
```

And the _response_ will indicate if the request was successful or not. If it was successful, we will see a JSON response:

```json
{
  "id": 1,
  "first_name": "Ryan",
  "last_name": "Bigg",
  "age": 32
}
```

Let's go!

## Installing the Hanami gems

Let's add these gems to our Gemfile:

```ruby
gem "hanami-controller", "~> 1.3"
gem "hanami-router", "~> 1.3"
```

To install these gems, we can run `bundle install`.

In order to make sure that whatever we build with this application is performing correctly, we'll add a third gem called `rack-test`:

```ruby
gem "rack-test"
```

We're going to be using this gem to test our application in conjunction with RSpec. You might be thinking: why `rack-test`? That's because the part of our application that will recieve and respond to HTTP requests will be a _Rack_ application! Just like every other Ruby web framework out there.

## Setting up the test environment

Before we can write our any code, we need to write tests for it. It'll make sure that our application is working correctly! But before we can write tests, there's a bit of setup we need to do first. We're going to create a new file called `spec/web_helper.rb`. This file will setup how our tests can speak to our Rack application:

```ruby
require "spec_helper"
require "rack/test"

module RequestHelpers
  def app
    Bix::Web.app
  end

  def post_json(path, data)
    post path, data.to_json, "CONTENT_TYPE" => "application/json"
  end

  def parsed_body
    JSON.parse(last_response.body)
  end
end

RSpec.configure do |config|
  config.define_derived_metadata(file_path: %r{/spec/requests/}) do |metadata|
    metadata[:request] = true
  end

  config.include Rack::Test::Methods, request: true
  config.include RequestHelpers, request: true
end
```

We set the `web` metadata flag on any tests that will go in `spec/requests`. This allows us to specify that the `Rack::Test::Methods` and `RequestHelpers` modules are included _only_ into tests under that particular directory.

The `Rack::Test::Methods` module will include methods that we can use to make requests to our app, like `get`, `post` and so on.

The `RequestHelpers` module defines one method so far, called `app`. This `app` method is what the `rack-test` gem uses to know what application to talk to when we use those `get` / `post` / etc. methods.

We've defined the `app` value here to be a small Rack application that compiles a few parts. The first is `Hanami::Middleware::BodyParser`. This is a piece of middleware, that will convert our JSON input into parameters that our controller can access. The second part is `Bix::Web::Router`, which will be the main Ruby entrypoint for our application. That doesn't exist right now, but we'll create it in a moment. We'll see both of these parts again a little later on again.

The `post_json` method in `RequestHelpers` will allow us to make a `POST` request to our application and to send through JSON data with that request. Remember: the web part of application here is going to take JSON as input during a request, _and_ it will also return JSON in a response. The `parsed_body` method will give us a Ruby hash of the response's body, and we can use this later on to assert the returned data is what we expect.

Before we create our router and all of the other parts, let's write a couple of simple tests to make sure it will behave as we wish.

## Writing our first test

Currently, our application has a single transaction for creating users. We're going to use this transaction very soon, using it when a request to `POST /users` is made. We're going to add two tets now. These two tests will ensure that the application behaves correctly for valid and invalid input to `POST /users`. Let's add these new tests to `spec/requests/users_spec.rb`:

```ruby
require "web_helper"

RSpec.describe "/users" do
  context "POST /" do
    context "with valid input" do
      let(:input) do
        {
          first_name: "Ryan",
          last_name: "Bigg",
          age: 32,
        }
      end

      it "succeeds" do
        post_json "/users", input
        expect(last_response.status).to eq(200)
        user = parsed_body
        expect(user["id"]).not_to be_nil
        expect(user["first_name"]).to eq("Ryan")
        expect(user["last_name"]).to eq("Bigg")
        expect(user["age"]).to eq(32)
      end
    end

    context "with invalid input" do
      let(:input) do
        {
          first_name: "Ryan",
          last_name: "Bigg",
          age: 32,
        }
      end

      it "returns an error" do
        post_json "/users", input
        expect(last_response.status).to eq(422)
        user = parsed_body
        expect(user["errors"]["first_name"]).to include("is missing")
      end
    end
  end
end
```

These tests should look pretty familiar! They are essentially the same tests for our transaction, just with rack-test methods being the primary difference.

When we attempt to run these tests, we'll see that we're missing a part of our application:

```
  1) /users POST / with valid input succeeds
     Failure/Error: Bix::Web.app

     NoMethodError:
       undefined method `app' for Bix::Web:Module
```

Oh right! We need to setup this Web thing!

## Building the Web component

To setup this web part of our application, we're going to add a new file to `system/boot`, called `web.rb`. In this file, we'll need to require all the gems that we'll be using for the web part of our application:

```ruby
Bix::Application.boot(:web) do |app|
  init do
    require "hanami-router"
    require "hanami-controller"
  end
end
```

This two lines will require the hanami gems that we're going to be using here. Where we'll use these gems is in a couple of files.

The first is a file called `lib/bix/web/application.rb`. This is where we'll define the different Rack pieces for our application:

```ruby
require "hanami/middleware/body_parser"

module Bix
  module Web
    def self.app
      Rack::Builder.new do
        use Hanami::Middleware::BodyParser, :json
        run Bix::Web::Router
      end
    end
  end
end
```

This file is defines the `Bix::Web.app` method that our test is looking for! This method returns a `Rack::Builder` object, which is to say it returns a _Rack application_.

This Rack application uses a single piece of middleware: `Hanami::Middleware::BodyParser`. This middleware is used to take in any JSON request body, and to transform it into parameters for our actions.

The `run` line at the of the builder's block directs Rack to the application that will be serving our requests. Let's build this part now in `lib/bix/web/router.rb`:

```ruby
module Bix
  module Web
    Router = Hanami::Router.new do
      post "/users", to: Controllers::Users::Create
    end
  end
end
```

This file allows us to define routes for the web side of our application. This route defines a `POST /users` request to go to `Controllers::Users::Create`. What is this mythical constant? It's going to be the action that serves this request.

In this application, we're going to put actions inside their own classes. This will keep the code for each action more clearly isolated from other actions.

We'll define this action inside `lib/bix/web/controllers/users/create.rb`:

```ruby
module Bix
  module Web
    module Controllers
      module Users
        class Create
          include Hanami::Action

          def call(params)
            self.body = "{}"
          end
        end
      end
    end
  end
end
```

This action class includes the `Hanami::Action` module from the `hanami-controller` gem. This gives us access to a number of helpful methods, but the only one of these we're using now is `self.body=`, which we're using to set the response body to an empty JSON hash. What's also worth mentioning here is that due to us not specifying a status, this action will return a `200` status.

With our router and controller now setup correctly, let's switch back to looking at our tests.

## Running our tests

When we run these tests with `bundle exec rspec spec/requests` we'll see they're both failing:

```
  1) /users POST / with valid input succeeds
     Failure/Error: expect(user["id"]).not_to be_nil

       expected: not nil
            got: nil
     # ./spec/requests/users_spec.rb:18:in `block (4 levels) in <top (required)>'

  2) /users POST / with invalid input returns an error
    Failure/Error: expect(last_response.status).to eq(422)

      expected: 422
          got: 200

      (compared using ==)
    # ./spec/requests/users_spec.rb:36:in `block (4 levels) in <top (required)>'
```

This is happening because all our action returns is an empty JSON body. Let's work on changing this.

We'll change the action to use the transaction class:

```ruby
module Bix
  module Web
    module Controllers
      module Users
        class Create
          include Hanami::Action
          include Import["transactions.users.create_user"]
          include Dry::Monads[:result]

          def call(params)
            case create_user.call(params.to_h)
            in Success(result)
              self.body = result.to_h.to_json
              self.status = 200
            in Failure(result)
              self.body = { errors: result.errors.to_h }.to_json
              self.status = 422
            end
          end
        end
      end
    end
  end
end
```

At the top of this controller action, we import the `create_user` transaction by using the `Import` constant that we made a few parts ago -- this is from `dry-auto_inject`.

Then we include `Dry::Moands[:result]` -- this gives us access to the `Success` and `Failure` methods we use inside the action.

Inside the action itself, we call the transaction and then use Ruby 2.7's new pattern matching to decide what to do. In the case of a successful transaction, we return the body of the result. If it fails, we return the errors and set the status to 422.

This should be exactly what our test is expecting. Let's run them again and find out:

```
2 examples, 0 failures
```

Good! Our tests for our router are now passing. But this only means that our router is working, not that we can serve HTTP requests yet! We need one final piece for that to work.

## Racking up the server

To run our HTTP server, we'll use a gem called `puma`. Let's add that gem to the `Gemfile` now:

```
gem "puma"
```

And we'll run `bundle install` to install it.

To run the Puma server, we can use the command by the same name:

```
puma
```

When we do this, we get an error:

```
Puma starting in single mode...
* Version 3.12.1 (ruby 2.7.0-p0), codename: Llamas in Pajamas
* Min threads: 0, max threads: 16
* Environment: development
ERROR: No application configured, nothing to run
```

This is because Puma hasn't been told what to run yet. The good thing for us is that Puma will look for a special file to know what to run. That file is called `config.ru`. Let's create that file now:

```ruby
require_relative "config/application"

Bix::Application.finalize!

run Bix::Web.app
```

This file looks a lot like `bin/console`:

```ruby
#!/usr/bin/env ruby

require_relative '../config/application'

Bix::Application.finalize!

require 'irb'
IRB.start
```

The difference is that we're starting a server, instead of starting a console session.

Let's try `puma` again:

```
Puma starting in single mode...
* Version 3.12.1 (ruby 2.7.0-p0), codename: Llamas in Pajamas
* Min threads: 0, max threads: 16
* Environment: development
* Listening on tcp://0.0.0.0:9292
```

Great! We now have a HTTP server listening on port 9292.

To test this out, we can do one of two things. If you have the marvellous [httpie](http://httpie.org) installed, you can run this command:

```
http --json post http://localhost:9292/users first_name=Ryan last_name=Bigg
```

Otherwise, if you're using `curl`, it's a little more verbose:

```
curl --request 'POST' \
-i \
--header 'Content-Type: application/json' \
--data '{"first_name":"Ryan"}' \
'http://localhost:9292/users'
```

(Use HTTPie!)

Either way, what we'll see returned here is a validation error message indicating that our input was not quite complete:

```
HTTP/1.1 422 Unprocessable Entity
Content-Length: 39
Content-Type: application/json; charset=utf-8

{
    "errors": {
        "last_name": [
            "is missing"
        ]
    }
}
```

Note here that the HTTP status is 422 as well.

Great, so that means the _failure_ case for our action is now working as we wished it would.

Let's see if we can test out the success case too with this `http` call:

```
http --json post http://localhost:9292/users first_name=Ryan last_name=Bigg
```

Or this `curl` one:

```
curl --request 'POST' \
-i \
--header 'Content-Type: application/json' \
--data '{"first_name":"Ryan", "last_name": "Bigg"}' \
'http://localhost:9292/users'
```

Now we will see a successful response:

```
HTTP/1.1 200 OK
Content-Length: 140
Content-Type: application/json; charset=utf-8

{
    "age": null,
    "created_at": "[timestamp]",
    "first_name": "Ryan",
    "id": 6,
    "last_name": "Bigg",
     "updated_at": "[timestamp]"
}

```

And that's all now working!

## Summary

In this fourth and final part of the ROM and Dry showcase, we barely looked at either Rom or Dry! Instead, we looked at some pieces of the Hanami web framework.

The Hanami web framework is a great alternative to the Rails framework that [I've loved for a few years](https://ryanbigg.com/2018/03/my-thoughts-on-hanami). What's been great about Hanami in this series is that we were able to opt-in to using Hanami's `hanami-router` and `hanami-controller` gems without having to opt-in to absolutely everything else from Hanami too.

These gems, along with the `puma` and `rack` gems, have allowed us to build a HTTP interface to our application. Our application is now capable of receiving and responding to HTTP requests.

I hope that this series has given you a great demonstration of what the rom-rb, dry-rb and Hanami gems are capable of. I strongly believe that these are viable, new-age alternatives to Rails for building modern Ruby applications.

I hope you continue to explore what these gems can offer and how you can approach building better, easier to maintain applications with them.
