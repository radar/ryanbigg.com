--- 
wordpress_id: RB-310
layout: post
title: Sprocket asset tags internals
---

Yesterday's post and twitter bitching caught the eye of our <a href='http://twitter.com/dhh'>fearless leader</a> who basically claimed <a href='https://twitter.com/#!/dhh/status/81987522766450688'>that I've not made documentation patches recently</a>. I responded with a small reminder that I've done <a href='https://twitter.com/ryanbigg/status/81988004947828736'>some documentation work</a> and went a step further and begun an <a href='http://ryanbigg.com/guides/asset_pipeline.html'>Asset Pipeline Guide</a> because I could. I could have pulled the whole "Don't you know who I am?!!" faux-lebrity deal, but I thought I would be humble. Append "for a change" to the end of the previous sentence, if you wish.

That was incredibly fun. We should do it again some time. Have your people call my people, we'll do lunch.

Before all that went down, I created a short (by my standards, anyway) <a href='https://gist.github.com/1032696'>Gist about how the `Sprockets::Railtie` class is currently set up in Rails</a>. This little Gist begun as short note taking for myself and I thought that maybe other people would find the information helpful, so I formatted it all pretty like.

After the *battle of the egos* took place, I delved a little deeper into the Sprockets rabbit hole, got defeated by some gnarly code and thought "fuck it dude, let's go <s>bowling</s> to sleep". I awoke this morning and delved a little deeper into exactly how all of this magic happens.

This guide now lives as the <a href='https://github.com/radar/guides/blob/master/sprockets.md'>Sprockets Internals Guide</a> on my <a href='http://github.com/radar/guides'>guides</a> repository. Check out both of them. You may learn something.