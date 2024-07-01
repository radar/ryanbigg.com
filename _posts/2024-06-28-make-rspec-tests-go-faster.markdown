---
wordpress_id: RB-1718873926
layout: post
title: Decreasing Ruby app build times
---

**EDIT:** I wrote these as notes for myself a few weeks ago when my brain wouldn't stop spinning on this problem. Writing things down gets it out of my brain and lets me do simple things, like "engage in conversations" or "sleep".

We've now undertaken _some_ of this work mentioned in the post, and our builds have gone from 45 minutes down to as low as 14 minutes. The major thing that improved build time was making the build machines faster... but don't discount the rest of the stuff in this post too. After all, tests are code, and all code should be maintained and made to perform when necessary.

---

This week and next it's the "cooldown sprint" at work where we prioritise addressing tech debt over regular feature development. As a part of that work, I'm working on bringing down the test run time on one of our biggest and well-tested Rails apps from its current mean duration of 45 minutes.

This 45 minute cost is paid thrice:

1. Once for your branch
2. Once it gets to `develop` (shipped to staging environments)
3. Once it gets to `master` (shipped to sandbox + production environments)

So to get out a change of even just a single line to production takes 2.25 hours total, assuming you're getting a median build time. 2.25 hours seems like an exorbitantly long time. And it is. Over the 8 hour work day, we would be able to ship 3.5 different changes to production.

This app has quite a number of end-to-end feature requests which follow this pattern:

1. Create a user + merchant account
2. Create some relevant data
3. Login as that user + merchant combo
4. Navigate to page where the data is
5. Make some assertions about what the page looks like or how it performs

And a lot of these tests test business-critical features of our application, like that we can submit payments through our Virtual Terminal or that a payment plan is setup to reoccur on the correct schedule.

For these tests, we've relied a lot on Capybara running Selenium and a headless Chrome instance. This setup works exceptionally well for us, allowing us to write more Ruby code to test the Ruby code we've written in the app.

## Straightforward ways of solving things

There are some straightforward ways we could solve this slowness. We could upgrade the machines that run our tests. The current configuration is by no means at the top (or bottom) end for the configuration bracket for the type of machines. Faster machines surely mean faster tests, right? The caveat there is that faster machines also mean more dollars. Are there things we can do that don't cost us money?

The other straightforward thing is to parallelise these tests out so that they don't run in sequence all on the same machine. We did that, parallelising to 4 nodes and then to 8, using the wonderful [Knapsack Pro](https://knapsackpro.com) gem. Knapsack suggests parallelising up to 19 nodes, but again this means more machines and more dollars. This could potentially block other builds on other projects from running as well, as we have a low ceiling on how many concurrent build machines we are running across the whole org. The moment we run two distinct builds for this project that would mean up to 38 build machines tied up.

If the tests for one build across 19 machines were to run for 5 minutes, the total cost would be $0.28USD. The old adage of developer time being expensive and computer time being cheap holds up.

## And then it gets murky from there

Then there are the not so straightforward things. Are there particular reasons for the slowness of our tests? Are the factories that are being used to build up the data for these tests doing too much?  In our case, I've added [`test-prof`](https://github.com/test-prof/test-prof) to our app and run its factory profiler and detected no overly large factory there.

Is there a particular page which is slow, that a large majority of these tests hit? I noticed that when I ran a _headful_ browser of Chrome (so I could see what each test was doing) that each of the tests hit the dashboard page, which has a collection of charts. Every test waited for these charts to finish loading before proceeding. I commented out the line of code which was rendering all of these charts, and saw a 20% improvement in test run time. Obviously we can't comment these out all the time, but at least that's something we could probably toggle on/off depending on if the test needed it. I'll have to dig into this one.

## An alternative approach for feature specs

Could we have written these tests in a different way? Do they need to be full-on integration tests that set up data in the database, just to validate information appears in certain positions on the page?

I would say that for the less important pages, we don't have to do such a setup. We have a frontend that's built on React and TypeScript, with those TypeScript types being informed by our backend GraphQL API. And notably here we're not just blindly grabbing things like `Purchase` off `@graphql/types`, we're specifically defining types that match the relevant query, using code like:

```tsx
type Merchant = NonNullable<GetPurchaseDetailQuery['merchant']>;
export type Purchase = NonNullable<Merchant['purchase']>;
```

 The components expect the _exact_ data from the query, and nothing different. We could write some frontend-focussed tests for these using React Testing Library, creating some tests that test:

1. When a particular component...
2. receives a particular structure...
3. it looks a certain way.

There's no need to interact with a database here, given that the automatically generated types are going to tell us if the data structure is right or wrong. We can write lighter-weight request specs that assert that, yes, when certain data exists in the database that our GraphQL API presents it in _this_ particular format. The difficulty here is that the query structure used in these tests may vary over time from the structure defined in the components.

In my experience, these React Testing Library tests have been just as easy to write as the Capybara specs, and I've been able to setup the fixture data again thanks to the TypeScript types. These tests then run in _milliseconds_ as opposed to _seconds_. The original RSpec tests for a particular part of our test suite, the Transaction Detail page, ran in 24.75 seconds. These same tests in React Testing Library take 1.66 seconds, and that's including test runner setup time. That's almost 15x faster.

I think there's definitely some things we could work on pulling out of Capybara feature specs and into React Testing Library tests, to really bring down the slow tests. The biggest culprits for the slowness, looking purely at test duration have been the feature tests, by far.

## Docker setup is also a factor

The tests are run inside a Docker container which is built before most test runs rather than read from a cache, due to the ephemeral nature of the build machines. The base image for these containers has to come from _somewhere_, and that _somewhere_ is a Docker registry. I've looked into ways of making the build machines use the cache with mixed success. It's still an avenue I'd like to pursue, as it turns a 5-minute initial build step (that blocks every other step!) into one that runs for about half a minute. I've even seen some cases where that step can run in as quick as 14 seconds.

One aspect that has helped here is splitting the Dockerfile into a multi-stage build that builds it in 4 separate stages:

1. OS-level setup
2. Ruby setup
3. Node setup
4. Final compilation for CSS + JS

The Ruby + Node steps run concurrently, saving roughly 2-3 minutes compared to if they ran sequentially. We have investigated adding Docker-level caching for both the Ruby and Node steps, but haven't gotten as far as having a system that reliably works for each build. It feels like a `cache-from` declared that matches the multi-stage target would work, but I can't seem to make the build machines acknowledge that config and pull it in.

Or perhaps there's a way to cache the packages gathered for those steps, storing them off the machines in some long-term storage and pulling them down before each build? Then Ruby + Node would only install the differences (if any) that are on that branch.

## Slicing up the app

Finally, my absolute _golden path_ idea on this topic is that the tests that run when you push a branch, should only be the tests related to the code that you changed. If I'm making changes on Part A of the system, then it doesn't make sense to run tests for Part B on all branches. Running the entire test suite before a production deploy makes sense, but not on the earlier branches.

To that end, there's probably investigative work to go on with this app where the app could be split into something like Hanami's "slices", so we have Slice A with its own tests, then if there's file changes in Slice A then Slice A's tests get run, but Slice B's tests don't. That seems like work that would be greater than many cooldown sprints in a row, and so I'm happy to leave that as just a thought bubble for the time-being.
