--- 
wordpress_id: 1089
layout: post
title: Three Dot Oh
wordpress_url: http://ryanbigg.com/?p=1089
---
If you haven't heard already, <a href='http://weblog.rubyonrails.org/2010/8/29/rails-3-0-it-s-done'>Rails 3.0.0 was released earlier today!</a> Congratulations to <a href='http://contributors.rubyonrails.org'>all who have worked</a> on this release since December 2008. Thank you.

With this "final" release of 3.0.0 finally out the door, I've seen a great uptake of it and I'm excited to see what people do with it. Whilst it almost seems mandatory to participate in the circlejerk, I am going to take leave from it this time and delve into something else very much related.

Even though Rails 3 is out and we should all really upgrade our applications right now, there's going to be some people, like myself, who are still going to be developing Rails 2.x applications. I know, right? The guy <a href='http://manning.com/katz'>writing a book on Rails 3</a> has a day job developing a Rails 2 application.

C'est la vie.

So does my friend Lucas Willett and his team at Ennova and not forgetting the fabulous <a href='http://twitter.com/jasoncodes'>@jasoncodes</a>. Tonight we were discussing, as we do, things relating to Rails. The (one-sided) conversation goes like this:

<blockquote>
Lucas: sup<br>
Lucas: freaking bastard heroku<br>
Lucas: we're using [declarative_authorization] 0.5 which has only one gem dep of rails 2.1.0 and greater<br>
Lucas: so heroku decides OH SHIT<br>
Lucas: YOU NEED AREL AND ACTIVE SUPPORT AND EVERYTHING EVER<br>
Lucas: VERSION 3 OF EVERYTHING<br>
</blockquote>

Lucas is an energetic kind of guy. I can imagine him typing that at no less than 546wpm, frowning intently the entire time.

The problem it turns out is <a href='http://github.com/stffn/declarative_authorization/blob/master/declarative_authorization.gemspec'>this glorious file</a>. Do you see any problem with it? No?

Not even with this?

<h2>s.add_dependency('rails', '&gt;= 2.1.0')</h2>

Yeah, that's right. Greater-than-or-equal to 2.1.0. Do you <strong>know</strong> what got released today? Three Dot Oh. BOOM.

That's the problem. That little dependency line's going to want to install the <strong>latest and greatest</strong> version of Rails, which just so happens to be 3.0.0. Oops. But Lucas is still running a 2.3.x application. 

So how do we fix this? I'm not entirely sure myself. One of the options (coincidentally the only one I can think of right now) would be to tell Lucas to use Bundler for his 2.x application like all good boys & girls should be doing. Bundler would solve this problem by only loading the gems that Lucas wants. Take this (contrived) <em>Gemfile</em> as an example:

<pre>
  gem 'rails', '2.3.8'
  gem 'declarative_authorization'
</pre>

Bundler will <strong>only</strong> load the 2.3.8 Rails gem, regardless of what Lucas has installed. He could have every single version of Rails installed. 2.3.8 is king. When Lucas (or any code throughout his application) does something like:

<pre>
  require 'active_support'
</pre>

RubyGems won't through a hissy fit similar to this:

<blockquote>
  Gem::LoadError: can't activate activesupport (= 3.0.0, runtime) for ["railties-3.0.0"], already activated activesupport-2.3.8 for []
</blockquote>

Bundler's got that covered.

I hear you cry! You say: "But (Sir/Lord/King/Dickhead) Ryan, I thought Bundler only worked with Rails 3!!one" (for one of the exclamation points, you <strong>actually</strong> say "exclamation (point!)"). This is simply not true.

There are <a href='http://gembundler.com/rails23.html'>lovely instructions on how to use Bundler with Rails 2.3</a>. I would suggest that you (along with Mr Willett) read these to save yourself some potential headaches.

Why? Because right now if you do <span class='term'>gem install declarative_authorization</span> and you don't have Rails 3 installed, you'll get it installed:

<pre>
Successfully installed declarative_authorization-0.5
Successfully installed activesupport-3.0.0
Successfully installed activemodel-3.0.0
Successfully installed rack-mount-0.6.12
Successfully installed tzinfo-0.3.23
Successfully installed erubis-2.6.6
Successfully installed actionpack-3.0.0
Successfully installed arel-1.0.1
Successfully installed activerecord-3.0.0
Successfully installed activeresource-3.0.0
Successfully installed actionmailer-3.0.0
Successfully installed thor-0.14.0
Successfully installed railties-3.0.0
</pre>

[dhh voice]WHOOPS![/dhh voice]

So yes, the short end of this story is: use Bundler. Please? Yehuda's put a lot of effort into it and I'm pretty confident it's going to save you (and Lucas!) a lot of heartache in the future (of which Bundler is a big part).

I hope to see a lot more of you out there using Rails 3 (like <a href='http://gemcutter.org'>Gemcutter</a> is). Until then, I'll be quietly sobbing at my desk working on this now ancient relic of a Rails 2 application. Enjoy.
