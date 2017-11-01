---
wordpress_id: RB-361
layout: post
title: Getting started with Ruby and Rails
---

Last updated: 1st November 2017

There are a lot of people who wish to get started with Ruby and Rails, but
don't know where to start. I hope that this post will serve as a guide for
those people.

## Operating Systems

### Windows

People try to develop Ruby and Ruby on Rails apps on Windows and they struggle
with it. You can try developing on it, but know that it's going to be more
painful than the other options (Linux or Mac).

It's for this reason that I recommend installing Ubuntu in a VM
(using [VirtualBox](https://www.virtualbox.org/)) on your Windows PC if you're
in that environment.

### Ubuntu

Once you've got Ubuntu setup, you can follow my [Ubuntu, Ruby, ruby-install,
chruby, Rails and You guide](http://ryanbigg.com/2014/10/ubuntu-ruby-ruby-install-chruby-and-you/)
which will setup a proper development environment for you on Ubuntu.

**Don't install Ruby packages from `apt`**. That way lies pain and suffering.

### Mac

If you're on Mac, you can follow my [Mac OS X, Ruby, ruby-instlal, chruby and You guide](http://ryanbigg.com/2015/06/mac-os-x-ruby-ruby-install-chruby-and-you).
Install ruby-install, chruby as per that guide, and then you can install
[Homebrew](http://brew.sh/), and then install PostgreSQL by running this
command:

```
brew install postgresql
```

Or MySQL with this:

```
brew install mysql
```

## Getting started with Ruby

### Code School

**FREE**

[Code School's Ruby videos](https://www.codeschool.com/learn/ruby) are a great
introduction to Ruby and I would certainly recommend them to anyone who wants
to get started with learning Ruby.

### The Ruby Koans

**FREE**

Your environment is now setup and now you're wondering where to go from here.
I *always* recommend the [Ruby Koans](http://rubykoans.com/) which, as their
site says:

> The Koans walk you along the path to enlightenment in order to learn Ruby.
> The goal is to learn the Ruby language, syntax, structure, and some common
> functions and libraries. We also teach you culture. Testing is not just
> something we pay lip service to, but something we live. It is essential in
> your quest to learn and do great things in the language.

The Koans are a fantastic introduction to Ruby and if I had my way, it'd be
where all newbies started to learn. I encourage anyone who attempts these to
pause once in a while and think about why a certain method or syntax works the
way it does.

You don't have to complete them all, just try your best. It's time I admitted:
I've never actually completed the Koans myself. One day I might.

### The Well-Grounded Rubyist

**PAID**

If a book is more your style, then [The Well-Grounded
Rubyist](http://manning.com/black3) is the one that I would recommend. The
very first version of this book (Ruby for Rails) is what I learned Ruby from.
I don't link to it here because it was out of date when I read it and that
makes it even more out of date now.

### Learn Ruby the Hard Way

**Free online**

[Learn Ruby the Hard Way](https://learncodethehardway.org/ruby/) gives a
non-nonsense introduction to Ruby, taking you from `puts` all the way up to a
web-based game in over 50 exercises.

### Practical Object-Oriented Design in Ruby (POODR)

**PAID**

The [POODR book by Sandi Metz](http://www.poodr.com/) is one of my favourite Ruby books and gives some great examples of how to write excellent Ruby code in an easy-to-read style. Sandi Metz's conference talks are also wonderful watching.

### 99 Bottles

**PAID**

The [99 Bottles book](https://www.sandimetz.com/99bottles/) also by Sandi Metz
and Katrina Owen gives some great advice on how to reorganise code without
going too far.

# Getting started with Rails

### Rails 4 in Action

**PAID**

It'd be remiss of me to not mention my own book, [Rails 4 in
Action](https://manning.com/bigg2) in this section. In the book, we build a
ticket-tracking application from the ground up using Behaviour Driven
Development. We cover things like nested resources, authentication, building an
API and deployment.

Thousands of people have found it to be a great introduction to
Rails, and some people have even gotten Rails jobs after having read it.

### Rails Tutorial

**FREE**

If you don't want to shell out the money for my book (and why not?!), then the
free [Rails Tutorial](https://www.railstutorial.org/) is the next-best-thing.
In that tutorial, you build a Twitter-like application from scratch.

## More reading / viewing / listening

Before you go ahead and read this list, you should take some time to go through the resources above and gain a basic understanding of Ruby + Rails. Consider these supplementary to the above list.

### Books

* [Confident Ruby](http://www.confidentruby.com/)
* [Eloquent Ruby](http://www.amazon.com/Eloquent-Ruby-Addison-Wesley-Professional-Series/dp/0321584104)
* [Clean Ruby](http://www.clean-ruby.com/)

### Screencasts

* [Ruby Tapas](http://rubytapas.com) - Bite sized screencasts about Ruby
* [Daily Drip](https://www.dailydrip.com/topics/rails) - Bite sized screencasts about Rails

If you think of anything that should be added to this post, please leave a comment.
