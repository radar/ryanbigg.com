--- 
wordpress_id: 117
layout: post
title: My First Rails Patch
wordpress_url: http://frozenplague.net/2008/01/14/my-first-rails-patch/
---
Today I wrote my first Rails patch: <a href="http://dev.rubyonrails.org/ticket/10799">http://dev.rubyonrails.org/ticket/10799</a>

I was infuriated at this method over the weekend when I found out that it didn't use the current year, but instead always guessed Feb. to be 28 days regardless of the current year. My patch uses the current year.

+1 it if you think it's a good idea.

This patch is now verified! This means that it will be more than likely to be included inside of Rails 2.1, whenever that's released! Thanks to DevF and nzkoz from #rails-contrib on freenode for suggesting that I write tests as well as telling me a cool few tricks.

This patch is now in Rails! <a href="http://dev.rubyonrails.org/changeset/8715">http://dev.rubyonrails.org/changeset/8715 </a>
