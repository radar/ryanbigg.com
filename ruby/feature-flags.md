---
layout: post
title: Use feature flags liberally
---

Feature flags are code that turns on or off other code when certain conditions are met. These can be as simple as a boolean choice where the flag is either on or off. Or they can be more complex, where they're on for a certain percentage of users of your system [chosen by fair dice roll](https://xkcd.com/221/).


For this, I like to use the [Flipper gem](https://github.com/flippercloud/flipper):

```ruby
if Flipper.enabled?(:search, current_user)
  puts 'Search away!'
else
  puts 'No search for you!'
end
```

This flag then determines which path the code will take. If the flag is enabled for that user, then it will output "Search away!". If not, it will output "No search for you." We can use flags like this within our applications to enable entire features or code paths -- or occasionally, opt-out of those paths too. A good rule of thumb is to use feature flags in a "positive" way. That is to say, if a flag is enabled, it _enables_ something rather than disabling something. There are exceptions to this rule, of course.

Feature flags are typically managed through a REPL or a special developers-only page within the browser. Here's what Flipper's UI looks like:

image::flipper/flags.png[]

It may be helpful to introduce an "anti" flag, such as when you want to enable a feature for all users of the system except a select few.

Feature flags help mitigate risk during a deployment as well. When a feature is deployed, you can have an entire code path disabled via a feature flag, and then slowly turn that flag on for increasing percent amount of users. First sign of a problem? Turn off the flag. Then, deploy a fix and attempt again.

Eventually, you'll end up with a whole suite of feature flags that are completely enabled for all users of your app. Sweep these out of your code at liberal intervals, about every 6 weeks. Delete any dead code for paths no longer taken.
