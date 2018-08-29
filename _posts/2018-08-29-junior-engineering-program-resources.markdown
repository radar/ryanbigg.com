---
wordpress_id: RB-1535325393
layout: post
title: "Junior Engineering Program: Resources"
---

This post is part of a series of posts about the first cohort of the Culture Amp Junior Engineering Program (JEP). You can read the first two posts here:

* [Junior Engineering Program: Launch](/2018-08-27-junior-engineering-program-launch)
* [Junior Engineering Program: Onboarding](/2018-08-27-junior-engineering-program-onboarding)

In the last post I covered the process of what we did in the weeks immediately following the juniors starting, but didn't talk too much about what we taught them during those or subsequent weeks. That is what this post is going to talk about: what we taught our juniors over the 26 weeks of the Junior Engineering Program.

In the first post, I briefly rattled off some tech that we used:

> The juniors learned how to work effectively in teams and amongst themselves, as well as learning about /Ruby, PostgreSQL, Mongo, Rails, JavaScript, Flow, React, JSON APIs and GraphQL/, all within 6 months time.

This would seem to imply a logical progression from Ruby to PostgreSQL to Mongo and so on. Things were not quite done that way. At the start of the program, I had pre-planned the first 7 weeks of work. In hindsight, this planning was excessive.

At the start of most JEP weeks, we had a retrospective session where we discussed the previous week's work, and what we would like to do in the coming weeks. This really influenced what was taught throughout the program and provided a better structure than one I could've come up with myself. Often, the JEP cohort would be the one deciding what we would learn next time, not me.

## Part 1: Git, GitHub + Ruby (Weeks 1-5)

In this first part, we covered Git + GitHub and Ruby.

For the Git + GitHub sessions, the juniors wrote some "user manuals", telling us about themselves. They then had to commit these manuals to a git branch and submit a pull request to merge that into the master branch. Other juniors would then review that PR. This was designed to get them familiar with git branching, merging and the GitHub pull request / review cycle.

For the remainder of this part, we focussed on Ruby skills. We covered some Exercism and Advent of Code Exercises. I think these exercises are a great tool to practice Ruby with. When working on these exercises, we introduced the concept of "mob programming", where one junior would write code for 5 minutes while the other juniors told them what to type. Once the 5 minutes was up, another junior would take over. This was good practice working well together in a group.

