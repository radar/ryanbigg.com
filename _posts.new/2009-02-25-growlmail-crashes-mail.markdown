--- 
wordpress_id: 472
layout: post
title: GrowlMail crashes Mail
wordpress_url: http://frozenplague.net/?p=472
---
Today when I upgraded to Safari 4 (beta) and after the <a href='http://twitter.com/radarlistener/status/1246809563'>two updates</a> I installed, I tried launching Mail but it crashed with a "This application quit unexpectedly", then it went on to blame the GrowlMail plugin. To fix this, I found <a href='http://forums.macrumors.com/showpost.php?s=1c0aaccd5981f5f3c7278b161310cb59&p=7160713&postcount=10'>this forum post on MacRumors</a>. TheReason actually means to go into <em>~/Library/Mail/Bundles</em> and remove <em>GrowlMail.mailbundle</em>.

This is a temporary fix as this (obviously) disables GrowlMail, but Mail launches. If you can put up with not receiving growl notifications every time you receive a notification you've won a lottery you didn't enter, then go for it.

<h2>Progress Bar</h2>

If you're missing the old-style progress bar like I am: there's <a href="http://www.silvermac.com/2009/safari-4-beta-restore-progress-bar-and-tabs-placement/">a good tip here</a> with a whole bunch of other tips like changing the positioning of the tabs.
