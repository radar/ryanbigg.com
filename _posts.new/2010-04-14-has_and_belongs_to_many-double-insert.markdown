--- 
wordpress_id: 898
layout: post
title: has_and_belongs_to_many double insert
wordpress_url: http://ryanbigg.com/?p=898
---
This is a story about my work with GetUp, in particular the past week. It's about a problem that I've been putting off help one of the guys (James) solve, it didn't seem all that important to me. So last night I kind of promised that I'd sit down with him this morning and help him work out what it was. Hopefully it was something silly either of us did and it would only take us an hour. 

You know how this story is going to end up already.

 It didn't take us an hour. It's now 5pm and I've only *just* figured out what it was.

<h3>Symptoms</h3>

We have two models who's names aren't important so excuse me if I use the name `Person` and `Address` to represent them. They are nothing of the sort. In their purest form to replicate this issue, they are defined like this:

    class Address < ActiveRecord::Base
      has_and_belongs_to_many :people
    end

    class Person < ActiveRecord::Base
      has_and_belongs_to_many :addresses
      accepts_nested_attributes_for :addresses
   end

When we go to `create` a new `Person` record:

    Person.create(:addresses_attributes => { "0" => { :suburb => "Camperdown" } }) 

It inserts <strong>1</strong> `Person` record, <strong>1</strong> `Address` record but <strong>2</strong> join table records.

<h3>So, wtf?</h3>

We originally thought it was a bug in our application. How, in all realities, could Rails have a bug, right?

<strong>Wrong!</strong>

I should know <a href="http://ryanbigg.com/2010/04/want-it-give/">how many bugs Rails <strong>could</strong> have</a>. I should have been more wary. I was not. And it bit me in the arse. So out of curiosity I googled the issue and saw that others came across it and then I tried checking out to `v2.3.4`, which <strong>worked!</strong>. So there was a regression between `v2.3.5` and `v2.3.4`. A simple `git bisect bad v2.3.5` with `git bisect good v2.3.4` put me on the way to finding out what this was. A couple of `bisect`s later, I found the offending commit was `6b2291f3`, by Eloy Duran.

<h3>A "solution(?)"</h3>

So I <a href="http://github.com/radar/anaf">generated an application</a> to simply demonstrate that this was a 2.3.5 regression. As I say in the README, I suggest using 2-3-stable if this bothers you. Alternatively there's always Rails 3, or simply specifying the `:uniq => true` option on your `has_and_belongs_to_many`.

That was a fun 7 hours.

As I found out this (the next) morning and <a href='http://ryanbigg.com/2010/04/has_and_belongs_to_many-double-insert/#comment-36741'>Tim Riley points out in the comments</a> the ticket for this bug is <a href='https://rails.lighthouseapp.com/projects/8994/tickets/3575-multiple-join-records-when-using-nested_attributes-in-habtm'>#3575</a> and the related commit is `146a7505` by Eloy Duran also. Freezing rails to `v2.3.5` and `git cherry-pick`ing this commit into this frozen version fixes it. 

