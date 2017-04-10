---
layout: default
title: Expectations - Juniors
---

## What skills should I have?

<small>Last updated: 11th April 2017</small>

<p class='large'>
  This post is <a href='/juniors.html'>part of a series of my replies to junior developer questions</a>.
</p>

---

I love computers because you ask a computer a question (formatted very specifically, because it's a computer after all) and it will _always_ give you the same answer. Computers are predictable.

People on the other hand are... not. You can ask someone a question at the beginning of the day and again at the end of a day and they'll have a completely different answer both times. But it was the exact same question! This is because people and the environment they're in changes. Clear communication is ambiguous and difficult.

Dealing with these communication difficulties and ambiguity and unpredictability is definitely something that I would recommend as a skill for any person entering this industry. I guarantee you there will be more than once where in the morning someone will tell you "do A" and then by the afternoon they'll say "do B" and claim to have always said "do B" the whole day. That can be frustrating. Dealing with these changes and accepting that they happen is a critical skill to have. You'll live a longer and happier life once you accept this will happen.

Not having _all_ the information and having to go back and ask people to explain their reasoning or what exactly it is that they want done is something that you should also be mindful of. Maybe if you could distill it down into a word or two it might be "patience" and "forgiveness".

**People fuck up. You'll fuck up too. Have patience and forgive easy.**

People skills (called "soft skills" I guess because people are soft and squishy?) are of paramount importance. Get along with the people around you and you'll find work really enjoyable.

Then there's the "support network" people. Having someone or a group of someones you can go to to ask a question of is really valuable. Even if it's just other junior developers. I don't know if you have a Slack/WhatsApp/whatever group right now, but I think something like that would be really valuable for you all to have. Some place to share questions + answers and support each other.

---

People aren't the only thing though. A lot of what you do involves people, but it's not the only thing. Computers are the other part of that equation.

With regards to them:

Find an editor you like and learn its shortcuts. Find a shortcut to navigate to a file by a name. Don't use the file browser because it's slow. Find a shortcut to create a new file at a specific location. (In Sublime Text, this comes from a package called AdvancedNewFile). This will save you time too.

Get really good at shortcuts in your editor and you'll be much more productive than you could ever imagine.

----

Learn HTML, CSS and JavaScript. I mean, _really_ learn it. Here's [a great book for HTML and CSS](http://www.htmlandcssbook.com/) and here's some [great JavaScript videos](https://egghead.io) to get you started.

Learn what browsers are capable of doing.

---

Then there are the terminal aliases and functions. I have aliased `git push` to simply `push`, `bundle` to `b` and `bundle exec rspec` to `ber`... there's so many more aliases like that that I have in my [dot-files repo](https://github.com/radar/dot-files).

I add to these as I find myself repeating commands again and again. These are shortcuts and helpers I've built up for myself (cribbing them from others too) over a lifetime of development. Well, since really about 2009. I cannot overstate how helpful these have been to making me more productive.

---

Git is the version control system you'll be using the most of. It's incredibly powerful. Learn about branching (particularly helpful when working on the same project with other people), what merging means, the difference between merging and rebasing, what an "interactive rebase" is and what bisecting means. Learn about `git add -p` and its opposite, `git checkout -p`.

You don't have to learn _everything_ about Git, but wow it really helps to know it and how to use it. The Pro Git book (https://git-scm.com/book/en/v2) helps a lot with this.

---

Learn about databases; you'll be working with a lot of them. Learn what "denormalisation" is and why it is important. Explore libraries other than Active Record to build queries in Ruby. Get out of your Rails comfort-zone. Learn how to write database queries without using Ruby. Do not be afraid of opening `mysql` or `psql` to run these queries.

----

Knowing design patterns in Ruby is critical. Read [Sandi Metz's books](https://www.sandimetz.com/products/) and treat them like the bibles of good software design that they are.

There's also [Confident Ruby](http://www.confidentruby.com/) by Avdi Grimm and [Clean Ruby](http://clean-ruby.com/) by Jim Gay that I would recommend too. You're probably already past the foundational stage now, but I'd recommend The Well Grounded Rubyist too (https://www.manning.com/books/the-well-grounded-rubyist-second-edition).

Write tests! Tests prove that your code works and will continue to prove it for as long as they're around. I wrote tests _six years ago_ for https://github.com/radar/twist (the app I use to get people to review all my books) which are still providing value to this day. If you aren't writing tests, are you going to manually test your application every time? Tests are another one of those things that'll save you time. It may not feel like it immediately ("I'm writing twice as much code to do the same thing!") but it's a long term investment in any codebase you work on.

----

Finally, knowing where to look up things is another useful skill to have.

I have a hard time remembering the arguments to Enumerable#inject in Ruby. Is the block argument accumulator first, or element first? I can _never_ remember -- even though I've been doing this for 10 years! -- but I _do_ remember that I can simply look it up in the documentation, through an app called Dash.app. I use Dash.app to look up a lot of things, especially stuff about Elixir (the most recent language I have learned). It's not a bad thing to go and consult the docs. There's so much "stuff" we need to remember and we can't be expected to remember it all.

Another example: I wrote the Active Record Querying guide and I _still_ have to look stuff up in it to remember how some of it works.

Knowing that there's things like [Stack Overflow](http://stackoverflow.com/), the [Rails Guides](http://guides.rubyonrails.org), the Ruby documentation, your colleagues and your support network out there that you can ask questions of is definitely a useful skill.

