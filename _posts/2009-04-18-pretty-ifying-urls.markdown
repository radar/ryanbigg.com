--- 
wordpress_id: 510
layout: post
title: Pretty-ifying URLs
wordpress_url: http://frozenplague.net/?p=510
---
In today's modern world we are not limited (cough, FORTRAN) to storing information in just a couple of bits. Some say that having pretty URLs is good SEO. I say it's just common sense. I want the URL to tell a story, not give me some number that is only important to the system it's coming from. 

This is where `to_param` comes in.

By default this is defined like this:

<pre lang='ruby'>
def to_param
  id
end
</pre>

Pretty high-tech stuff there. I won't explain it to you. Give it a moment to sink it. et-cetera.
This method is called on an object when it is passed to a url helper such as `link_to` or `redirect_to`. It is important to note that you should NEVER call `@object.id` as that will give the id of the object, not the `to_param` version of that name.

You can override this in your model in order to give you pretty urls! The way you do this is:

<pre lang='rails'>
def to_param
  "#{id}-#{name.parameterize}"
end
</pre>

Where `id` is the id of the model and `name` is the text you want into the URL. We call `parameterize` on this text in order to make it URL friendly. 

The reason why we put in the id in the URL is two-fold. Firstly, (<em>/forums/1-best-forum-ever</em>) is so that when it gets passed to our controller as `params[:id]` or similar, we're able to pass it to a finder:

<pre lang='rails'>
Forum.find(params[:id])
# will be passed in as...
Forum.find("1-best-forum-ever")
</pre>

Now you may go "Hey... wait a second! I don't have an ID in my database that says '1-best-forum-ever'!" and you'd be right, you don't. But you <strong>do</strong> have an ID of 1 for a record somewhere. Rails will call `to_i` on this value and convert it simply down to `1` and you'll be able to treat the pretty URL as if it were a real ID.

Secondly, if two objects in your database have the same name they won't clash for the parameterized versions, since the id will always be unique.

<h3>But I don't want my ID in my URL</h3>

Hey, that's cool too! Just a little tougher... Before you save your records you'll want to write out the permalink as a new field, so define a field called `permalink` in your table if you want to take this route. Then you do a `before_save` and define `to_param` like this:

<pre lang='rails'>
before_create :set_permalink

def set_permalink
  self.permalink = name.parameterize
end

def to_param
  permalink
end
</pre>

Now when you call the finder you're going to need to `find_by_permalink!` instead of just `find`:

<pre lang='rails'>
Forum.find_by_permalink!(params[:id])
</pre>

We have to use the bang version of `find_by_permalink` because this will raise an `ActiveRecord::RecordNotFound` exception if the record is not found, just like `find`. (Thanks to <a href='http://frozenplague.net/2009/04/pretty-ifying-urls/comment-page-1/#comment-10583'>Yarsolav Markin</a> for mentioning this)

So there you have it. `to_param` overriding for pretty URLs.