We also worked on modelling a small Ruby application that had a similar data model as our big Rails application. Alongside this small application, I taught them about [code organisation within a Ruby application](https://github.com/radar/guides/blob/master/code-organisation.md) and how to write RSpec tests from scratch.

During the writing of this application, I showed examples of two of my favourite design principles: the Single Responsibility Principle and the Law of Demeter. Code was written to intentionally violate these design principles, and then the code was refactored to use them. I think this demonstration went well.

## Part 2, v1: Rails (Weeks 6-8)

And then I tried teaching them Rails. The goal here was for the juniors to build a link shortener application, which is more complicated than it sounds.

I'll cover more about this in the "Lessons Learned" section at the end, but one does not simply teach Rails to juniors straight after teaching them Ruby. I realised this after some of my juniors asked "What does this `SELECT * FROM` thing mean in the output?". It became pretty clear to me that I had completely ignored that the juniors didn't know about databases yet.

We started working on this Rails application, using RSpec & Capybara to test it. We got as far as building out the initial CRUD implementation of this app, but really the juniors needed to know more about databases before they could work effectively in a Rails application.

## Part 2: v2: Databases (Weeks 9-13)

And so I spent a few weeks teaching them about databases. Because our link shortener Rails application was using a relational database to start with, we started learning about PostgreSQL (Week 9).

In these weeks, we covered how to insert, select, update and delete records from a table, how to join multiple tables together and about [database normalization](https://en.wikipedia.org/wiki/Database_normalization).

At Culture Amp we also use MongoDB, and so we spent two weeks covering the same sorts of actions as above, but with that database instead.  We also covered some more esoteric knowledge, like the [MongoDB Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/).

## Part 3: Rails (Week 14)

Once we had worked on databases for a few weeks, we came back to the link shortener Rails application. The juniors finished off their CRUD implementations, and began work on adding user authentication and a JSON API to this application.

## Part 4: The Rails Exam (Week 15)

Once the juniors had built out this application, we then gave them an exam to test their knowledge of Rails applications. [This exam](https://github.com/cultureamp/jep/tree/master/week15) involved building a small CRUD application from scratch, using all the skills that they had learned in the proceeding weeks. The juniors had an entire week to complete this exam. There was to be no "pass" or "fail" in this exam; it was just to provide some insight into where the juniors were at when it came to Rails.

The following week I spent marking these exams, again using a rubric that I had devised. I spent a lot of this week talking to the juniors about their results. I covered things like what they might've missed, ways to write cleaner code and more. To say more would be to give away a few of the "answers".

## Part 5: JavaScript / React / APIs (Weeks 16-18)

We rounded off the program by teaching the juniors about JavaScript, React, and APIs.

This part was kicked off by one of our Senior JavaScript Engineers, Sam Margalit. He ran two days of JEP, teaching the foundations of JavaScript, Flow and React in that time.

The juniors then learned how to integrate their React applications with the Rails app that they had built. This was done first by building and using a JSON API that they built within the Rails application, and then later on by an equivalent GraphQL API.

## Lessons Learned

Planning the JEP course was remarkably hard and I have newfound respect for teachers who do this sort of curriculum planning thing year-round.

### Better explanations / walkthroughs

What I found with a lot of the material for juniors, especially when it was _brand new_ to them, was that in order to learn they needed more than just the code itself. While it's intuitive _to me_ to read code top-to-bottom and (usually) understand it first-pass, it is not the case for juniors. Writing code is  the same.

For this, I would involve more pseudocode and step-by-step walkthroughs of what the code should be doing in order to accomplish a particular goal. A few weeks in it was brought up by a junior that the simple task of me writing the steps of a short program on the whiteboard really helped them understand the order of what the program was doing. I think a good term for this sort of thing is "chunking" -- breaking problems down into their smallest pieces. We'll focus a lot on this next JEP.

Along the same lines, I would like to do more practice of walking through code to track how something is defined and then used throughout a Rails codebase. As an example: how would a junior know how to find how a field is displayed on a particular page, if they only knew the route and the value of the field? How would they even _begin_ to debug that sort of thing? More practice is required here also.

### More focus on fundamentals

What might've helped here also is more practice around the fundamentals. Just how does it all work when you type in `http://localhost:3000` into your browser and hit enter? What is a HTTP request? What's HTTP? What's a port? What's DNS? What's TCP?

I don't mean to say that there needs to be a whole _week_ dedicated to each of these things, but at least covering them in a light amount of detail would be a good start. We definitely missed doing this at the start of the JEP and the next time around I will do this as these are the real fundamental concepts of every web application.

### Databases _before_ Rails

And now for the big regret: I hinted at this earlier on, but teaching Rails _immediately_ after Ruby was... well, it was one of those "what was I thinking?" moments. The "M(odel)" of Rails applications is thing that underpins it all; if there is no data (no models) within a Rails application, what's the point? Teaching databases _first_ is vital.

Juniors must have at least an understanding of how to query databases, and perhaps also an understanding of how to model them in the first place in order to work effectively within applications that are backed by a database.

I would like to spend more time earlier on in the course teaching them about MVC _after_ Ruby but before even talking about Rails. I want to spend time teaching them about models and what they provide, and then about views and what they do and wrap it up with how controllers bring the two together. No Rails course or book out there that I know of introduces MVC _slowly_ like this, but I think it is certainly required.

### Flip it and reverse it

Last time, we taught in roughly this (simplified) order:

1. Ruby
2. Databases
3. Rails
4. APIs
5. JavaScript
6. React

After our experiences with the JEP last time and talking about the structure of the next JEP with other people, I'm now convinced that this order was backwards.

We should be starting at the browser and then working back from there. The whole reason why we'd use Ruby to run Rails to serve an API that React reads from is so that we would see something in the browser! So I think rendering stuff in the browser _first_ is a better approach.

This means that I would teach roughly in this order next time:

1. HTML / CSS / JavaScript
2. React
3. APIs
4. Ruby / Sinatra
5. Databases
6. ...

The browser is the entry point for most requests. To understand why you need Ruby to build a web _thing_, you first need to realise what a web _thing_ looks like. We could start with building a static site and then slowly make it more dynamic by bringing in things like React, external APIs, etc.

To work with browser tech there's sites like [Codepen](codepen.io) and [StackBlitz](stackblitz.com) that have zero-setup required. This means that we'll have a smoother time jumping into things too.

I'm glad that I get to experiment with the JEP structure like this and I really look forward to seeing what comes out of this browsers-first experiment.

