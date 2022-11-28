---
wordpress_id: RB-1669608944
layout: post
title: Hanami 2.0 Thoughts
---

[I've been a fan of Hanami](https://ryanbigg.com/2018/03/my-thoughts-on-hanami) for a number of years now. One of my favourite apps to work on is [even an open-source Hanami app!](https://github.com/radar/twist-v2) I have also been writing [an ActivityPub app called "Chirper"](https://github.com/radar/chirper) in Hanami.

Now that Hanami 2.0 has come out, a few people have been asking me for my thoughts on this major Hanami release.

**The headline is: it's really, really fast. It's really clean. And it's really good if you're building an API at the moment.**

It’s currently missing opinions/support on a view layer (so no templating) and DB persistence (although the Getting Started guide does recommend a way to set it up). Hanami 2.1 is supposed to come out (in early 2023) with proper baked-in support for both of those things.

When working on Chirper, I haven't missed view templates as the application is all APIs. And I didn't mind that there wasn't a built-in configuration for databases, as the Getting Started guide for Hanami provided everything I needed there. It was refreshing to be able to "choose my own adventure" in that way, allowing me to opt for even something such as [Sequel](https://rubygems.org/gems/sequel) if I chose to.

I like that Hanami hasn't got an opinion du jour on JavaScript and CSS assets, like Rails had with Sprockets, Webpacker, etc. It leaves that particular responsibility up to the build tools that are great at that, such as ESBuild.

I love that the actions are clearly separated out into their own classes, rather than all being bundled into a single class. I love that you can [specify the types of parameters](https://github.com/radar/chirper/blob/40c4c532449deedbfaaac61dd2914fde7728cd97/app/actions/api/accounts/outbox.rb#L12-L17) that an action receives.

I really enjoy the dependency injection support that [allows me to test parts of the application without hitting a real database](https://github.com/radar/chirper/blob/81504258fbe74e3269c4f7ab013d6f0009b38cb6/spec/activity_pub/processors/create_spec.rb#L3-L7). This makes those tests really fast. In the class itself, dependency injection also highlights the dependencies that a particular class has. If you notice the list of `Deps` getting long, then it's a good sign that the class is trying to do too much; such a thing signposts the complexity of the class right at the top.

I love that [Tim Riley, who is on the Hanami Core Team, is re-building Decaf Sucks in public](https://github.com/decafsucks/decafsucks) to really show how it's done.

There's also a bunch of [Hanami screencasts (HanamiMastery) recorded by Seb Wilgosz](https://hanamimastery.com/), which come in both video and text format.

Overall, I'm glad that the Hanami team has taken their time to really polish up this release, and I'm looking forward to building more things in what is shaping up to be _the_ Ruby web framework of the future.
