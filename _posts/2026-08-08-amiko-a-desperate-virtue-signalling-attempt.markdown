---
wordpress_id: RB-1786148964
layout: post
title: "Amiko: A desperate virtue signalling attempt"
---

After Rails' Dear Leader DHH once again espoused far-right views on his blog (which I'm not going to link to here), some of the Ruby community said "enough is enough" and decided to fork Rails into a project called Amiko. I don't want to mince words here, so I'll talk straight: I think this is a vain attempt at virtue signalling, and will ultimately end up achieving very little.

The Amiko project has started out this fork by renaming all the Rails things into Amiko flavoured things. They have `amiko-pack`, `amiko-view`, and so on. All the `rails` commands are now `amiko` commands. The structure of the framework remains the same, so far.

The momentum behind the Rails framework itself is monumental and to get people to switch from that to a renamed alternative is an exercise in futility. The not-so-benevolent dictator for life said absolutely atrocious things about at least one particular group of people, and just for that Amiko's proponents want you to change `gem 'rails'` in your Gemfile to `gem 'amiko'`.

I don't want to continue chatting about DHH because it's well documented in posts like:

- [Filipa Mendonça-Vieira's, In praise of DHH](https://okayfail.com/2025/in-praise-of-dhh.html)
- [Tom Stuart's talk](https://tomstu.art/the-dhh-problem)
- [David Celis', Rails Needs New Governance](https://davidcel.is/articles/rails-needs-new-governance)

And not to mention exhibited in its starkness on his own blog.

There's also been [this open letter](https://github.com/Plan-Vert/open-letter) asking the Rails core team to cut ties with DHH, to no avail.

So let's not chat about DHH because I think that ground has been covered extensively.

I want to talk about Rails, the framework.

There was an exciting time in 2010 when Rails 3 came out and introduced some radical shifts in how Rails applications were designed. We had the introduction of ARel, as well as some major routes change upgrades. This was also around the time of the Rails guides initiatives too. These were vast improvements for how we wrote Rails applications at the time.

Since then, Rails has bolted on additional features at a rate of knots, like Action Cable, Solid Queue, Hotwire, and at least 3 different styles of asset pipelines. This has resulted in the framework bloating to such an incredible size.

None of these additions actually fix the underlying issues with the framework itself. It smells a lot of the kind of misdirection you see in a magic trick: "look over here and don't look at what my other hand is doing".

I cover a lot of these issues in my book, [Maintainable Rails](https://leanpub.com/maintain-rails). To summarise it here, my issues with Rails are these:

1. Active Record provides _one_ class for you to dump all your model / database logic into. Then it provides you with a swiss army set of footguns for you blow your foot off with.
2. There is no specific place within Rails applications to put Ruby-view code besides helpers, which are _by default_ globally shared across _all_ views.
3. There is no specific pattern or structure for "service objects" or "operations" within Rails applications, leading to people dumping this logic into controllers or models as a pattern. This ties that logic very closely in with database queries or request / response handling and makes it difficult to test in isolation.

There you go, now you don't need to read the book. (JK, you should totally read it to see what the alternatives are like!)

These have been very long standing issues with Rails for the longest time and ones that I think Rails should've fixed in versions 4 through 8. Instead, the frameworks maintainers have gone too cautious, leading to the framework stagnating. Another example is how the framework and its authors concern themselves with frontend tooling despite the JavaScript ecosystem providing much better alternatives with the likes of [Vite](https://vite.dev/) and [ESBuild](https://esbuild.github.io/). It feels like there is a new suggested alternative every year or two in Rails. By sticking with ESBuild in my own work projects for 5 years, I've had an unprecedented era of stablity. It's been great.

To fix these issues in Rails would require some courageous amount of work, and would require breaking most Rails applications out there. Amiko most likely won't make these changes, because otherwise it would put up a barrier to entry for those switching from Rails to Amiko.

Amiko is attempting to offer an alternative to Rails in a time where we've already got an alternative to Rails. One that deals with the issues I put up above, and has been stable and in-use in Ruby shops for close to a decade now.

That alternative is [Hanami](https://hanakai.org/hanami). Version 3 of this framework was just released this year and it's a really great alternative to Rails, and is built from a perspective of having worked on Ruby/Rails apps for two decades and learning from those mistakes.

I re-built my book review tool, Twist, in Hanami. You can see the code on GitHub here: [https://github.com/radar/twist-v3](https://github.com/radar/twist-v3).

If Amiko's contributors put half as much effort into Hanami as they do into virtue-signalling with Amiko, Hanami's growth and adoption would skyrocket. We would be able to have clear use cases demonstrating that this framework _is_ a better alternative to Rails itself. We would have a framework that does not have its history sullied by a far-right white-supremacist's views or his ideas from the early 2000s.

I would encourage the Amiko contributors to come over to Hanami and see what's already there. I reckon you'll like the vibe and the direction of the project. Come and help Hanami grow and build into the next top Ruby web framework.
