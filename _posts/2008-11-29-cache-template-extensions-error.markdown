--- 
wordpress_id: 382
layout: post
title: Cache Template Extensions Error
wordpress_url: http://frozenplague.net/?p=382
---
If you're getting:

<pre lang='rails'>
  undefined method `cache_template_extensions=' for ActionView::Base:Class (NoMethodError)
</pre>

You have a line in <em>config/environments/development.rb</em> and <em>config/environments/production.rb</em> that calls a deprecated method <span class='term'>cache_template_extensions=</span>. You need to remove this line in order to get your application to function properly. This is usually line #13 in both files.
