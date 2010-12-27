--- 
wordpress_id: RB-293
layout: post
title: Converting from WordPress to Jekyll
---

Yesterday I converted this blog from WordPress to Jekyll, thanks to some prompting from <a href='http://twitter.com/lenary'>Sam Elliott</a> and <a href='http://twitter.com/rohitarondekar'>Rohit Arondekar</a>. All in all, the process wasn't actually all that painful. What triggered this whole thing was three factors:

* My Slicehost server crashed, possibly due to some intense load I was getting from the <a href='http://ryanbigg.com/2010/12/ubuntu-ruby-rvm-rails-and-you'>Ubuntu, Ruby, RVM, Rails and You</a> post I wrote (whilst under the influence of delicious cider).
* When the server rebooted, I was unable to boot Apache2 back up because *somebody* (read: me) had fucked with sqlite3 to try to get his IRC bot to work on the server.
* Slicehost charged me $38/month for a 512MB box. Linode charges about half that for the same thing. Fuck Slicehost.

So off I went on a magical journey to fix these three problems.

### Never work on live systems

A rule that every developer has to learn the hard way (be it from anywhere to their own system up to a website with a couple of hundred users) is that you **never ever, ever, ever work on live systems because something will go terribly, terribly wrong**. The second rule that every developer learns is **backups, motherfucker, do you have them?**. So when I had 3 years of posts that I didn't want to lose I obeyed these two rules.

### Wordpress conversion

First task was to take an SQL backup from the WordPress install that I had and move it over to my own system. Next, I imported this SQL into a local install of MySQL and made sure it was the latest-and-greatest. Sure, enough it was. Rohit had pointed me at the <a href='https://github.com/mojombo/jekyll/wiki/blog-migrations'>Blog migrations wiki page</a> for Jekyll and it had what appeared to be clear instructions for WordPress there.

So I cloned the <a href='http://github.com/mojombo/jekyll'>Jekyll</a> project into my `~/Sites/gems` folder and ran just the wordpress commands because I have tunnel vision when reading documentation (note: not my real username and password):

    $ export DB=ryanbigg
    $ export USER=lolno 
    $ export PASS=nopass4u 
    $ ruby -r '~/Sites/gems/jekyll/lib/jekyll/migrators/wordpress' -e 'Jekyll::WordPress.process( "#{ENV["DB"]}", "#{ENV["USER"]}", "#{ENV["PASS"]}")'

To my surprise, it worked. I had a whole bunch of `_posts` files representing the posts in my system. 

### Booting Jekyll

I installed the `jekyll` gem itself using `gem install jekyll` and then ran `jekyll --server` and it threw up a ton of "errors", which actually turned out to be warnings about my ability to sometimes intersperse invalid HTML / Markdown with valid Markdown (or the other way around). When I went to http://localhost:4000 I got a 403 error. So I checked out other Jekyll blogs like <a href='http://github.com/qrush/litanyagainstfear'>Nick Quaranto's litanyagainstfear repository</a> to see what I was missing. I instantly came across the <a href='https://github.com/qrush/litanyagainstfear/blob/master/index.html'>index.html</a> file in this repository and "borrowed" it for my own blog, turning it into <a href='https://github.com/radar/ryanbigg.com/blob/master/index.html'>what's now here</a>. I choose to only show the last 25 posts because everything before that is ancient history. The links to them will still work, but I'm just not showing them in the archive list to conserve space.

### Stylin'

The next thing I needed to do was to create a <a href='https://github.com/radar/ryanbigg.com/blob/master/_layouts/default.html'>default.html layout</a> file in the `_layouts` folder to style this new home page of mine. I created a `css` folder at the root of the project and put in <a href='https://github.com/radar/ryanbigg.com/blob/master/css/style.css'>`style.css`</a> and got to work styling it. I wanted something a little more lightweight than the old theme and I think what I came up with was alright. This morning I added a <a href='https://github.com/radar/ryanbigg.com/blob/master/css/mobile.css'>`mobile.css`</a> which should format the blog just fine for mobile screens. It looks great on my iPhone 4.

### Comments

I wanted to keep the comments from the WordPress site and Rohit recommended Disqus as a way to do that. I installed the <a href='http://wordpress.org/extend/plugins/disqus-comment-system/'>WordPress plugin</a> for it and followed the bouncing ball and had my comments exported to Disqus in no time. I needed to add the following to the <a href='https://github.com/radar/ryanbigg.com/blob/0c30ab8b5b9721b16fa125d94270d797d4eb556e/_layouts/post.html#L16-30'>post layout</a> to support the Disqus comment system. The `wordpress_id` field is the "secret sauce" here for how Disqus knows which post links up to what comments. The only caveat I've been informed about for Disqus is that the comments won't be indexed by Google because they're loaded via a JavaScript request, but I can tolerate that. Any useful information I would put in a post, probably.

### WordPress pages

To convert over the pages from WordPress that weren't posts I've copied the source of them (such as the <a href='http://ryanbigg.com/about-me.html'>About me</a> page) and put them as static HTML files in the root of the project. When Jekyll compiles the site, these are copied over to the `_site` directory.

### Deployment

Currently going via the low-tech method of an SSH + `git pull` on the server, but hoping to switch to a commit hook in the future.

### Benefits

The benefits are many. My posts are now <a href='http://github.com/radar/ryanbigg.com'>open source</a> which means that if people find problems with them that can send in pull requests, but that's just a pipe dream probably. 

The main benefit is the speed. On the vanilla WordPress install I had I was lucky to get 2 requests per second for the home page. With Jekyll, I'm getting about 2,300 reqests per second. This is due to the fact all my posts are static assets now. I think I could double this if I <a href='http://ryanbigg.com/2009/06/how-to-make-your-rails-application-578-times-faster/'>switched to Nginx</a>, which I plan on doing when I don't have a use for the PHP version anymore.

I also get to write my posts the way I like to: Markdown + HTML. No crummy little editor window, I can do it all from within TextMate.

I'm really liking Jekyll as lightweight alternative to WordPress and it's great to finally be off a PHP-based system. I mean, if Ruby is so good <a href='http://en.wikipedia.org/wiki/Not_Invented_Here'>why would I be using a PHP based system?</a>


