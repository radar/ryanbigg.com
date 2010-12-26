--- 
wordpress_id: 927
layout: post
title: rubyonrails.org is down
wordpress_url: http://ryanbigg.com/?p=927
---
<s>Again!

Put this into your hosts file:

<pre>
209.20.86.131 rubyonrails.org api.rubyonrails.org guides.rubyonrails.org gems.rubyonrails.org
</pre>

And all should be well.</s>

Seems to be broken for now. Follow these instructions if you want the guides:

<pre>
git clone git://github.com/rails/rails.git
git checkout origin/2-3-stable -b 2-3-stable
cd rails/railties
rake generate_guides
open guides/output/index.html
</pre>

Run `gem server` if you want access to the API documentation.

You'd think they would have sorted this out by now! This has happened, to my recollection, for the past 3-4 years. Hopefully now DHH renews it for a longer period than just a year.
