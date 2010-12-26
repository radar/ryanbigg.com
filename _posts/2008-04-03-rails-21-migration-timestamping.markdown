--- 
wordpress_id: 156
layout: post
title: "Rails 2.1: Migration Timestamping"
wordpress_url: http://frozenplague.net/?p=156
---
Rails 2.1 is right around the corner, and with it come a few new changes, and one of them is migration timestamping. Instead of adding a number before the migration, for example <em><strong>001</strong>_create_forums.rb, </em>it now adds a UTC timestamp before it, for example <em><strong>20080403021817</strong>_create_forums.rb</em>.

Now, you may think this is a good idea because it will stop the problem of conflicting version numbers on migrations when two developers are working on the same thing, which happens frequently and even there were a few cases at SeaLink where we had this problem and spent some time sorting it out. With the new timestamping it requires that two developers create migrations at precisely the same second, which is less common to happen than creating migrations with the same version number.

But then we get to the tab-completion. Many developers use the console to do their work, or to make small changes to migrations quickly and easily. Tab-completion is a lifesaver and it fills out the name for you. If you were using vim.ruby and the current version of rails, you would type <em>:e </em>to open the file (assuming you're already in db/migrate) and type 001 and press tab, it would auto complete the name and you can carry on your merry way. Now think if you created two migrations, each 5 minutes apart on this new Rails 2.1 system. You would have to first type <em>:e </em>and then 200804030220 and then &lt;tab&gt; to get it to tab complete, which is a pretty large number to remember.

I myself don't mind this new change, as I open migrations using Netbeans 99% of the time. There was a lot of heated debate on this in #rubyonrails recently, and there was little talk on <a href="http://dev.rubyonrails.org/ticket/11458">the actual ticket</a> which was accepted rather quickly; not that I'm saying that's a bad thing. <a href="http://dev.rubyonrails.org/changeset/9122">The changeset is also available.</a>
