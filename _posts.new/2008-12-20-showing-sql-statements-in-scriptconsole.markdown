--- 
wordpress_id: 402
layout: post
title: Showing SQL Statements in script/console
wordpress_url: http://frozenplague.net/?p=402
---
Today <a href='http://rails.loglibrary.com/chats/15273022'>keiran_nz</a> asked how to see SQL statements that occur when running code in script/console. After a little bit of mucking around in the terminal I worked it out to be:

<span class='term'>tail -f log/development.log & script/console</span>

The first comment on this post Ashley Williams says you could do:

<span class='term'>tail -f log/development.log & clear && script/console</span>

instead, and then goes further and sticks it in an alias in your .bashrc file (presumably):

<span class='term'>alias rcon=”tail -f log/development.log & clear && script/console”</span>

