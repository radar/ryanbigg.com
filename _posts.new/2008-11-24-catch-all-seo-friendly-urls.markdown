--- 
wordpress_id: 376
layout: post
title: Catch-All SEO-Friendly URLs
wordpress_url: http://frozenplague.net/?p=376
---
This tutorial was written using Ruby 1.8.6, Rails 2.2.2 and Rubygems 1.3.1.

This question has been coming up a lot recently. People want urls like http://domain.com/frozenplague-rules-my-world but they don't know how to do it.

Let's say you have a model called Blog and this is what you want to match to http://domain.com/frozenplague-rules-my-world. In this model you define:

<b>app/models/blog.rb</b>
<pre lang='rails'>
def to_param
  "#{id}-#{title.parameterize}"
end
</pre>

And then this in your config/routes.rb
<pre lang='rails'>
map.connect ':slug', :controller => "blogs", :action => "show"
</pre>

And now you should be able to access blogs through http://domain.com/frozenplague-rules-my-world.
