--- 
wordpress_id: 735
layout: post
title: Where did I put that puts?
wordpress_url: http://frozenplague.net/?p=735
---
This is the question I ask after I've just finished a massive debugging session and I run the tests and halfway through there's something vague like "S3" printed out. So I do a Cmd+Shift+F looking for that string and of course it doesn't exist. What's a guy to do?

Well, at <a href='http://mocra.com'>Mocra</a> we put this in our <em>config/environment.rb</em> file (although a better location would be in a required file located somewhere in lib, probably named <em>debug.rb</em>):
<pre>
\# Print the location of puts/p calls so you can find them later
def puts str
  super caller.first if caller.first.index("shoulda.rb") == -1
  super str
end

def p obj
  puts caller.first
  super obj
end
</pre>

And when we don't want it we comment it out. This will give us the exact location of the puts so we can track it down and remove it.
