--- 
wordpress_id: 112
layout: post
title: "Testing: There Has To Be A Better Way"
wordpress_url: http://frozenplague.net/2008/01/11/testing-there-has-to-be-a-better-way/
---
I <strong>hate </strong>testing in Ruby on Rails. I hate writing tests, and I especially hate running them. At work, we have 618 examples and it takes 346 seconds to run. That's 5 minutes and 46 seconds to run 6000 lines of code, it's pathetic!

The reason for this is that we have a central object which a lot of other objects are related to, called booking. Now, without giving too much away I'll say that, along with the bookings table, there are 8 other tables that are emptied and loaded with data during a large majority of the tests. All this emptying and refilling is taking time, time that could be better spent <strong>not waiting for the tests to finish!</strong>

This is why I propose a system that entirely relies on fixtures for its data supply, so it doesn't have to empty &amp; load the tables again and again, but instead reads directly from the fixture files every time. I have no idea how to go about making one, but if anyone reads this and wants to collaborate with me on something like it, by all means please do. I <strong>hate</strong> having to read my emails whilst waiting for the tests to finish, I run out of emails.
