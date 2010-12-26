--- 
wordpress_id: 625
layout: post
title: "Two Amazing Things: Thing #1"
wordpress_url: http://frozenplague.net/?p=625
---
Today two amazing things happened and I would like to share them with you in a two-part series (woah, look at me going all high-tech on my reader). Here's the first:

<h2>Hampton Catlin</h2>

Today <a href='http://hamptoncatlin.com/'>Hampton Catlin</a> was talking with <a href='http://drnicwilliams'>Dr Nic</a> about Ruby 1.9 issues he was having with his <a href='http://github.com/hcatlin/wikimedia-mobile/tree/master'>wikimedia-mobile</a> project, specifically he was getting <span class='term'>incompatible character encodings: ASCII-8BIT and UTF-8</span>. This is a guy I admire and look up to and think he's "the shit". He came to my company looking for help and it was my (and Bo's) task to help him figure out what's going on. Honoured.

The search box on his site was a bit wrong for fanciful languages like that German:

<img src="http://img.skitch.com/20090630-bfedm35y467ifgkdmxsjagqx56.png" alt="Wikipedia"/>

and some pages threw some more interesting errors:

<img src="http://img.skitch.com/20090630-c94qy5kdspcm83n835yk63cawq.png" alt="Argument Error"/>

I'd seen this error before in <a href='http://frozenplague.net/2009/01/ruby-191-rubygems-rails/'>my Ruby 1.9 testing</a>, but that was so long ago that I had forgotten what context or even if I fixed it. Probably not.

I remembered someone linking to <a href='http://pragdave.blogs.pragprog.com/pragdave/2008/04/fun-with-ruby-1.html'>this post by Dave Thomas</a> a while ago but forgot the link, but thanks to <a href='http://google.com'>Google</a> I was able to enter "Ruby 1.9 encodings" and it knew <strong>exactly</strong> what I was after. I followed the "instructions" and put <span class='term'># encoding: utf-8</span> at the top of the merb executable and the <em>buffer.rb</em> file in HAML (which, it turns out had no bearing on the final result). No luck. Then Hampton mentioned he put -KU on the end of the ruby interpreter which randomly fixed/broke random things. So I tried that, and got a couple of degrees of success.

I opened up <span class='term'>irb1.9 -KU</span> (yeah, I'm so cool I have <strong>two</strong> versions of Ruby installed, <strong>at the same time</strong>) and I knew of the <span class='term'>encoding</span> method you could call on a string in order to get the encoding of that string. So I tried something simple: <span class='term'>"Ryan".encoding</span> which gave <span class='term'>UTF-8</span> so I tried the German text and I wasn't surprised when that also returned <span class='term'>UTF-8</span>. So what's going on?

Well, turns out that <strong>even though we specified</strong> <span class='term'># encoding: utf-8</span> in the merb executable and even in a <span class='term'>meta</span> tag in the HTML, the HAML that was getting sent to the parser was being sent in ASCII-8BIT! Around this point Bo came in and we discovered the lovely <span class='term'>force_encoding</span> method for strings in order to... well, I'm sure you can figure it out.

<a href='http://github.com/nex3/haml/blob/a4f0471c5be4640029f6deaca5d6ded45e15725c/lib/haml/buffer.rb#L137'>This is the misbehaving line in haml 2.0.9</a> and to fix it we just do <span class='term'>result.force_encoding("UTF-8")</span> and that forces whatever's being appended to the buffer to always be UTF-8! 

Hampton was happy, we were happy, and karma rewarded me with a delicious steak sandwich + icecream with banana slices with maple syrup on top.






