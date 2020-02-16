---
wordpress_id: RB-1580704900
layout: post
title: "ROM + Dry Showcase: Part 3 - Testing"
published: false
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
