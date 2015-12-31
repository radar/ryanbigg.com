--- 
wordpress_id: RB-369
layout: post
title: "Programming Phoenix Review"
---

During this Christmas break I've been taking some time off from writing Multitenancy with Rails -- which I'll get back to _after_ Christmas is over -- and instead of writing books I'm reading them.

[Programming Phoenix](https://pragprog.com/titles/phoenix/) is the only book that I've been reading so far. I've now read through the whole thing. Despite that I've filed over 40 errata on the book (hey, it is a beta book) I _mostly_ enjoyed the book.

----

Programming Phoenix takes you through building a complete Phoenix application, introducing familiar concepts like controllers, models and templates. Those parts are familiar because they're much the same in Phoenix as they are in Rails; with some differences. Models have changesets. Templates relate to Views. Unlike Rails' "magical" callbacks (in both models and controllers), these are just simply defined and used functions in Phoenix.

The latter chapters cover a range of things, like adding in live "annotations" to a video as its being watched. Think of that kind of like a live chatroom, except as the video plays, the annotations from previous watches also appear. This is done using Websockets, which are supported in Rails now with ActionCable, but it just _feels_ a lot less hacky with Phoenix than it does with Rails. Elixir handles it better, [reaching two million connections recently](http://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections) to a single (albeit quite beefy) server. I can't myself think of something to use Websockets for, but it is still exciting nevertheless.

The final two chapters, "OTP" (Open Telecom Platform) and "Observer and Umbrellas" cover some of the real strengths of Elixir and its underlying foundation of Erlang. These two chapters get you to build a system which connects to Wolfram Alpha's API, and then demonstrate how to keep this new system separate from the original application, while still being able to connect these two systems together and communicate between them. In the Ruby world, typically this would be done with HTTP calls, but in the Elixir world it is just a matter of communicating across Elixir processes. This inter-process communication is quite quick in comparison to HTTP because it doesn't have that overhead.

What I loved from these final chapters was seeing Elixir's supervision capabilities in action. In one of those latter chapters, you create a small application (`Rumbl.Counter`) which dies after a couple of seconds. A Supervisor for the main application (`Rumbl`) restarts this smaller application automatically when it dies. Ruby doesn't have that kind of capability; instead you need to rely on tools like upstart. It's quite nice having it built into the language because then you don't have to learn something completely different to ensure your servers don't fall over.

----

The book is written by Jos&eacute; "The Elixir Guy" Valim, Chris "The Phoenix Guy" McCord and Bruce "The [Seven Languages](https://pragprog.com/book/btlang/seven-languages-in-seven-weeks) Guy" Tate. It's great to see that it's the core developers who are invested in writing documentation for the community. Unlike a certain other community who has a main core developer who tells contributors to go fuck themselves when they ask for documentation regarding new features. Further to that point, both Jos&eacute; and Chris are extremely active on the #elixir-lang channel on Freenode, which is also great to see.

I am not sure if it is because the book has three authors, but there are some parts where I'm reading it and enjoying it. Then there are sections like "Anatomy of a Plug" which goes _way too deep_ into what a Plug is and how it works, and "Exploring Ecto in the Console" which, again, goes rather deep but doesn't tie that content _solidly_ back to what we're doing in the book at that present moment. It'd be like a fiction book _intricately_ explaining what's in the house of the neighbour of the protagonist, but then the neighbour is not mentioned any more past that. 

Like, why does it even matter that Ecto supports "search functions like `ilike` and `like`" or that Plug has `path_info` and `scheme` fields? Neither of those are relevant to the content at-hand at that point of time, and it feels disconnected. Those things should be mentioned in their respective guides, not in this book. Perhaps those sections will mysteriously disappear once this book reaches the production editing phase. 

It feels like it would be better off showing what a Plug is within the context of the application... and they do that later on. Then after that go into the detail. But I could do without the pages and pages of extra seemingly "useless" info _before_ I get hooked on what you're trying to sell.

In addition to that, there are some places where the content feels like it's saying "we're going to do this now because I said we're going to do it"; particularly in Chapter 5, the Authentication chapter. The chapter jumps to creating a registration changeset with no reason why it needs to be created, then later on explains why it has to be created. The explanation needs work there.

This is where the TDD/BDD of Rails 4 in Action holds up. In that book, it's more like "we're going to do this because the test says we need to do it". Programming Phoenix saves that kind of testing for Chapter 8, with the given reason being that having testing throughout every chapter can be distracting and repetitive. While I can see the point there -- there was vigorous nodding over here reading Chapter 8's intro -- that very same testing can be helpful for demonstrating industry best-practices to newbies. Otherwise what you'll get is a bunch of newbies who read the first 7 chapters and think that writing code without tests is How It Is Done(tm). 

Having tests also helps show off the usefulness of regression testing too. A thing broke and now we're going to write a test for a fix, watch the test go red, fix the thing, and watch the test go green. I think that kind of thing is helpful to newbies to have, as they're the most likely to make mistakes within their application.

Despite these complaints, the book has been worthwhile reading. I am mainly nitpicking, because I'm an author of another programming book and I have moments where I think that I could write parts better. That has yet to be proven.

The parallels between Rails and Phoenix are helping with the learning of the new framework, and the differences between them are not too mind-bending to be beyond comprehension. The first 8 chapters cover topics that should be familiar to any Rails developer: starting a new project, adding in models and controllers. Adding validations to the model with changesets -- which are a _very_ cool feature that I wouldn't be surprised if Active Record 6.0 picked up. 

The remaining 4 chapters of the book venture off into territory that is probably unexplored by most Rails developers. I know that I personally have never spent time using Websockets or having to do anything like inter-process communication in Ruby. These last four chapters were a breath of fresh air for my skills. I feel like I really learned something valuable in those chapters.

Overall, Programming Phoenix is a fantastic book that will become even better once the authors spend more time on it and the editors do their bit. I really recommend reading this book, but with a small caveat: read [Programming Elixir](https://pragprog.com/book/elixir/programming-elixir) first to get familiar with the underlying language of the Phoenix framework. Then it'll be smooth sailing for you.

