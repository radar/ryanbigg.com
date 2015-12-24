--- 
wordpress_id: RB-369
layout: post
title: "Programming Phoenix: Halfway Review"
---

During this Christmas break I've been taking some time off from writing Multitenancy with Rails --which I'll get back to _after_ Christmas is over -- and instead of writing books I'm reading them.

[Programming Phoenix](https://pragprog.com/titles/phoenix/) is what I've been reading so far, and I've made it to the halfway point in this book, so that's the first 7 (of currently 12) chapters done. Despite that I've filed over 30 errata on the book (hey, it is a beta book) I am _mostly_ enjoying the book. 

It takes you through building a complete Phoenix application, introducing familiar concepts like controllers, models and templates. Those parts are familiar because they're much the same in Phoenix as they are in Rails; with some differences. Models have changesets. Templates relate to Views. Unlike Rails' "magical" callbacks (in both models and controllers), these are just simply defined and used functions in Phoenix.

The book is written by José "The Elixir Guy" Valim, Chris "The Phoenix Guy" McCord and Bruce "The [Seven Languages](https://pragprog.com/book/btlang/seven-languages-in-seven-weeks) Guy" Tate. It's great to see that it's the core developers who are invested in writing documentation for the community. Unlike a certain other community who has a main core developer who tells contributors to go fuck themselves when they ask for documentation regarding new features. Further to that point, both José and Chris are extremely active on the #elixir-lang channel on Freenode, which is also great to see.

I am not sure if it is because the book has three authors, but there are some parts where I'm reading it and enjoying it. Then there are sections like "Anatomy of a Plug" which goes _way too deep_ into what a Plug is and how it works, and "Exploring Ecto in the Console" which, again, goes rather deep but doesn't tie that content _solidly_ back to what we're doing in the book at that present moment. It'd be like a fiction book _intracately_ explaining what's in the house of the neighbour of the protagonist, but then the neighbour is not mentioned any more past that. 

Like, why does it even matter that Ecto supports "search functions like `ilike` and `like`" or that Plug has `path_info` and `scheme` fields? Neither of those are relevant to the content at-hand at that point of time, and it feels disconnected. Those things should be mentioned in their respective guides, not in this book. Perhaps those sections will mysteriously disappear once this book reaches the production editing phase. 

It feels like it would be better off showing what a Plug is within the context of the application... and they do that later on. Then after that go into the detail. But I could do without the pages and pages of extra seemingly "useless" info _before_ I get hooked on what you're trying to sell.

In addition to that, there are some places where the content feels like it's saying "we're going to do this now because I said we're going to do it"; particularly in Chapter 5, the Authentication chapter. The chapter jumps to creating a registration changeset with no reason why it needs to be created, then later on explains why it has to be created. The explanation needs work there.

This is where the TDD/BDD of Rails 4 in Action hold up: "we're going to do this because the test says we need to do it". Programming Phoenix saves that kind of testing for Chapter 8, with the given reason being that having testing throughout every chapter can be distracting and repetitive. While I can see the point there -- there was vigorous nodding over here reading Chapter 8's intro -- that very same testing can be helpful for demonstrating industry best-practices to newbies. Otherwise what you'll get is a bunch of newbies who read the first 7 chapters and think that writing code without tests is How It Is Done(tm). Having tests also helps show off the usefulness of regression testing too. A thing broke and now we're going to write a test for a fix, watch the test go red, fix the thing, and watch the test go green. I think that kind of thing is helpful to newbies to have, as they're the most likely to make mistakes within their application.

Despite these complaints, the book has been worthwhile reading. I am mainly nitpicking, because I'm an author of another programming book and I have moments where I think that I could write parts better. That has yet to be proven.

The parallels between Rails and Phoenix are helping with the learning of the new framework, and the differences between them are not too mind-bending to be beyond comprehension. The first 8 chapters cover topics that should be familiar to any Rails developer: starting a new project, adding in models and controllers. Adding validations to the model with changesets -- which are a _very_ cool feature that I wouldn't be surprised if Active Record 6.0 picked up. 

The half of Programming Phoenix that I've read so far has proven to be a great introduction to the Phoenix framework, and I recommend reading it when you get a moment over this Christmas break, or whenever you make the time for it.

