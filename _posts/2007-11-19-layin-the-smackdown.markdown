--- 
wordpress_id: 89
layout: post
title: Layin' The Smackdown!
wordpress_url: http://frozenplague.net/?p=89
---
There's a forum on the internet called Rails Forum which is a support forum for Rails (duh). I've been helping out on the forums for a few months now and some of the things people do surprise me. Sometimes they are things like "why didn't I think of that", and other times it's like "why did they do that?". <a href="http://railsforum.com/viewtopic.php?pid=45524#p45524">Here's a thread that was one of the latter</a>

A guy wanted to add values into a select tag using javascript. He used this code:
<p class="code"> window.parent.document.getElementById('client_name').value = '&lt;%= @client.client_name %&gt;';</p>
I replied suggesting this code:

&lt;div class='code'&gt;

<p class="code"> $('element_id').innerHTML = "Option 1"
&lt;/div&gt;
Which I know works because I've used it before.

Then he replies saying:

<p class="blockquote"> <strong>Viniosity said:</strong>
Ended up using:
<p class="code"> window.parent.document.getElementById('client_name').value = "&lt;%=client.id %&gt;";</p>
Dear GOD why? At least ditch the window.parent, please!

And I replied yet again:
<p class="quote">I don't see how that would work. If you're having a drop down list, and you're setting the value attribute on it, well... there just isn't a value attribute! Are you sure this is working because I think that it wouldn't.</p>
I could be wrong, as last time I checked I was Human.

Then he made a reference to me looking like a terminator in my <a href="http://railsforum.com/img/avatars/174.png">current avatar on the forums</a>

Then another guy jumped into the fray called boemitsu who came up with this little beauty:

<p class="quote"> <strong>boemitsu said:</strong>
From my experience, this does not work in IE until version 6...

UNTIL VERSION 6! Oh no! Lucky most people are running version 6 (or better or Firefox).

boemitsu also gave this gem of code too:

<p class="code"> i=0
@var.each {|a|
page &lt;&lt; "$('id').options[#{i}] = new Option('#{a[0]}','#{a[1]}')"
i = i+1
}

Maybe he confused JavaScript with Java?

I replied a final time:
<p class="quote"> <strong>Me, whilst laying the smackdown said:</strong>For a moment there I did that thing people do, you know, put one hand on the side of the face and slowly drag it downwards whilst making a groaning noise.</p>
Then I re-read what you had written:
"This does not work in IE until version 6"

Thankfully there was this new operating system released back in 2001 (October 25th, for those of you playing along at home) called Windows XP. This operating system came standard with Internet Explorer Version 6.0 (six-point-oh). Unfortunately, the majority of people were still using Windows ME, or worse, Windows 98, so the "standard" back in 2001 was what came with those operating systems which was Internet Explorer Version 5.5 (five-point-five).

Fortunately the wonderful people at Microsoft decided that on 11th July 2006 that Windows ME and Windows 98 were to be no longer supported! Fantastic news for Microsoft, of course, this meant that more people had to "upgrade" to Windows XP, therefore giving Microsoft more money in which they were to put into a burning pit of lava they call "Vista".

My point is this (and honestly, I'm surprised you're still reading), Windows ME and Windows 98 were basically deprecated in 2006. This means anyone using those had to upgrade, meaning they are now *most likely* running Internet Explorer 6 or Mozilla or Opera or Safari or some other browser, and not Internet Explorer 5.5. If we were to support all the older versions of all the software ever created we would still be coding in Fortran and COBOL, or worse, Perl.

Thankfully, old technology is eventually deprecated meaning that, as web developers, we can say "that is no longer supported, please upgrade" and get away with it. Anyone still running Windows 98 and Windows ME deserves to be shot anyway.

That is all.

boemitsu, the man who apparently never sleeps, replied within an instant:

<p class="quote"> <strong>boemitsu said:</strong>
Well sorry that I have written mistakenly until version 6. It should have been version &lt;= 6But anyway...you're really a cool guy.

So apparently it doesn't work in IE 6 (and I'm a really cool guy). I'm not sure on this myself (the not working in IE6), as I use Mozilla Firefox. I'll investigate this later this week and report back.
