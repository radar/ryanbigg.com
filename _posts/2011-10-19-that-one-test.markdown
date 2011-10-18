--- 
wordpress_id: RB-314
layout: post
title: That One Test
---

Have you ever worked on a project that has tests? Probably. How about a project that has a test that runs fine by itself but fails when the whole suite runs? Maybe. That's what I'm going to be talking about here today.

You probably already know the story. You have a whole bunch of tests, perhaps hundreds of them, that take multiple minutes to run as a whole and about 32% of the way through *one* of the test fails. But that's ok, because you're running `rspec` with the `--fail-fast` option which will make RSpec quit the instant it comes across a failure, right?

Or maybe not. Well, now you know.

Anyway, this one test is testing some piece of obscure, but required, functionality. Whenever you try thinking about when you worked on it -- or even *if* you worked on it -- your mind starts going fuzzy and the room starts to spin widdershins. You run the test by itself and RSpec reports this back:

    .
    
    1 example, 0 failures

You put on your "Challenge Accepted" face and re-run the tests again, perhaps this time with the `--fail-fast` option enabled. Sure enough, the test fails again. 

Cool story.

----

### Step 1: DON'T. PANIC.

You want to fix this. It's 5:30pm. On a Friday. The Friday before a long weekend. The very same Friday you promised someone you'd be home early. But That One Test is being a *complete dick* about things.

However, there's light at the end of the tunnel: only 32% of the tests need running before the failure is going to happen. RSpec will (as far as I have observed) run the tests in precisely the same order all the time. This means that the other 68% of your test suite can be excluded from the suspect list.

To fix this bug, you're going to need a list of all the tests that ran before this test. RSpec doesn't provide this functionality, and so you're going to have to build it yourself. But it's easy! Don't Panic.

----

### Step 2: Build a list of suspects

You know those pretty little green dots / red Fs / yellow stars RSpec prints out? They're all coming from a part of RSpec called the <a href='https://github.com/rspec/rspec-core/blob/master/lib/rspec/core/formatters/progress_formatter.rb'>`ProgressFormatter`</a>. Look, sensible code! If the example passes, it calls `output.print green('.')`. You probably couldn't get more sensible than this.

My *point* is that RSpec uses this as a kind of reporting tool to show you that progress is actually being made. The *great* thing about this is that you can write your own! With your own tool, you'll be able to output to a log what specs are being run and then use this as a base list of suspects.

Create a new file called `spec/support/spec_logger.rb` and put this content in it:

    require 'rspec/core/formatters/progress_formatter'
    class SpecLogger < RSpec::Core::Formatters::ProgressFormatter

      def example_started(example)
        super
        File.open("specs.log", "a+") do |f|
          f.write(example.location + "\n")
        end
      end
    end

What this does is that it inherits the standard green dots, red Fs and yellow stars from `RSpec::Core::Formatters::ProgressFormatter` and extends it with a bit of functionality that will log exactly what specs are being run during a test run.

To use this formatter in your next (fast failing) test run, run it using `bundle exec rspec spec --require spec/support/spec_logger --formatter SpecLogger --fail-fast`.

Once this command completes, you'll have a list of suspects in `specs.log` at the root of your project.

----

### Step 3: Find the perp

In this `specs.log` file you should have a list of specs that have been run just recently, with the final one being the one that is failing mysteriously. Now let's assume that in the entire test suite there are exactly 100 tests total. With this failure occurring 32% of the way through, it should be failing at the #32 test. This number is important because it's equally divisible by two.

However, the locations listed in specs.log are going to have duplicate files, and RSpec only allows you to run multiple files at a time, and not multiple locations within multiple files. This list should be culled to only have one line for each file.

Next, the trick is to take one half of these *plus* the file containing the failing test and run them together. If you take the first 15 tests and run them in an RSpec command like `bundle exec rspec spec <file1> <file2> ... <file15>` then you'll be able to see a result.
  
This is *exactly* the process `git bisect` uses, or at least what I think it does.
  
If these tests are failing with these first fifteen, then the failure is most likely caused by one of those tests. If it's not, then it's in the other half. Re-run the test suite with that half and see if you get a failure there.

When you know which half it is, half it again and keep culling down the list of suspects until you have (ideally) two files: the first will be the one that's causing the breakage, and the second one will be the one containing the test that's failing.

From there, figure out what test in that first file is causing things to fail. Comment out half the tests, run the two files again. If it passes then it's in that half, if it fails then it's not. Keep at it until you've distilled it down to the minimum amount of tests possible, which can be as low as two, but there could be a case where two tests in the original file are causing the disruption.

---

### Step 4: Fix it.

This is left as an exercise to the reader. This could be anything, but at least now you know the area where the code is failing.

Once it's fixed, run the entire test suite again to ensure that everything is peachy. 

If it is, congratulations. Go home. Enjoy the weekend.
    
