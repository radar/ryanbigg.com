---
wordpress_id: RB-1580704900
layout: post
title: "ROM + Dry Showcase: Part 3 - Testing"
published: true
---

This is the 3rd part of a 4 part series.

* Part 1: [Application + Database setup](/2020/02/rom-and-dry-showcase-part-1)
* Part 2: [Validations + Transactions](/2020/02/rom-and-dry-showcase-part-1)

In this 3rd part, we're going to look at how we can test the application that we've built so far. In particular, we'll test three classes:

* The contract -- to ensure it validates input correctly
* The repository -- to ensure we can insert data into our database correctly and that we could find data once it is inserted
* The transaction -- to ensure that we can process the whole transaction correctly

When we get up to the transaction part, we'll see how we can use one more feature of `dry-auto_inject` to stub out the repository dependency in this particular test. Why would we want to stub out this dependency? Because we already have tests that make sure that our repository works! We don't need to test it again a second time in the transaction class.

Let's get started!

## Adding RSpec

First things first! We will need to set up the RSpec testing framework, and a gem called `database_cleaner-sequel`. The database cleaner gem will ensure that our database is kept pristine across the different tests in our application. If we have data "leaking" across tests, that data may influence the outcome of other tests.

Let's add these gems to our `Gemfile` now:

```ruby
group :test do
  gem 'rspec'
  gem 'database_cleaner-sequel'
end
```

We've put these gems in a "test" group, as we will not want them installed when we deploy to production.

Then we'll install these gems locally with `bundle install`.

Next up, we can initialize RSpec by running:

```
bundle exec rspec --init
```

This will create us a `spec` directory with a file called `spec_helper.rb` in it. Here's that file with the comments removed _and_ with the database cleaner configuration added:

```ruby
RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  config.before do
    DatabaseCleaner.clean
  end
end

require_relative '../config/application'
Bix::Application.finalize!

require 'database_cleaner/sequel'
DatabaseCleaner.strategy = :truncation
```

At the bottom of this file, I've also added two lines to require `config/application.rb` and to finalize our application. This will ensure that by
the time the tests run everything for our application has been loaded.

At the bottom of the `configure` block, we clean the database to ensure that each and every test starts out with a completely empty database. How that database gets cleaned is defined by the final two lines in this file: it's a `truncation` strategy meaning that each table in our database will be truncated before the test runs.

That's all the setup that we'll need to do here. Let's write our first couple of tests for the contract.

## Testing the contract

When we go to test a contract, we want to be sure that both the valid _and_ invalid paths are covered effectively. Let's start off with the invalid paths first and we'll finish with the valid one. We'll create a new file in `spec/contracts/users/create_user_spec.rb`:


```ruby
require 'spec_helper'

RSpec.describe Bix::Contracts::Users::CreateUser do
  context "requires first_name" do
    let(:input) do
      {
        last_name: "Bigg",
        age: 32
      }
    end

    let(:result) { subject.call(input) }

    it "is invalid" do
      expect(result).to be_failure
      expect(result.errors[:first_name]).to include("is missing")
    end
  end

  context "requires last_name" do
    let(:input) do
      {
        first_name: "Ryan",
        age: 32
      }
    end

    let(:result) { subject.call(input) }

    it "is invalid" do
      expect(result).to be_failure
      expect(result.errors[:last_name]).to include("is missing")
    end
  end
end
```

In both of these tests, we're setting up some invalid input for the contract. And also in both of these tests, we're asserting that the contract shows us an error indicating either the `first_name` or `last_name` fields are missing.

We can run this test with `bundle exec rspec`. When we do this, we'll see that the contract is working as intended:

```
2 examples, 0 failures
```

This is good to see, and will now provide us with a safety net. If someone was to delete one of the lines from the contract _perhaps accidentally_, then our tests would catch that.

Let's add another test for the happy path, the path of successful validation, to this file too:

```ruby
RSpec.describe Bix::Contracts::Users::CreateUser do
  context "given valid parameters" do
    let(:input) do
      {
        first_name: "Ryan",
        last_name: "Bigg",
        age: 32
      }
    end

    let(:result) { subject.call(input) }

    it "is valid" do
      expect(result).to be_success
    end
  end

  ...
```

In this test, we provide all the correct values for the input and therefore our contract should be successful. Let's run the tests again and see:

```
3 examples, 0 failures
```

Great!

We're able to test our contract just like a standard Ruby class. We initialize the contract, and then depending on the input it is given, the contract with either succeed or fail.

## Testing the repository

