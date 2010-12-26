--- 
wordpress_id: 160
layout: post
title: Epic fail from Epic
wordpress_url: http://frozenplague.net/?p=160
---
<pre lang="ruby">"The quick brown fox jumped over the lazy dog".split("").each do |a|
string &lt;&lt; "0" if a[0] &lt; 100
string += a[0].to_s &lt;&lt; "000"
end</pre>
The above code is probably similar to what Epic uses to generate the server descriptions of their UT3 servers. My friend Devastator ranted about how bad these servers were to configure, thanks mainly to the ServerDescription and the insanely crappy way of configuring the entire server, containing the whole configuration in a .bat file (see bottom of post)

So I begun to write him a ruby program that would do it. At the top of the post is my code that works out the correct server description code for UT3 servers. What almost <strong>looks like UTF16</strong> is actually anything but. Let's go through what it does:
<ol>
	<li>Iterates through all the characters and does this:</li>
	<li>Finds the ascii value.</li>
	<li>If the ascii value is less than 100, it will add a zero (0) to the string.</li>
	<li>It then adds the ascii value to the string.</li>
	<li>It then adds three zeroes (000) to the string.</li>
	<li>Repeat until all characters are done.</li>
</ol>
Then it gives you something like this:

084000104000101000032000113000117000105000099000107000032000098
000114000111000119000110000032000102000111000120000032000106000
117000109000112000101000100000032000111000118000101000114000032
000116000104000101000032000108000097000122000121000032000100000
111000103000

I added line breaks so it wouldn't break my blog. Did I mention the whole config file has to be on one line? No? Well guess what? It HAS to be on one line, else you break it. Want to know what it looks like?
<pre>D:
cd "Games\Unreal Tournament 3\Binaries\"start UT3.exe server DM-Deck?Game=UTGame.UTDuelGame?GameMode=0?minnetplayers=2?maxplayers=2?
mutator=utcomp3v02b.UTMutator_utcomp3v02b?PureServer=0?timelimit=10?goalscore=0?
ServerDescription=08600009700010800010400009700010800010800009700003200008500
0084000051000032000083000101000114000118000101000114000032000049000?
bPlayersMustBeReady=True?bAllowJoinInProgress=True?bAllowInvites=False?bUsesPresence=False?
bIsLanMatch=True?bIsDedicated=True?bShouldAdvertise=True -Port=7777 -nohomedir -unattended</pre>
Line breaks added again for non-breakage.

Ugly, huh?

Oh, by the way if you want to the generator, <strong><a title="UT3 Config Generator" href="http://frozenplague.net/files/ut3-config-generator.rb">CLICK ME</a>. </strong>You'll need Ruby to run it, type <span class='term'>ruby ut3-config-generator.rb</span> to run it.
