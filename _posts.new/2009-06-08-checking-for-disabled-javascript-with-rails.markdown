--- 
wordpress_id: 592
layout: post
title: Checking for disabled Javascript with Rails
wordpress_url: http://frozenplague.net/?p=592
---
When you go to <a href='https://signup.37signals.com/basecamp/Plus/signup/new?source=37signals%2520home'>sign up to Basecamp</a> it displays a form where you can enter your details, but only if you have Javascript turned on. If you have Javascript turned off, then you're presented with <a href='http://skitch.com/radarlistener/bu8r8/sign-up-for-basecamp'>a message telling you to turn on Javascript</a>.

I made my own little gist showing what can be done with the noscript tag here and it's just a minimalist version of what the Basecamp guys have done.

Unfortunately <a href='http://gist.github.com'>Gist</a> is still a little feature-bare so I had to make 3 gists for the files, even though you can put multiple files in the same gist. 

<h3>index.html</h3>
<script src='http://gist.github.com/125544.js'></script>

<h3>noscript.css</h3>
<script src="http://gist.github.com/125535.js"></script>

<h3>style.css</h3>
<script src='http://gist.github.com/125545.js'></script>

Ironically, you're not able to view the files above with Javascript turned off.