To test the repository, we can take the same kind of path. For this repository's tests, we need to assert that the `create` method for `Bix::Repos::UserRepo` does a few things. What things? Well, let's look at our code for the repository:

```
module Bix
  module Repos
    class UserRepo < ROM::Repository[:users]
      include Import["container"]

      struct_namespace Bix

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

The repository has a `create` method and with this method we need to make sure:

* The method returns a `Bix::User` object -- because `struct_namespace` has configured the repository to use the `Bix` namespace for all structs.
* That the `Bix::User` object returned has an `id` attribute -- this ID is automatically set by the database
* That both `created_at` and `updated_at` are set automatically -- based on how we've configured the command at the top of the repository.

The repository also has an `all` method, and just to be thorough we can add a simple test for this method to assert that `Bix::User` objects are returned.

Let's add the tests for the `create` method first. We'll create a new file at `spec/repos/user_repo_spec.rb` for these tests:

```ruby
require "spec_helper"

RSpec.describe Bix::Repos::UserRepo do
  context "#create" do
    it "creates a user" do
      user = subject.create(
        first_name: "Ryan",
        last_name: "Bigg",
        age: 32,
      )

      expect(user).to be_a(Bix::User)
      expect(user.id).not_to be_nil
      expect(user.first_name).to eq("Ryan")
      expect(user.last_name).to eq("Bigg")
      expect(user.created_at).not_to be_nil
      expect(user.updated_at).not_to be_nil
    end
  end
end
```

This test asserts that when we call `create` on our repository that it will return a `Bix::User` object and that the object has values for `id`, `first_name`, `last_name`, `created_at` and `updated_at`.

If we run this test with `bundle exec rspec`, we'll see that it passes:

```
4 examples, 0 failures
```

Good! We've now asserted that at least the `struct_namespace` and `commands` methods from our repository are working as they should. If a mistake was to be made, like accidentally removing the `struct_namespace` method from the repository, our test would break:

```
  1) Bix::Repos::UserRepo#create creates a user
     Failure/Error: expect(user).to be_a(Bix::User)
       expected #<ROM::Struct::User ...> to be a kind of Bix::User
```

The issue with this repository returning a `ROM::Struct::User` object instead of a `Bix::User` object is that the `ROM::Struct::User` objects will not have access to any of `Bix::User`'s methods, like `full_name`. If we had this mistake in our application, and we tried using `User#full_name` then our application would break. This demonstrates why it's important to have tested that `struct_namespace` is working.

Let's add another quick test to our repository to test `all`:

```ruby
context "#all" do
  before do
    subject.create(first_name: "Ryan", last_name: "Bigg", age: 32)
  end

  it "returns all users" do
    users = subject.all
    expect(users.count).to eq(1)
    expect(users.first).to be_a(Bix::User)
  end
end
```

This test uses `create` to setup a user in our database, and then asserts that when we call `all` we get a user back.

If we run this test, we'll see that it's already working:

```
5 examples, 0 failures
```

This means that our `all` method now has some test coverage. If this method was to break _somehow_, then our test would indicate that the method was faulty and then we wwould know to fix it.

## Testing the transaction

So far, our testing of contracts and repositories has been very straightforward Ruby class tests. We have relied on `subject` from RSpec which is a method that behaves like this:

```
def subject
  <described class>.new
end
```

Now we're going to look at how to test a transaction, and here's where things are going to get more interesting. Rather than relying on RSpec's own `subject`, we're going to define our own. And when we define our own, we're going to use a feature of `dry_auto-inject`, called _dependency injection_. This feature will allow us to inject a stubbed repository into our transaction, so that we don't have to hit the database for our transaction's test.

Not hitting the database means that we will save time on this test: there's no need to make a request to a system outside of our Ruby code, and that'll also mean that `database_cleaner` will not need to clean anything from the database. Ultimately, by injecting the repository dependency into our application's transactions when we're testing them means that we can have fast transcation tests.

Let's look at how to do this by creating a new file at `spec/transactions/users/create_user_spec.rb`:

```ruby
require 'spec_helper'

RSpec.describe Bix::Transactions::Users::CreateUser do
  let(:user_repo) { double("UserRepo") }
  let(:user) { Bix::User.new(id: 1, first_name: "Ryan") }

  subject { described_class.new(user_repo: user_repo) }

  context "with valid input" do
    let(:input) do
      {
        first_name: "Ryan",
        last_name: "Bigg",
        age: 32,
      }
    end

    it "creates a user" do
      expect(user_repo).to receive(:create) { user }
      result = subject.call(input)
      expect(result).to be_success
      expect(result.success).to eq(user)
    end
  end
end
```

