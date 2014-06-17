--- 
wordpress_id: RB-348
layout: post
title: Spree, Factories and Callbacks
---

During last week, I was trying to wrap my head around Spree's code again. I continued my efforts yesterday and tweeted this:

<blockquote class="twitter-tweet" lang="en"><p>Realtalk: I think we’ve dug ourselves a nice hole in Spree by relying too much on callbacks + Factory Girl factories.</p>&mdash; The Bigg Man Himself (@ryanbigg) <a href="https://twitter.com/ryanbigg/statuses/478316786576674816">June 15, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Some people have asked me to explain what I mean by this, and hopefully I can do that in this blog post. 

Spree is a pretty complex chunk of code which has been built up over the past 6 years and it's always been based off "the Rails way" of doing things. Being a Rails developer myself, I enjoy this because the design of Spree is not dissimilar to any other Rails app that I worked on before coming to work on Spree full time. The models in both Rails apps and Spree itself are in `app/models`, and the controllers are in `app/controllers` and so on.

A lot of people have come to disagree with the general way that Rails applications are designed. Just look around the internet and you'll see talks like [Matt Wynne's "Hexagonal Rails"](https://www.youtube.com/watch?v=CGN4RFkhH2M&feature=kp) and [Uncle Bob Martin's "Architecture the Lost Years"](http://www.confreaks.com/videos/759-rubymidwest2011-keynote-architecture-the-lost-years).

You would think that I would generally agree with the way Rails apps and Spree are architected, given that I [wrote a book](https://manning.com/bigg2) about Rails and I am the [#1 committer to Spree](https://github.com/spree/spree/graphs/contributors).

You'd be *mostly* right. I'm familiar with it all, and so I like. There's still a lot to be desired, however.

I've come to find the architecture of Rails ties it all too closely together. Take for example [this Gist of SQL, generated from when Spree creates a line item from a factory](https://gist.github.com/radar/00e321fb4be0c20666aa). SQL like this is generated at the top of the test [within `spec/models/spree/calculator/default_tax_spec.rb`](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/spec/models/spree/calculator/default_tax_spec.rb). This SQL is a result of an abuse of factories on one hand, and quite a large amount of callbacks within Spree itself. There is no reason other than convenience that these factories are used; they create all the other "necessary" objects for our test, and sometimes even unnecessary ones. 

Just by creating that one line item, the test file has inserted 20 records into the database, and has issued 34 `UPDATE` commands. I have no clue as to how many of those are required.

Sure, the factories provide some good. For instance, the line item factory creates a variant, which creates a product, and a product has a tax category. From the line item's variant's product's tax category, we can work out how much tax this line item is supposed to incur.

If you look through the code for this spec, there's not a single place where database persistence is necessary. All this test needs to do is to take some items and, based off the tax rates available, calculate the correct amounts.

Why does this test need to add data to the database and then read it? Couldn't the whole code of this be done with plain old Ruby objects and the persistence left to something else?

## PORO Spree

The answer to that is yes. I've done just that in my [spree_poro](https://github.com/radar/spree_poro) project. I've cheated a little by passing around a `Spree::Data` constant rather than using something more responsible like the Repository Pattern ([hat-tip to @sj26](https://twitter.com/sj26/status/478462521343348737)), but the whole idea is there.

Take a look at the [TaxRate spec file](https://github.com/radar/spree_poro/blob/master/spec/spree/tax_rate_spec.rb). Rather than factories, all the information is setup in the test. It's all Plain Old Ruby Objects. It does nothing with the "database", other than that `Spree::Data` cheat I mentioned earlier.

Oh, and it's fast. It runs 52 examples in 0.08 seconds. From start to finish, I get test feedback in about 1.5 seconds, which perfectly suits my short attention span.

## Callbacks

Besides the callback hooks that live in `Spree::ItemAdjustments` that allow people to hook into the adjustment cycle within Spree, there's no other callbacks within the `spree_poro` system. It is my honest belief that we should be able to do everything that Spree does already in this small, enclosed system, sans factories and sans callbacks.

Within Spree-proper, there's a lot of callbacks. Take this chain of events that happens when an adjustment is created from a promotion:

1. [create_adjustment is called](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/promotion/actions/create_item_adjustments.rb#L32), which instantly persists an Adjustment object to the database.
2. [`update_adjustable_adjustment_total` is called](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/adjustment.rb#L42), which [calls out to one of the POROs already within Spree](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/adjustment.rb#L101-L104)
3. [Spree::ItemAdjustments#update_adjustments](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/item_adjustments.rb#L38-L45) fetches all the promotional adjustments for the object *from the database*, and calls `Spree::Adjustment#update!`.
4. [Spree::Adjustment#update!](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/adjustment.rb#L84-L97) computes the adjustment's value based on the source's (promotion action's) calculator, and then *saves that to the database*. If it's a promotion, it'll *save again* by updating the eligibility of the promotion (which is a [whole other rabbit hole](https://github.com/spree/spree/blob/4687e608b49236c2850500b026a9fbbab37dc96c/core/app/models/spree/promotion.rb#L72-L75)).

I really think this could be all improved by having an `Order` object in-memory and acting upon that. The `Adjustment` objects would be on the in-memory `Order` object now, much like they are in `spree_poro`. Any changes to that object are persisted back to the database much later on. It's not the code's job to care about these changes getting back to the database. It's the code's job to perform these calculations and return us a result. Some *other* code needs to take care of persisting it back to the database.

This is why I think Rails apps are "tied too closely together". We have the "model" which is this thing which contains *both* the business logic and the persistence logic. They should've been separate concerns from the beginning. Having the one class that can do both things has lead us down this trap.

If I was going to re-architect Spree -- or any large Rails app for that matter -- something like [spree_poro](https://github.com/radar/spree_poro) is where I would start. I wouldn't start with a Rails app, or even a Rails engine. I would start here: in a small repo of code that has tests written before any code, then the code implements the business rules and the tests pass. Refactoring happens then, because otherwise [CodeClimate](https://codeclimate.com/github/radar/spree_poro) would say nasty things about the code. The Rails engine can call out to it later.





