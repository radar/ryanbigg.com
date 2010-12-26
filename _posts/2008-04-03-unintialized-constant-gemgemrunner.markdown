--- 
wordpress_id: 157
layout: post
title: "unintialized constant Gem::GemRunner "
wordpress_url: http://frozenplague.net/?p=157
---
<em>/usr/bin/gem:23: uninitialized constant Gem::GemRunner (NameError)</em>

threw itself upon my screen, shortly after my upgrade on one of my boxes from 0.9.4 to 1.1.0. I didn't know what went wrong, but I hazarded a guess at it being something to do with the gem executable. A short command later and all things are flowing nicely:

<span class='term'>sudo rm /usr/bin/gem &amp;&amp; sudo ln -s /usr/bin/gem1.8 /usr/bin/gem</span>

Hope this can help other people, because I know how many times this question has been asked elsewhere.
