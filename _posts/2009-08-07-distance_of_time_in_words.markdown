--- 
wordpress_id: 678
layout: post
title: distance_of_time_in_words
wordpress_url: http://frozenplague.net/?p=678
---
I was infatuated with this method when I first saw Rails but I've seen a couple of people recently express that Rails' built in <span class='term'>distance_of_time_in_words</span> is not accurate enough, showing something like "about 2 years" rather than "2 years, 21 days, 5 hours, and 6 minutes". With some help from chendo at <a href='http://mocra.com'>Mocra</a> (where I work) I've made <a href='http://github.com/radar/dotiw'>a new distance_of_time_in_words</a> which should be a drop-in replacement for the old crappy one. To install it, use: <span class='term'>script/plugin install git://github.com/radar/dotiw.git</span>. This also comes with another method if you're still picky about the output: <span class='term'>distance_of_time_in_words_hash</span> which gives you a Hash containing keys in your native tongue. The README should give you a good guide of what other options it supports too.
