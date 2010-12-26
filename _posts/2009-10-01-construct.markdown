--- 
wordpress_id: 716
layout: post
title: Construct
wordpress_url: http://frozenplague.net/?p=716
---
Over the past month or so I've learned to dislike Integrity for all it's quirks. Whilst it's a fabulous piece of software <strong>in theory</strong> the bugs ("notify_of_build" fails, attempting to press "rebuild" attempts to go to a page that doesn't exist, etc.) and it's single threadedness has driven myself (and others) up the wall. 

Last Tuesday I was in The Zone, and coded <a href='http://github.com/radar/construct'>Construct</a> effectively <strong>that night</strong>. It was as functional as integrity and didn't hang when there was a build in progress! It works by running on port 80 and uses Github's & Codebase's post-receive hooks (you'll have to set them up yourself I'm afraid).

So go try it out for yourself! Interested in your feedback for it.
