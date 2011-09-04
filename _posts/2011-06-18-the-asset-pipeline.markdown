--- 
wordpress_id: RB-309
layout: post
title: The Asset Pipeline
---

Today I begun writing the section that I've deemed should be at the beginning of Appendix B ("Tidbits") of Rails 3 in Action. It's about the asset pipeline stuff that has been brought into Rails 3.1 with the aid of the Sprockets gem. I've decided to put it at the beginning of this Appendix as it's probably the most interesting thing in the entire appendix and it hasn't been written about in this much detail (at least, from what I've seen) before.

So far, it's looking good. I cover things like:

* `image_tag` generating a URL such as `/assets/image.png` which actually is served through Sprockets.
* Assets can be at either `app/assets` or `vendor/assets`. No mention of `lib/assets` because I don't think it's sensible to put assets in `lib`. Maybe someone can explain that one to me.
* By inheriting from `Rails::Engine` within a gem, that gem's `app/assets` subdirectories are now added to the load path for Sprockets. When Sprockets goes looking for an asset, it will look there, providing the directories exist. Also, `vendor/assets`, ditto.
* Sprockets directives. Not even the *Sprockets README, Wiki or [site](http://getsprockets.org/)* cover this. You would have thought it's kind of a, you know, *core behaviour that people would wet their pants over*, but obviously not given the lack of documentation.
* Pre-compiled Sass, SCSS and CoffeeScript and how their relative gems (`sass-rails` and `coffeescript`) aid in that purpose, and how they're served through Sprockets.

But the final thing that I want to cover is how it all works in the `production` environment. From what I can see, assets are given an MD5 identifier (`application.css` becomes `application-23daf...`) for some mysterious purpose and they are cached *somewhere*. So I went looking for information that explains it. Surely Sam Stephenson or *someone* else who's worked on this *amazing new core feature* for Rails 3.1 has written *something* about it.

Right?

No. This is a feature that has been packed into Rails 3.1 with no rationale other than hearsay to back it up. The Rails Core team deemed it would be a fabulous idea to have an asset manager within Rails 3.1, and boom, there it was. I'm sure they would have gone with Jammit if only it had been created by a 37signals employee. Oh well, at least Sprockets is.

Jammit is exceptionally well documented and has a group of people who are already using it. Again, this whole *rationale* business comes into play. There's no clearly laid out rationale why the Rails Core Team chose to go with Sprockets rather than Jammit. We can circulate rumours and hearsay (like the one above about it being made by a 37signals employee being the reason it was picked) all we like, but it's not until there's an actual official piece of documentation that says "this is why things are the way they are" that we are (usually) satisfied.

[Bundler's site](http://gembundler.org) is a **fantastic** example of great documentation. Hell, it even provides a [rationale](http://gembundler.com/rationale.html) that explains how it works and why it works in pretty easy-to-understand terms.

*\[breath\]*

So where do people who want to know about Sprockets go to learn about the rationale of why it is bundled with Rails 3.1? How about the location of any documentation about how to disable it or configure it any way? Well, that was [added by yours truly](https://github.com/lifo/docrails/commit/0fd52bb6c79f20b8dbd5c8afb774ef1dae155fc4) earlier today. I also wrote up [some notes](https://gist.github.com/1032696) just so I could understand how the `Sprockets::Railtie` works for myself. Thought others may find it useful too.

Not documenting things makes it *incredibly* hard for anybody else to understand what the hell you're trying to do and provides no justification for anybody viewing your project as to why they should use it. Any single person can throw code up online. It takes someone special to make people understand why it's there and why they should *want* to use it.

I think it's great that there's new features being added to Rails and old ones being reworked. But, I think it's absolute crap that there's no go-to source of explaining why these things exist and how they make our lives better. *I* certainly understand how Sprockets makes my life easier, but someone else *might not*. I don't want to have to explain to those people every single time they ask "Why should I use sprockets?" my reason for using it. I want to be able to say "I read this guide [link] and it really helped me understand it. Perhaps you'll understand too?"

It's just so incredibly hard trying to explain something in the book when there's just *no* reference material to go by or anybody else to ask.

For without this documentation / reference material, the people in search of it write ranty blog posts. And we don't want that.