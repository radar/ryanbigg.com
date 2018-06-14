---
wordpress_id: RB-1529017401
layout: post
title: Making Tests Go Faster
---

At Culture Amp, we have a large Rails app that we’ve been building since 2011. This app has about 150k LOC and an extensive test suite that uses Rubocop, RSpec, Capybara, Cucumber and FactoryBot.

We run these tests for the application on Buildkite and currently they take about 16 minutes to run end-to-end. This is 16 minutes that developers are waiting to get feedback on whether their build passed or failed. While this is not unacceptably high, we could do better. Developers could ship things faster, or respond quicker to build failures, with faster builds.

A large chunk of that build time is spent running these tests. In fact, we currently have 8 machines running tests concurrently for each build to speed it up.

We have a bunch of tests in this application that, like in many Rails applications, were written to get something shipped fast with no real focus on making the tests or code particularly fast. As a result, we have tests that create more records in the database than is necessary. While one test taking 1-2 seconds longer than it should isn’t a bad thing, hundreds of these tests taking seconds to run each impacts the build time.

One particularly major offender in our app is a factory for the Survey model. This factory creates an extensive set of records in the database and takes over a second and a half to run. Any test using this factory incurs this delay. And there’s a lot of those tests.

We could refactor this factory to not do such nasty things, but because this factory is for our God Class, it is used everywhere in the application. Refactoring would be a months long effort.

So instead, the better approach is to find tests that are slow and have a dependency on this factory and to remove that dependency where possible.


## Finding slow tests

We configured RSpec to print out the slowest examples in a test run at the end of every test.

This comes from this line in our `spec_helper.rb` file:

```ruby
# Print the 10 slowest examples and example groups at the
# end of the spec run, to help surface which specs are running
# particularly slow.
config.profile_examples = 10
```

When our tests run, we can view this output and see trouble spots:

```
Top 10 slowest examples (13.85 seconds, 61.6% of total time):
    [TEST DESCRIPTION GOES HERE}
    2.08 seconds ./spec/models/report_spec.rb:134
```


One particular trouble spot that I saw was this `spec/models/report_spec.rb`. This whole file took about 1m20s to run locally, and only for 116 examples. This test used the survey factory extensively, which made the test slow.

This seemed to me like an easy target: a model test that was slow when it should be fast. So I set about fixing it.

That was October 2016. I have since attempted to fix it on at least five separate occasions but gave up. Then this week, I finally managed to do it. Here’s some tips I can share.

## Don’t create the world

The first tip is a simple one: create the least amount of database objects as possible. By invoking the survey factory, 398 database queries run to create all the things that the factory (and its associated factories) builds. Most tests in our application do not require this, but some do.

I went through the test and replaced each survey factory invocation with a basic_survey factory:

```ruby
factory :basic_survey, class: Survey do
  sequence :name do |n|
    "Basic Survey #{n}"
  end

  # some traits go here
end
```

This creates the bare minimum survey in the database, and leads to ONE database query.

I methodically went through every example in `spec/models/report_spec.rb` and attempted to replace this call:

```
FactoryBot.create(:survey)
```

With this one:

```
FactoryBot.build(:basic_survey)
```

Some methods within the `Report` class do not depend on a _persisted_ `Survey` object, but just one configured in a particular way. So we can use `FactoryBot.build` to initialize a new `Survey` instance with the details from the factory, meaning no database calls are made for this factory invocation.

For the ones that I could use `build` for, I investigated the reasons why the tests needed a persisted survey and when I was satisfied with the answer, I switched to using `FactoryBot.create(:basic_survey)`.

This worked for the most part, but there were some tricky parts.

## Tracking down extra queries

The 2nd tip is that you should inspect database queries and know where they're coming from.

Sometimes, the tests in `spec/models/report_spec.rb` relied on the survey being setup in the very particular way that the survey factory did it. In most cases, I wasn't able to jump through the code to see where certain records were being created or updated, as our factories are pretty large and complex.


The first thing I did to track this down was to confirm that a database query was updating a record in a particular way. Turning on the Mongoid query logging with this line at the top of the spec file:

```ruby
Mongoid.logger.level = 0
```

Meant that I could see _all_ database queries that were being executed in this test.

From here, I could see the database query that I thought was responsible:

```
D, [<timestamp> <pid>] DEBUG -- : MONGODB | localhost:27017 | murmur_test.update | STARTED | {"update"=>"surveys", ...
```

But this output only tells me that the query is happening, not _where_ it is happening. Fortunately, I've got a little piece of code that I wheel out for situations like this:

```ruby
class LoggingSubscriber
  def started(event)
    if event.command["update"] == "surveys"
      puts caller.select { |c| c =~ /murmur/ }.join("\n")
      puts "*" * 50
    end
  end

  def succeeded(event)
    # p event
    # p event.duration
  end

  def failed(event)
  end
end

subscriber = LoggingSubscriber.new
Mongo::Monitoring::Global.subscribe(Mongo::Monitoring::COMMAND, subscriber)
```

I can put this code at the top of the test file. This code subscribes to _any_  Mongo database queries through the `Mongo::Monitoring` feature built into the `mongo` gem.

When a query happens, the `started` method in this subscriber is called and passed the event. I can then inspect this event and make it show information about certain queries. In this example, I'm getting it to output stack trace information for queries that update the `surveys` collection. The "murmur" here is the name of our application; I'm using it here to only show stack trace lines from our application.

With this code in my app, I can now see both the query _and_ where it is coming from:

```
...murmur/spec/factories/common.rb:397:in `block (3 levels) in <top (required)>'
...murmur/spec/models/report_spec.rb:907:in `create_new_survey'
...murmur/spec/models/report_spec.rb:551:in `create_new_survey'
...murmur/spec/models/report_spec.rb:4:in `block (2 levels) in <top (required)>'
...murmur/spec/models/report_spec.rb:5:in `block (2 levels) in <top (required)>'
...murmur/spec/models/report_spec.rb:113:in `block (4 levels) in <top (required)>'
...murmur/spec/models/report_spec.rb:118:in `block (4 levels) in <top (required)>'
**************************************************
D, [2018-06-15T08:44:49.977091 #11587] DEBUG -- : MONGODB | localhost:27017 | murmur_test.update | STARTED | {"update"=>"surveys",
```

The stack trace shows me that this query is happening in a factory. With the stack trace lighting the way, I was able to see what the query was doing and then remove the need for it in the test.

I then went through the remainder of this file and reduced the runtime from 1 minute and 15 seconds to 18 seconds.

## There's more to do

Taking almost a full minute off our build time doesn't sound like much, but it's a 16th of the build time saved. There's plenty more cases like this in our application that we could fix and reduce the build time further. This would let developers get faster feedback on their builds, making the whole development cycle more efficient.
