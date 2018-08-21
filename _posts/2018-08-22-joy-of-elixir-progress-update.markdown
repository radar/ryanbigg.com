---
wordpress_id: RB-1534890747
layout: post
title: Joy of Elixir - Progress Update
---

I started writing Joy of Elixir [near the end of July last year](https://ryanbigg.com/2017/07/joy-of-elixir). I wrote a large amount of the book in a relatively short time and I've been quietly updating it (slowly) ever since.

I took time away from Joy of Elixir to publish [Exploding Rails](http://leanpub.com/explodingrails) (which is doing very well!) and then took a little writing break to "recover".

Recently, I received an email from someone called Svetlana Rosemond. She said:

> Hello Ryan,
>
> I'm currently working my way through Joy of Elixir. Well done!
>
> When will you complete chapter 11? Working with Files. I'm interested to see how to read and write files with Elixir.
>
> Secondly, this isn't a problem with code, but I really like the way [Python Crash Course](https://nostarch.com/pythoncrashcourse) was structured, and I think Joy of Elixir could be structured this way as well. It started with the basics and worked it's way up to intermediate topics. It might be good for chapter 1 to introduce what an Atom is and the basic types, and a chapter about if, case and cond. Also when working with files, it might be a good time to introduce try, catch, and rescue.
>
> I just think Python Crash Course did a great job in how to structured it's topics and I believe all beginner level textbooks should be structured this way, but that's just my opinion. :D.

I wrote up a relatively long reply to this, and then got her permission to publish it here. So I'm going to use my email reply as a way of reporting the current status of Joy of Elixir, as well as my future plans for the book.

Here's my reply:

---

Hello Svetlana,

I've been pretty busy and haven't dedicated time to Joy of Elixir recently. Well, until last night!

Your email spurred me on. I took my notes from Chapter 11 and turned them into one section on reading a file.

You can read it here: https://joyofelixir.com/11-files/.

I will try to get the remainder of the chapter done by the end of the week and it will cover:

* File.write/2
* File.rm/1
* case statements
* with statements

I can't find a particular case (heh) for `cond` or `if` statements yet, so I'm going to leave them on the backburner for the time being. I will find a place for them by the end of the book.

---

Regarding your feedback about [Python Crash Course](https://nostarch.com/pythoncrashcourse): I've read the first couple of chapters of this book and I couldn't find where exactly it listed all the basic types at once. From what I can see, it started out relatively simple with strings, variables, numbers and commenting (Chapter 2) and moved into lists (Chapter 3) in almost the same way Joy of Elixir does (Chapters 2 and 3 also).

I disagree that Chapter 1 would be a good place to introduce atoms. At such an early point of this book, it doesn't make sense to cover all the different types of data that Elixir can represent. There's quite a few of them! I am trying my best to only introduce concepts when they're necessary in the book and in Chapter 1 it isn't useful to know what atoms are just yet.

I should also mention that I haven't even covered commenting in the book either. I want to start covering this when we start building Elixir modules and putting functions in them. Comments are a super useful way to demonstrate how you can produce documentation with `mix docs`. That's where the true power of comments lies with Elixir: that Hex documentation. Oh, and doctests (just like in Python!) are super helpful as well: http://elixir-recipes.github.io/testing/doctests/. So with commenting you can introduce: documentation and automated testing in one fell swoop.

My aim for this book is to be something that someone with little to no programming experience could read and then use it to get a handle on at least one programming language. The chapters of the book are demonstrating what Elixir is capable of while gradually building a repertoire of skills. I think by Chapter 11 we've got a pretty formidable set of skills!

There's currently 3 parts of the book, but there's also going to be a 4th part which involves a medium-sized project. During this part, I want to start the readers on building a new project with "mix new" and here I want to introduce concepts like:

* Modules
* Structs
* Functions with guard clauses
* Commenting + documentation
* Doctests
* Using external dependencies

The project is going to be one that can read a CSV file full of people's data (name, age + gender) and transform its data into a list of maps [RB: now that I think more about it, probably structs instead of maps] and then do some data crunching on that. Can we find what the average age is in this dataset? What's the gender split as a percentage? Things like that.

These are the last big concepts that I want to cover and I think once we've covered those we're going to have a pretty well-rounded idea of what Elixir is capable of.
