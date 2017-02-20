---
wordpress_id: RB-375
layout: post
title: Toy Robot, Deep Dive Rails and AsciiDoc Toolchain
---

This really should be three separate blog posts, but since they're all tangentially related to writing they're going to be one blog post. Here goes.

## Toy Robot

I went to write a blog post here in December about how to do the Toy Robot exercise (the one [written by Jon Eaves](https://joneaves.wordpress.com/2014/07/21/toy-robot-coding-test/)). I thought that post would be about 10k-15k words. It ended up being 25k. My buddy [Phil Arndt](https://twitter.com/parndt) suggested that I make it into a book because it's so long.

I've done just that: **[The Toy Robot book](https://leanpub.com/toyrobot/) is now available for as little as $5 on Leanpub.**

The book is a guided walkthrough on how I would personally implement the Toy Robot exercise, and it isn't designed to be a _100% perfect implementation that makes every coder weep at its joy_. It's just one attempt at the problem, and I put it out there because I think perhaps some people can learn from my approach and the explanation that goes along with it in the book. A few Ruby newbies I've talked to have found the Toy Robot hard to do (they don't know where to start, usually). This is a book for those people. It breaks the problem down into small chunks and tackles them one-at-a-time. If you know of any Ruby newbies, be sure to let them know about this book.

I've heard from a couple of those Ruby newbies that they love the book and have learned some things from it. Things like:

> I would like to say that your toy robot book is fantastic!

So that's nice.

## Deep Dive Rails

I started writing [Deep Dive Rails](https://leanpub.com/ddr), according to the Git logs, in April of 2015.

This was around the time that I picked back up on [Rails 4 in Action](https://www.manning.com/books/rails-4-in-action) and worked on finishing it with [Rebecca Skinner](https://twitter.com/sevenseacat). That was a process. After that, I took a short writing break for a few months and then went about writing [the 2nd edition of Multitenancy with Rails](https://leanpub.com/multi-tenancy-rails-2). I finished that near the end of June last year. Then my daughter was born in September and I've been busy since.

Enough people have bought Deep Dive Rails (50 at this moment) that I think I am obliged to finish it. I think I've now got enough time on train journeys and whatnot to finish it, and that's what I'm going to be focussing on for the remainder of this year.

I was going through the refunds page for this book just out of interest and I found this choice quote:

> The book is basically taking you through what already exists. [The Rails Initialization Guide](http://guides.rubyonrails.org/initialization.html). Granted, there are some filled in details but even those are not necessarily comprehensive. For example, even when starting out, the first examples entirely depend on what Ruby distribution platform you are using, such as RVM or rbenv. Essentially, the paths of where to look for things can be a bit different. When I had to search out those things on my own, that's when I came across the existing material that this author was clearly cribbing from. Again, this isn't to say that the book is not trying to offer something perhaps new or at least more in-depth but right now that simply doesn't exist in the book.

This refund reason is extremely ironic, because I wrote the original version of this guide. The guide has been an idea I've had since about 2010. I explain as much in the intro to the book:

> This book has been a long time coming. I (Ryan) originally started writing
something along these same lines when I was taking donations to work on Rails
documentation back at the end of 2010. I got about 8,000 words into writing it
as a Rails guide and figured that nobody would want to read a guide that long
and so I gave up.

Interestingly, Deep Dive Rails is now around 15,000 words long and given that 50 people have purchased a copy, I'd say that there definitely _are_ people interested in reading it. 2010-Ryan was wrong.

I hope that this reader that got the refund realises the error of their ways and buys Deep Dive Rails once more.

So yes, I will continue working on Deep Dive Rails this year. I'm currently working on updating it for Rails 5. Once I'm done updating the existing content for that version of Rails, I'll release a new version. That should happen within the next couple of weeks. Then I'll be adding new content to the book. No idea of when I'll be finished with it. When it's done, I guess.

## AsciiDoc Toolchain

In the process of writing Rails 4 in Action and [Deep Dive Rails](https://leanpub.com/ddr), we built a toolchain to help us work with the [AsciiDoc markup language](http://asciidoctor.org/docs/asciidoc-syntax-quick-reference/). We chose AsciiDoc for Rails 4 in Action because it was a much more pleasant experience than XML or Microsoft Word to write a book in, and it compiles down to DocBook (XML). Writing books in DocBook is not advisable or safe for your mental health. AsciiDoc certainly is though.

Compare and contrast.

Here's some DocBook XML:

![Docbook](/images/asciidoc/docbook.png)

Here's some AsciiDoc for the exact same text:

![AsciiDoc](/images/asciidoc/asciidoc.png)

I certainly know which one I prefer. I wish somebody told me about AsciiDoc sooner. It's really nice to write in.

(The IDs on the XML elements in the DocBook example is because Manning's review tool required each element to have a unique ID so that it could track notes on individual elements over the course of their lives.)

Recently, another author has asked me about how I write in AsciiDoc, and so I've decided to [put the toolchain up on GitHub](https://github.com/radar/asciidoc-toolchain). If you want to start writing a book in AsciiDoc, you can clone this repo and that'll provide you with a good starting point. It comes with Rake tasks that will allow you to generate good looking HTML and PDF editions of your book, but I can't say the same for the epub and mobi formats. Patches welcome.
