--- 
wordpress_id: 1122
layout: post
title: Advanced Rails Documentation
wordpress_url: http://ryanbigg.com/?p=1122
---
Recently I've been talking to a lot of people about Rails. It's what I do. Lots of these people I talked to were in San Francisco when I was. Some others were in Jacksonville Beach. A common thread of conversation was that to truly know the Rails internals you have to read the source and interpret it for yourself what it means. If only there were guides out there for the more advanced concepts in Rails.

There was discussions as recently as March this year about starting up a Rails Internals documentation group, much in the same vein that docrails has people who write the <a href="http://guides.rubyonrails.org">Rails Guides</a>. These guides are top-notch and are a great boon to the resources of people who are just getting started with Rails, but there's nothing comparable for those who are more advanced.

This is where the Rails Internals documentation comes in. It's clear to me from the conversations I've had with people about Rails over the past couple of months that there's a <strong>real need</strong> for some seriously good advanced documentation. There's also the sidebar on <a href='http://yehudakatz.com'>Yehuda Katz's</a> blog for <a href='http://skribit.com'>Skribit</a>, where people can vote up posts they want Yehuda to write about. Yehuda's too busy blowing our minds with other things (i.e. <a href='http://github.com/carlhuda/bundler'>Bundler</a> and now <a href='http://sproutcore.com'>SproutCore</a>) to write about them.

The highest request on that list is "migrating from rails 2.3.* to 3.0", which is neatly covered by <a href='http://www.railsupgradehandbook.com/'>Jeremy McAnally's Rails 3 Upgrade Handbook</a>.

The second highest request on that list is "The lifecycle of a request through the rails stack". This is an <strong>epic</strong> in itself. There's an amazing amount of work that goes into rendering even a simple view through a controller, and that's just the basic part of it. Your routes could route out to a Sinatra application, your model could actually be an ActiveResource model or a NoSQL model and you could be returning JSON data rather than an actual template.

<h3>Fucking Rails man, how does it work?</h3>

So I've been thinking for quite a while that it'd be nice to work on Rails documentation <strong>full time</strong>. Back in January when I was between jobs I begun writing the <a href='http://guides.rubyonrails.org/initialization.html'>Rails 3 Initialization Process</a> guide. I stopped writing it because I got a (kinda) paying gig writing <a href='http://manning.com/katz'>Rails 3 in Action</a>. I loved digging into the guts of Rails and explaining how they work. I got a great response from my initial postings of that guide and I'd like to complete it as the first in the Rails Internals Guides series, with the remainder beginning with:

<ul>
  <li>Action Dispatch, receiving + serving requests</li>
  <li>Action Pack, finding controllers and response rendering</li>
  <li>Active Model, the different modules and how you can create your own ORM-like system</li>
  <li>Active Record, ARel &amp; things such as associations and dynamic finders</li>
</ul>

Besides the "big picture", I have no solid idea of precisely what would go in these guides, or even if they're interesting to people outside the world of my own head. 

Would I even be able to find a company to pay me to do this full-time? The biggest question is how it would benefit them. Wouldn't it save time having some go-to place for Rails internals documentation so you don't have to spend all that time trudging through it? I think so.

The second question: Is there a large enough audience interested in documentation in a similar vein to the <a href='http://guides.rubyonrails.org/initialization.html'>Initialization Guide</a>? Is that the "correct"/sensible way to do that? Is it useful?

<strong>As a Rails programmer, what guides would you like to see written about Rails? It could just be about the ecosystem, not neccesarily the framework's code itself. Let me know in the comments.</strong>
