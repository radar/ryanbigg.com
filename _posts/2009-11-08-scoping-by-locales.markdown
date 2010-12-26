--- 
wordpress_id: 739
layout: post
title: Scoping by locales
wordpress_url: http://frozenplague.net/?p=739
---
Today in #rubyonrails, <a href='http://kiwinewt.geek.nz/'>kiwinewt</a> asked: 

<blockquote>How can I have a model with a text field and have that text field in multiple languages?</blockquote>

To which he meant that he has a model and he wants different versions of text displayed based on whatever the locale is set to. This is quite the common question in the channel and previously I've drawn blanks, but today I had a Moment of Clarity +10 and coded up something amazingly simple. 

It has two parts. The first is the code in the model:

<pre lang='ruby'>
class Page < ActiveRecord::Base
  def self.with_locale(&block)
    page = scoped_by_locale(I18n.locale.to_s) { block.call }.first
    page ||= scoped_by_locale(I18n.default_locale.to_s) { block.call }.first

    raise ActiveRecord::RecordNotFound, "The page you were looking for does not have a version in #{I18n.locale}" if page.nil?
    
    page
  end
end
</pre>

And the second is how you use it:

<pre>
  @page = Page.with_locale { Page.first }
</pre>

Now if you set <span class='term'>I18n.locale</span> in your application and use <span class='term'>with_locale</span> it will automatically find records based on that locale.
