--- 
wordpress_id: RB-349
layout: post
title: Initial thoughts on Lotus
---

Following on from my [last post](http://ryanbigg.com/2014/06/spree-factories-and-callbacks/), I've been experimenting some more with my [spree_poro](https://github.com/radar/spree_poro), and I've been looking at how to work with some kind of data store persistence more sophisticated than the `Spree::Data` constant that I had used previously. I wanted something more sophisticated than running `select`s over arrays.

[Lotus](http://lotusrb.org) bills itself as a "complete web framework for Ruby" and also uses the words "simple", "fast", and "lightweight". In my limited experience of only using the `Lotus::Model` part of the framework, I can say it's all of those things. `Lotus::Model` itself is less than 600 lines and my tests (now 50 of them) still run in <0.05 seconds.

`Lotus::Model` departs from the ActiveRecord way of doing things by having four main types of objects: entities, mappers, repositories and adapters. The creator of Lotus (Luca Guida) has [a great post outlining what each of those do](http://lucaguidi.com/2014/04/23/introducing-lotus-model.html).

I've added `Lotus::Model` to spree_poro and I have it persisting zones, tax rates, tax categories and products; not to a database but to memory. It would be very easy for me to switch this over to an SQL database, thanks to how Lotus is designed. 

Having the entities separate from the persistence code means there's a clear separation between the business logic of the entities and the persistence logic of the repositories. If I want to test that finding tax rates based on an order's tax zone works, I no longer test that on the `Spree::TaxRate` model. Instead, that responsibility falls to the `Spree::TaxRateRepository`, and so [that is where it's tested](https://github.com/radar/spree_poro/blob/fac4921d87c6a047e8b2df380137f3866cac2442/spec/spree/repositories/tax_rate_spec.rb). This means that I could even get away with stubbing `Spree::TaxRateRepository.match` in the normal `TaxRate` specs to return some plain Ruby objects, and those tests do not need to care about any persistence layer at all.

I am very interested to see how this whole Lotus thing pans out. It's very easy to understand at this point in time, other than that I can't work out how to properly do polymorphic associations (as is necessary for promotions within Spree, sadly). Perhaps that would be a feature that comes eventually to Lotus, or we re-architect the way Spree is designed to work more with Lotus.

