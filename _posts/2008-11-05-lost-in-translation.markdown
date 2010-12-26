--- 
wordpress_id: 346
layout: post
title: Lost in Translation
wordpress_url: http://frozenplague.net/?p=346
---
On my pet project rBoard I've been adding in <span class="term">t</span> calls every where just in case someone wants to use it and translate it into their own language, and I got petrified of missing a translation somewhere along the lines so tonight (with a little help from #rubyonrails) I made a little rake task to check for you:
<script src="http://gist.github.com/27686.js"></script>

Stick this in a file in <em>lib/tasks</em> and run it by typing <span class="term">rake missing_translations</span> and you'll be told what's missing from what file and from what locale and you'll even be given a nice counter that you can watch slowly decrement every time you fix a missing translation!
