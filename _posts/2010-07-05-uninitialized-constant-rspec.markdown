--- 
wordpress_id: 1043
layout: post
title: uninitialized constant RSpec with Cucumber
wordpress_url: http://ryanbigg.com/?p=1043
---
Today I upgraded the Cucumber gem on my system (still had 0.7.something) only for it to break!

    uninitialized constant RSpec (NameError)
    /Library/Ruby/Gems/1.8/gems/cucumber-0.8.3/bin/../lib/cucumber/rb_support/rb_language.rb:51:in `enable_rspec_expectations_if_available'

I saw this error last week on a workmate's computer and both times it was fixed by removing the `rspec-expectations` gem which is a part of the RSpec 2 gem collection. I had these left over from when I was playing around with Rails 3 (now I'm using RVM). The latest version of Cucumber maintains compatibility between these two versions and does so by trying to require _rspec/expecatations_ which will be available if the `rspec-expectations` gem is installed. So if you're trying to use RSpec 1 and 2 and Cucumber at the same time, you may run into this issue. So far the best solution I've found is uninstalling `rspec-expectations`. 

Just thought I'd let you know. It's bitten us twice and may bite you.
