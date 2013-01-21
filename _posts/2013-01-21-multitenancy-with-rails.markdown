--- 
wordpress_id: RB-339
layout: post
title: Multitenancy with Rails
---

Well before I had even [split from
Manning](http://ryanbigg.com/2012/11/no-more-writing-for-manning/), I had been
working on a new book called ["Multitenancy with
Rails"](https://leanpub.com/multi-tenancy-rails), which you can buy right now.

The idea for the book has been around for a while. A couple of friends ([Phil
Arndt](https://github.com/parndt), [Josh Adams](https://github.com/knewter),
[Rob Yurkowski](https://github.com/robyurkowski) and [Andrew
Hooker](https://github.com/GeekOnCoffee)) and I had been talking in our secret
IRC back channel about what a more advanced Rails book might cover. Through I
don't know what process, we came up with this idea and I'm putting it into book
form.

For now, all the book is covering is what we're building, which is a hosted
forum application, how to build a foundation for the subscriptions
engine and then how we're going to accomplish the database scoping necessary to
separate the accounts' data. 

The engine is what the book's application is going to heavily rely on. This foundation
building deals with adding things like accounts which have subdomains, and then
authenticating users for those accounts using Warden, and not Devise. To find
out why, you're going to have to read it.

The chapter on scoping first of all covers using a database field, which is the typical way
that people have been dealing with this problem for years, and then covers the
"new" way of doing it: by using PostgreSQL schemas and the `apartment` gem.

The next chapter, Chapter 4, will cover building the application which will
combine both the subscriptions engine we build in Chapter 2, as well as the
[Forem](https://github.com/radar/forem) forum engine that the aforementioned
folk and I build and maintain.

Chapter 5 will cover subscriptions, where each account could be subscribed to
the application for an amount such as $29/month and that allows them to create 5
forums. That sort of thing. It'll also cover taking payments for those
subscriptions using Stripe's wonderful API, and then what to do if somebody
decides to do a dodgy.

Testing (with RSpec and Capybara) is throughout, just like with Rails 3 in
Action.

So if you're looking for a book that covers all of the above, please [buy a copy
of Multitenancy with Rails](https://leanpub.com/multitenancy-with-rails) *right
now*.
