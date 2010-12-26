--- 
wordpress_id: 488
layout: post
title: Testing Gems with multiruby
wordpress_url: http://frozenplague.net/?p=488
---
A couple of days ago I was requested politely and with acknowledgement of my humanity, by <a href='http://drnicwilliams.com'>Dr Nic</a> to write a post about testing gems on 1.9 and because he's my boss I'm obliged to do the things he tells me to do. He told me to read his post about <a href='http://drnicwilliams.com/2008/12/11/future-proofing-your-ruby-code/'>Future-proofing Your Ruby Code</a> and in particular the instructions about installing multiruby. 

<h3>How to install multiruby</h3>

You can install multiruby, different versions of ruby, rubygems and useful gems using these commands:

<pre>
sudo gem install ZenTest
multiruby_setup mri:svn:tag:v1_8_6_114
multiruby_setup mri:svn:tag:v1_8_7_153
multiruby_setup mri:svn:tag:v1_9_1_0

multiruby_setup update:rubygems
multiruby -S gem install --no-ri --no-rdoc --development test-unit</pre>

This will:

<ol>
  <li>Install ZenTest (or the latest version)</li>
  <li>Install Ruby 1.8.6, build 114</li>
  <li>Install Ruby 1.8.7, build 153</li>
  <li>Install Ruby 1.9.1, build 0</li>
  <li>Setup Rubygems for all three versions and;</li>
  <li>install test-unit for all three versions!</li>
</ol>

You may also want to <span class='term'>multiruby -S gem install --no-ri --no-rdoc --development rails mocha rspec</span>.

multiruby is awesome because it sticks this all in your home directory in a folder called <em>.multiruby</em>, so don't worry about it clashing with your existing version(s) of ruby. Different versions go in different directories inside <em>.multiruby/versions</em>.

<h3>numero!</h3>

Today we're going to be testing a gem that <a href='http://frozenplague.net/numero.html'>I recently made use of on this site</a>. For those of you that visited <a href='http://frozenplague.net/numero.html'>the site yesterday</a> you would've seen something like this:

<pre>
  112.117.116.115.32.34.104.101.108.108.111.32.119.111.114.108.100.34
</pre>

This is numero! <small>(exclamation mark <strong>compulsory</strong>)</small>.  I don't know where the idea came from. According to the MSN logs I keep, at 8:03am Friday morning I went and made breakfast and then at 8:13am I had the idea. But it's awesome. The "language" uses the ASCII representation of all your favourite characters and separates them using a dot. This is numero! script. You run it using the numero! gem. This is how you get it:

<pre>
sudo gem install radar-numero --source http://gems.github.com
</pre>

Test it out by running it on your favourite ruby script!

<pre>
numero favourite.rb
</pre>

This will generate a file called <em>favourite.numero</em> and then evaluate the newly generated numero! code. Now you can throw away your ugly ruby file and bathe in the glory that is numero by then running:

<pre>
numero favourite.numero
</pre>

So it appears we've gone off on a tangent here! Fear not! For I want you to test my gem on your new multiruby setup:

<pre>
git clone git://github.com/radar/numero
cd numero
git checkout -b broken origin/broken
</pre>

Now this sensible naming schema will probably dissolve the mystery surrounding what's going to happen next. You're going to be testing my gem, and it's going to break.

<h3>Testing numero!</h3>

When I wrote this particular branch of numero!, I used <span class='term'>"a"[0]</span> to get the ASCII representation (97) of the letter a. Generally, I would've used use a variable rather than "a", but this is just an example. The problem is that this doesn't work the same way in Ruby 1.8.* and Ruby 1.9. If we run <span class='term'>multiruby -S test/test_numero.rb</span> we see that it passes on both versions of Ruby 1.8, but fails on Ruby 1.9!

<strong>Ruby 1.8.*</strong>
<pre>
Loaded suite test/test_numero
Started
.
Finished in 0.001186 seconds.

1 tests, 1 assertions, 0 failures, 0 errors
</pre>

<strong>Ruby 1.9</strong>
Loaded suite test/test_numero
Started
F

Finished in 0.025228 seconds.

  1) Failure:
test_numero_compiles(TestNumero) [test/test_numero.rb:9]:
<"[\"p.u.t.s. .\\\".h.e.l.l.o. .w.o.r.l.d.\\\"\"]"> expected but was
<"112.117.116.115.32.34.104.101.108.108.111.32.119.111.114.108.100.34">.

1 tests, 1 assertions, 1 failures, 0 errors, 0 pendings, 0 omissions, 0 notifications
</pre>

Not good! <strong>This is something I wouldn't have found if I didn't test the functionality on multiple Rubies.</strong> Using multiruby is <strong>essential</strong> to ensure that your code works for everybody. We don't want to end up like Internet Explorer.

The solution, of course, is to use <span class='term'>str.unpack("C").first</span> instead. You have two options: 1) change the code yourself in <em>lib/numero.rb</em> to use the afore-mentioned example or 2) <span class='term'>git checkout master</span>. Now we run the tests again and now Ruby 1.9 passes:


<strong>Ruby 1.8.7</strong>
<pre>
Finished in 0.001109 seconds.

1 tests, 1 assertions, 0 failures, 0 errors
</pre>

<strong>Ruby 1.9.1</strong>
<pre>
Finished in 0.001353 seconds.

1 tests, 1 assertions, 0 failures, 0 errors, 0 pendings, 0 omissions, 0 notifications
</pre>

Lovely!
