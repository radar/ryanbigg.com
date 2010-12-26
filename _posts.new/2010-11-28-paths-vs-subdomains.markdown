--- 
wordpress_id: 1181
layout: post
title: Paths vs Subdomains
wordpress_url: http://ryanbigg.com/?p=1181
---
Earlier today I put out <a href='http://twitter.com/ryanbigg/status/8747010869956608'>a tweet</a> which asked:

<blockquote>
site.com/account (Github) or account.site.com (Basecamp) style for per-account URLs?
</blockquote>

There were great arguments from both sides in the debate. Tweets like <a href='http://twitter.com/Sutto/status/8799294744170496'>Darcy Laycock's</a> and <a href='http://twitter.com/jms_/status/8770149087707137'>James Ottaway's</a>.

I've decided to make it paths for two reasons.

<h3>Easier to test</h3>

Quite simply, paths (http://ticketee.com/account) are much easier to test by booting up `rails server` than subdomains are. They require no additional configuration by that means and they're guaranteed to work on all systems.

Subdomains on the other hand would require use of another tool such as <a href='http://github.com/bjeanes/ghost'>Ghost</a> which would work on Ubuntu and Mac OS X, but not Windows. There is no One True Solution for everybody when it comes to subdomains. Since Rails 3 in Action is intentionally written without discrimination between operating systems, I would prefer this chapter to be no exception to that rule.

<h3>Account sharing</h3>

In the application I am going to be sharing users across accounts. A user that is created on one account, can be gifted access to an alternative account. This would result in an "open" system, and I think a path URL would be better for this than a subdomain URL.

Thank you all for your suggestions and the interesting discussions tonight. You've been amazing.
