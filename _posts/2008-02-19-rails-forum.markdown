--- 
wordpress_id: 134
layout: post
title: Rails Forum
wordpress_url: http://frozenplague.net/2008/02/19/rails-forum/
---
<strong>Please note: This is now <a href="http://github.com/radar/rboard">hosted at Github</a></strong>. <strong>Please use this page to get the latest changeset.</strong>

As a result of Tom (0.01%) and mine's (99.9%) work on-and-off for a few months, we've managed to <a href="http://code.google.com/p/railsforum/">get to a first release of Rails Forum</a>. The goal is to "be inspired by" and supercede PunBB and I think we're almost there.

The PunBB about page states that:
<blockquote>Some features that have so far not been implemented are:   private messaging, file attachments in posts, polls, linking to   off-site avatars, advanced text formatting controls, subforums   etc etc. Some of these features might still get implemented, just   not in the near future.</blockquote>
We have private messaging, and we use Gravatar for our avatar system and we have subforums. There's only three and a half things on that list (polls, real off-site avatars, adavanced text formatting controls and file attachments) that we have still to do. Polls are easy enough and probably my next goal, off-site avatars will be a bit tricky but I think we'll manage and advanced text formatting controls are as easy as installing something like TinyMCE. File attachments can be done with attachment_fu.

What I would like to see is the whole site converted over to HAML as I enjoy working in it's strictly tabbed environment and it's just so much easier to read as you're not reading what is basically the same thing twice. Another thing I would like to see is some bloody tests written for it! We were bad and only wrote a few tests. Pagination would be lovely too!

To run this forum system, you'll need to download and extract it onto your computer. Then install Ruby and then Rubygems. After that, do
<pre>gem install mongrel rails chronic RedCloth tzinfo</pre>
To install mongrel and rails. Hopefully that's all you'll need.
