--- 
wordpress_id: 320
layout: post
title: This is genius!
wordpress_url: http://frozenplague.net/?p=320
---
I read Mike Gunderloy's blog post today and afterwards thought he was crazy! I thought you couldn't do <span class='term'>Blog.find("1-title")</span>.

But you can.

If you pass in 1-title as <span class='term'>params[:id]</span> for any action and then pass it to <span class='term'>find</span>, <span class='term'>find</span> will do its "thing" and just execute <span class='term'>find(1)</span>, giving you pretty URLs AND pretty code. 

I later found out this was because find just calls <span class='term'>to_i</span> when it gets given strings, and calling it on "1-title" will give you "1".
