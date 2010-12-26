--- 
wordpress_id: 136
layout: post
title: Just Fucking Google It
wordpress_url: http://frozenplague.net/2008/02/23/just-fucking-google-it/
---
I'm sure that if you help out people and live in the help channels of the multitude of IRC servers on the interwebs that you're sick of telling people to "JFGI" or "Just Fucking Google It", and then end up googling it yourself to provide them with a link so they can go away.

So I created the mIRC alias script known only as "google". Type /google &lt;query&gt; to get a url like <a href="http://www.google.com/search?q=rails+2.0+scaffolding">http://www.google.com/search?q=rails+2.0+scaffold</a>. Chuck the following in your alias file and never have to google anything again!

<code>
jfgi {
/msg $active http://www.google.com/search?q= $+ $replace($1-,$chr(32),+)
}
</code>

I originally had this posted as "google" but apparently users of NoNameScript already have a google alias, so I changed it for them.
