--- 
wordpress_id: 603
layout: post
title: SQL Display
wordpress_url: http://frozenplague.net/?p=603
---
Sometimes you want to see a query (or queries) that were executed by a model call that you just did. To do this you have to either set up some hax in your irb configuration or you could now use <a href='http://github.com/radar/sql_display'>SQL Display</a>.

SQL Display's been an idea that has been thrown around in the Mocra offices for a while and after Bo Jeanes' and Ben Hoskings' conversation on twitter last night about the syntax I decided to try my hand at it. The code itself is... not pretty. I warn you of this now before you go trumping through the source code and discover something analogous to a large heap of elephant dung; but it's functional! 

One of the fun things about implementing this plugin was how ActiveRecord implements its logger. When it initialises a new connection it passes the logger object at the time to the connection adapter object so it's set there For All Time. 

SQL Display works by storing what the old logger was, setting the new logger to a file called <em>tmp/sql_display.log</em>, re-establishing the connection, running your query, removing all the colour & extraneous crap from the logs and stores it, removes the log, sets the logger back and again re-establishes the connection. 

Patches welcome.
