--- 
wordpress_id: 1142
layout: post
title: Lighthouse has problems, but they're fixing them
wordpress_url: http://ryanbigg.com/?p=1142
---
After I wrote my <a href='http://ryanbigg.com/2010/10/lighthouse-has-problems/'>Lighthouse has problems</a> post last week, I was contacted by ENTP who asked to speak to me regarding some clarifications, and now I've finally gotten around to posting them.

Firstly: ENTP is working on a major upgrade of Lighthouse. They <a href="http://help.lighthouseapp.com/discussions/problems/1791-spammers-taking-over">plan on fixing the spam issue </a>and will have trusted and untrusted user accounts, where trusted users can change the title and tags of a ticket. They will also implement rate limiting which will be a way to detect the spammers current tactics on LH. This fixes points #2 and #4 of my post.

Secondly: there's now less tickets for Rails itself with the <a href="https://rails.lighthouseapp.com/projects/8994-ruby-on-rails/tickets/bins/5837">"Open Tickets"</a> currently hovering around 753. This is because of the wonderful team of Lighthouse volunteers including David Trasbo, Rohit Arondekar who have been marking old tickets as stale and replying to those which need patches. If you have a ticket which you'd like some eyes on, assign it to one of us and we'll take a peek.

Thirdly: I wrote <a href='http://gist.github.com/617963'>a Mechanize script</a> to revert / delete the spam comments, which will stave off the problem until ENTP can get around to fixing their system. Myself and a couple of other volunteers run this whenever spammers are detected. Seems to do the trick quite nicely, but the code is ugly as all hell.

I have to play the devil's advocate here: Lighthouse doesn't suck, entirely. It's a bit rough around the edges but it's no Trac. Remember Trac? Good times were had, and spam was a problem back then. It's a tricky problem to solve and I hope that the Lighthouse guys can actually do some serious work on it, maybe even implement a <em>proper</em> spam filter, such as Akismet, but nothing is perfect.

Lighthouse is serving us perfectly fine right now, it's just a little cluttered. We're working on that, and we'd like your help. If you could spend some of your time this week going through the <a href="https://rails.lighthouseapp.com/projects/8994-ruby-on-rails/tickets/bins/5837">"Open Tickets"</a> and assigning old ones to one of either Rohit, David or myself, we'll get right round to closing them up. 

I'd like to see it below 700 by the end of next weekend.
