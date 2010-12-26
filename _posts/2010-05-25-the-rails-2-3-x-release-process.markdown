--- 
wordpress_id: 993
layout: post
title: The Rails 2.3.x Release Process
wordpress_url: http://ryanbigg.com/?p=993
---
In my <a href="http://ryanbigg.com/2010/04/when-rails-3-is-due/">When Rails 3 is due</a> post, I note all the dates where the Rails versions have been released. Since it's posting, have updated my prediction for a release candidate of Rails 3 to be RailsConf. It all makes logical sense that at Rails' biggest event they would do this. But can we, as a community, get it polished before then? I hope so! 

This post is not about Rails 3, however.

It's about the release process of the 2.3.x versions of Rails, specifically the process behind the latest <strong>four releases</strong> for this particular branch. The latest version, as of this writing is 2.3.7 and is unusable. 2.3.8-pre1 is out, and I suggest trying your applications on that and seeing if anything breaks. As a recap: <a href="http://weblog.rubyonrails.org/2009/11/30/ruby-on-rails-2-3-5-released">2.3.5 was released in November of <strong>last year</strong></a>, <a href='http://weblog.rubyonrails.org/2010/5/23/ruby-on-rails-2-3-6-released'>2.3.6 this weekend just gone</a>,<a href='http://weblog.rubyonrails.org/2010/5/24/ruby-on-rails-2-3-7-released'>2.3.7 yesterday</a> and <a href='http://rubygems.org/gems/rails/versions/2.3.8.pre1'>2.3.8.pre1</a> shortly thereafter.

Let's begin with what pre-releases are for: they are for people to test them to ensure that the final release is "smooth". If you want to contribute to Rails: spend some time from your week ensuring your application runs on the latest version of Rails and <a href='http://rails.lighthouseapp.com'>report any problems</a>. It's not hard to create a branch and do this. If you are one to ignore pre-releases, then you are not one who should be complaining when things break in the final version of your application. In almost every case, your application will work. You may get the "off-suit draw" and something breaks. <a href='http://rails.lighthouseapp.com'>Report your problem</a>.

A problem occurs when patch releases are made without any pre-releases at all. 

2.3.6 was released <strong>without a pre-release</strong>. Whilst this is may be perceived as a <em>catastrofuck</em> for some people, it was a long time due. The prior release, 2.3.5, was released almost dead-on six months ago. Six months between releases, in the Rails world, is a long time. Things have been progressing rapidly, and a lot of people will benefit from the changes introduced by these new versions, including support for rack and thin 1.1.0. Yes, now you'll be able to run your Rails app by using Thin.

However, 2.3.6 broke HAML <a href='http://twitter.com/nex3/status/14549663207'>which Nathan Weizenbaum tweeted about</a>. He later said he had worked around it <a href='http://twitter.com/nex3/status/14551076330'> and contributed back to Rails in <a href='http://github.com/rails/rails/commit/e3f14d12cdad03a2294c8f7d4e170bbaecefe098'>these</a> <a href='http://github.com/rails/rails/commit/e53791f8c06cad94f69789143e442e9866f9dfe0'>three</a> <a href='http://github.com/rails/rails/commit/48fbe7b0d8fcecce200ea35f46a8716077e13aea'>commits</a>. Jeremy Kemper (bitsweat) then thought that there should be a 2.3.7 release.

Unfortunately this <a href='http://github.com/rails/rails/commit/e3f14d12cdad03a2294c8f7d4e170bbaecefe098'>first commit</a> broke Rails view helpers -- such as `form_tag` -- for those who didn't have the _rails-xss_ plugin installed.  Jeremy missed this, and I spoke with him earlier and from what I could determine he missed the bug because he had _rails-xss_ installed. When people upgraded to 2.3.7, there was <a href='http://weblog.rubyonrails.org/2010/5/24/ruby-on-rails-2-3-7-released'>an outcry</a> started. A few people announced this issue, and therefore 2.3.7 was broken.

Whilst Rails is pretty exceptionally tested, it's not 100%-watertight. Would this have happened if there was a pre-release? Yes and no.

On the yes side of the fence, people generally view pre-releases as "potentially unstable" and won't upgrade their application, therefore they won't upgrade. I implore you: upgrade your application <strong>locally</strong> to these new versions and run your tests. You do have tests, don't you? Then if it breaks: <a href='http://rails.lighthouseapp.com'>report your problem</a>. Patches very, very, very welcome.

On the no side, there is that handful of people who do test new releases when they come out. Therefore, this issue may have been raised if there was a pre-release. We can't know for sure.

<a href='http://weblog.rubyonrails.org/2010/5/25/ruby-on-rails-2-3-8-released'>2.3.8 was released a couple of hours ago</a> and Jeremy has apologised for the rushed releases and promised to follow the "same methodical drumbeat" for every release, regardless if it's major, minor or patch. He is an absolute legend for working on this issue pretty consistently since the weekend and for getting a push out as quickly as possible.

With this release, now we've got an up-to-date stable 2.3.

Ladies and gentlemen, <strong>upgrade your apps</strong>!
