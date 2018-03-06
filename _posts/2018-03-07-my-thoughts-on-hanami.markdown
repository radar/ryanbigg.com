---
wordpress_id: RB-1520380041
layout: post
title: My thoughts on Hanami
---

(<a href='https://www.reddit.com/r/rails/comments/81z9oe/what_are_your_opinions_about_hanami_framework/dvale8q/?st=jegb17z5&sh=e9d18fa1'>This was originally posted as a comment on Reddit</a>)

I’ve been toying around with Hanami for a few weeks now and imo it _feels_ better than Rails.  If you want to see some code rather than text, [here's my little example app I've been building with Hanami](http://github.com/radar/hanami-example).

Here are the top three things that I like about Hanami, in long form:

## Repository pattern instead of Active Record

Documentation link: [Hanami | Guides - Models Overview](http://hanamirb.org/guides/1.1/models/overview/)

The Active Record pattern encourages you to throw everything into the model. Think: callbacks, validations, persistence, database logic (queries) and business logic.

In contrast, the repository pattern (through ROM) leads to a cleaner separation between your database and your application. I _especially_ like how validations are handled by `dry-validation`, a completely separate library to ROM. This _enforces_ a separation between your models, persistence and validation layers, allowing you to pick and choose which ones you wish to use.

My _favourite_ part about the repository pattern is that it's incredibly difficult to make database queries from a view. This helps prevent things like N+1 queries.

Also: ROM has no such thing as callbacks, and that's a huge plus in my eyes too. Callbacks are _way_ too magical and -- using DHH's words -- too sharp a knife for developers to have. Explicitness in code leads to a much better understanding.

## Action classes

Documentation link: [Hanami | Guides - Actions Overview](http://hanamirb.org/guides/1.1/actions/overview/)

Rather than throwing all your actions into the same controller, they're separated out into their own classes.  This helps keep each action isolated from one another, leading to overall a cleaner application architecture.

If you want to share things across actions, it's very easy to create a module for that functionality and to include it into those action classes. For instance, if you wanted a `find_post` method for `show`, `edit`, `update` and `destroy` actions, you can define this in a module and only include it in the actions you want.

A Rails controller is typically made messier by the addition of "helper" methods like this. It's not uncommon to have Rails controllers of multiple hundreds of lines, due to the complexity of the actions and these helper methods. Separating out each action into its own class indeed makes them easier to work with.

You're also able to test the action in complete isolation from the routing layer, as it is simply a class. I think this is what was attempted with Rails' controller specs... but those never really felt "right" to me and I typically go to Request Specs these days instead. Hanami brings me back to testing the actions easily. I like that.

### Params validation for actions

Documentation link: [Hanami | Guides - Action Parameters](http://hanamirb.org/guides/1.1/actions/parameters/)

Somewhat related to the previous point:

Actions in Hanami also use parameter validation (with the help of `dry-validation`, I think). This means that each action can uniquely validate the parameters. Rather than having `create_project_params` and `update_project_params` defined within a controller -- as you might do in Rails -- you can define what constitutes valid parameters right there in the action class.

In my Hanami experiments, I've not found a use for this yet, but I can think of several places where I've needed this sort of thing in a Rails app.

## View classes
Documentation link: [Hanami | Guides - Views Overview](http://hanamirb.org/guides/1.1/views/overview/)

Similarly to Action classes, Hanami also has the concept of a view class.  I like these because they separate the logic of view "helper" methods and the templates very cleanly.

In a Rails application, you define a helper in a module named after the controller. I never liked this approach for two main reasons: 1) normally I would only ever use the helper in _one_ particular view and 2) the helper is made _globally available_ across _all_ views in the application, which means I can't have a similarly named method in another helper module. A quite horrible design decision.

In Hanami, the view classes are a _great_ place to put these little helper methods _and_ because they're just small, isolated classes, you can test these without involving the router, controller or model.

## Conclusion

As I said at the beginning: Hanami _feels_ right. It's "familiar" enough -- still somewhat following the Model-View-Controller architecture we know-and-love Rails -- that it feels comfortable to use. There's a few places where your mind has to change into the "Hanami Way", but ultimately once your mind does that you'll realise that the Hanami way _is_ better.

Hanami has demonstrably learned the very hard lessons of big Rails application development and presents a robust, well-developed alternative web framework for Ruby.

In fact, it is so robust and well-developed that if I was to develop a Ruby web application from scratch for production use, I would use Hanami over Rails -- despite my 10 years Rails experience.