In this test, we define our own `subject` block, which will override RSpec's default. We inject the `user_repo` dependency into the transaction object by passing a `user_repo` key in the `new` method. This works because `dry-auto_inject` re-defines `initialize` for classes when we use this syntax:

```ruby
include Import[
  "contracts.users.create_user",
  "repos.user_repo"
]
```

By default, `dry-auto_inject` will load the contract class `Bix::Contracts::Users::CreateUser`, as well as the repo class `Bix::Repos::UserRepo` and provide them to the class through the `create_user` and `user_repo` methods automatically. The keys that we provide to `Import[]` here match the keys that are automatically defined by `dry-system` when it automatically registers the components for our application.

If we want to swap in something else for either the contract or the repository, we can do that by passing in a key matching the name (either `create_user` or `user_repo`) when we initialize this class. Just like we do in our test!

If we wanted to do this ourselves, without any sort of dry gem magic, it would look like this:

```ruby
attr_reader :user_repo, :create_user

def initialize(
  user_repo: Bix::Repos::UserRepo.new,
  create_user: Bix::Contracts::Users::CreateUser.new
)
  @user_repo = user_repo
  @create_user = create_user
end
```

As we can see, by using `dry-auto_inject` along with `dry-system` we get to save a lot of typing.

Let's look at that test again:

```ruby
require 'spec_helper'

RSpec.describe Bix::Transactions::Users::CreateUser do
  let(:user_repo) { double(Bix::Repos::UserRepo) }
  let(:user) { Bix::User.new(id: 1, first_name: "Ryan") }

  subject { described_class.new(user_repo: user_repo) }

  context "with valid input" do
    let(:input) do
      {
        first_name: "Ryan",
        last_name: "Bigg",
        age: 32,
      }
    end

    it "creates a user" do
      expect(user_repo).to receive(:create) { user }
      result = subject.call(input)
      expect(result).to be_success
      expect(result.success).to eq(user)
    end
  end
end
```

The test asserts that when we use `subject.call` that the repository receives the `create` method once. We've stubbed this method to return a `Bix::User` object, and that's what we'll see when we call `result.success` at the end of the test.

Let's run this test and we'll see how it goes:

```
6 examples, 0 failures
```

Success! We're able to test our transaction without it hitting the database at all. This means that our transaction test is isolated from the database, leading to it being quick. While we only have one transaction test _now_, as this application grows and we add further transaction tests this quickness will quickly pile-up to a big benefit.

There's also another benefit of this isolation: if we had database constraints then we would have to cater for those in this test.  Imagine for instance that when we created users that they had to be associated with a "Group" and that Groups had to be associated with an "Account". In a normal application to test such a thing, we would need to create three separate objects our database: an account, a group, and a user.

For one test, it won't matter too much. But if accounts, groups and users are the _core_ of our application, it would quickly stack up to lots of database calls. By stubbing out the user repository dependency while testing this transaction, we have isolated that test from any database concern. A better place to test that sort of database concern would be in the repository test, anyway.

To finish up, let's add one more test for what happens when this transaction fails due to invalid input:

```ruby
context "with invalid input" do
  let(:input) do
    {
      last_name: "Bigg",
      age: 32,
    }
  end

  it "does not create a user" do
    expect(user_repo).not_to receive(:create)
    result = subject.call(input)
    expect(result).to be_failure
    expect(result.failure.errors[:first_name]).to include("is missing")
  end
end
```

This `input` is missing a `first_name` key, and so our transaction should fail. This means that the `user_repo` should _never_ receive a `create` method, because our transaction will only call that if the `validate` step passes. When the validation fails, we would expect the result from this transaction to be a failure, and that failure to contain errors indicating what went wrong.

When we run this test with `bundle exec rspec`, we'll see it pass:

```
7 examples, 0 failures
```

## Summary

In this 3rd part of the ROM and Dry showcase, we've seen how easy it is to add tests to our application to ensure that the individual parts of the application are working.

We saw that in order to test a contract and a repository, we can initialize either class and call the methods we want to test. There's nothing particularly special that we've had to do to test these classes; we treat them like the plain Ruby classes they are.

When testing the transaction, we've chosen to isolate those tests from the database by injecting a stubbed `UserRepo` object in place of the real thing. This isolation will mean that our tests will not have to concern themselves with setting up database state -- for instance, if we had foreign key constraints -- and over time it will mean that our transaction tests will be lightning fast.

In the next part of this series, we'll add the final piece of our application to our stack: a way to make HTTP requests. And we'll _definitely_ be adding tests for this too!
