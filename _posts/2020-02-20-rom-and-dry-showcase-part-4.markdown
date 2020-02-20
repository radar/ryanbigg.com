---
wordpress_id: RB-1582157866
layout: post
title: "ROM and Dry Showcase: Part 4"
---

This is the 4th (and final) part of a 4 part series.

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
    Rack::Builder.new do
      use Hanami::Middleware::BodyParser, :json
      run Bix::Web::Router
    end
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
     Failure/Error: Bix::Web::Router

     NameError:
       uninitialized constant Bix::Web
     # ./spec/web_helper.rb:6:in `app'
     # ./spec/web_helper.rb:10:in `post_json'
     # ./spec/requests/users_spec.rb:15:in `block (4 levels) in <top (required)>'
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

This two lines will require the hanami gems that we're going to be using here. Where we'll use these gems is in a couple of files. The first is the router itself, which we'll put at `lib/bix/web/router.rb`:

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
