--- 
wordpress_id: 1198
layout: post
title: Asking Questions The Right Way
wordpress_url: http://ryanbigg.com/?p=1198
---
I spend a lot of time on <a href="http://stackoverflow.com/users/15245/ryan-bigg">Stack Overflow</a> answering Ruby and Rails questions, but also venturing into other areas such as git or html and so on. I've answered over 400 questions on there and recently broke 8,000 reputation points. As of this posting, I've been there 32 days in a row.

It's safe to say I'm a tad addicted.

I really enjoy answering <a href="http://stackoverflow.com/questions/4433823/testing-reject-if-in-anaf">interesting questions</a> asked by the huge number of people who use the site, possibly mainly because I get a "reward" for it most of the time in that my reputation "score" increases when someone presses the upvote arrow or the accept checkmark. Or possibly also because I learn stuff like that model classes in Rails 3 have a `nested_attribute_options` method on them which allows access to the configuration for all `accepts_nested_attribute_for` in that model. Or possibly both.

What I don't enjoy though is decrypting <a href="http://stackoverflow.com/questions/4456254/why-dont-i-get-a-method-error">weird questions</a>. These questions usually follow the same MO. The user begins by declaring something vague like "my code isn't working" and then follows it up with a "plz can any1 help?" or something similar. Sure, they're probably new to the language. So it's up to show them the proper way to ask a question for Ruby.

<h3>Step 0: Smart questions</h3>

Read of <a href='http://www.catb.org/~esr/faqs/smart-questions.html'>"How to Ask Questions The Smart Way" by Eric Steven Raymond</a>. It pretty much covers every single possible permutation of asking a question. Follow this guide, and you cannot do any wrong.

<h3>Step 1: Show us the code</h3>

Generally when I help somebody solve the issue it's good to get some background on how they got to that particular problem. For me, the best kind of background is some actual code. In most cases the problem is right there and obvious right away and just by looking at it anybody who knows the language should be able to help you solve it. 

If it's an IRC channel, a user can paste a single line of code into an IRC channel, but generally the preferred method is either a <a href='http://gist.github.com'>Gist</a> or a <a href='http://pastie.org'>Pastie</a> (when it's up). Be sure to mention that you're going to need the HTTP URL from those services, not the Git URL. Also, don't encourage use of <a href='http://pastebin.org'>Pastebin</a>, because it's got ugly syntax highlighting and there's a pretty strong rumour going around that it may be Demonspawn.

<h3>Step 2: Show us the stacktrace</h3>

If the code doesn't show the breakage clearly, then the next port of call is the stacktrace associated with the error. Again, <a href='http://gist.github.com'>Gist</a> or <a href='http://pastie.org'>Pastie</a> are perfect for these. Take <a href="https://gist.github.com/3a45806f5391505530a5">this gist</a> for example. If the user shows just the first line of the error then we'd have no context to go on. The stacktrace provides that context and from that we can determine they're using a deprecated-in-Rails-3 method and that they should probably delete that file.

<h3>Step 3: Explain what is being attempted</h3>

If all else fails, then perhaps there's a bigger issue at hand. Perhaps the code can be designed in a better fashion. By talking over the issue with other people they may have unique views on how to do it in a better fashion. Talking through a tough problem with other people who have been there before is really the best way to work out what the right way to do it is. 

With the `MethodError` StackOverflow question it would be helpful for a person wanting to help to know why that person wants a `MethodError` exception rather than a `NoMethodError` exception. What's the end goal?

By seeing these three simple things, we as helpers are more enabled to help those who are asking for our help.

