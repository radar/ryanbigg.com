--- 
wordpress_id: 191
layout: post
title: A bit of refactoring love
wordpress_url: http://frozenplague.net/?p=191
---
<h3>Find, Find, Find, Find, I don't think so...</h3>

As explained in previous posts, Rails controllers have 7 default actions (index, new, create, show, edit, update, destroy). Four of these seven actions make the same find call, <span class='term'>Model.find(params[:id])</span> and this tutorial is to tidy that up so you're not repeating yourself over four different actions. To clean this up we'll just call a before filter:

<pre lang='rails'>
class ForumsController < ApplicationController
  before_filter :find_forum

  # Actions go here
  
  private
    def find_forum 
      @forum = Forum.find(params[:id])
    end
end
</pre>

Now you may be thinking, "Why are we doing that? That's 5 lines!". Think about if you wanted to change the find statement, and now you'll begin to picture why. Changing one line is much easier than changing four. For example, if I wanted to find forums by their slugs instead of an ID I would simply change <span class='term'>@forum = Forum.find(params[:id])</span> to <span class='term'>@forum = Forum.find_by_slug(params[:id])</span>. Of course, for this to work with the restful routes helpers the way we expect it to (e.g. <span class='term'>forum_path(@forum)</span> -> /forums/the-first-forum), we'll need to re-define <span class='term'>#to_param</span> in our model:

<pre lang='rails'>
class Forum
  def to_param
    slug
  end
end
</pre>

<h3>Common Lookups </h3>

Sometimes you'll have data initialised for your forms and you'll want to initialise this data multiple times. Instead of repeating yourself like this:

<pre lang='rails'>
class ForumsController

  def new
    @forum = Forum.new
    @something_special = SomethingSpecial.find(:all, :order => "id DESC")
  end
 
  def create
    @forum = Forum.new(params[:forum])
    if @forum.save
      flash[:success] = "A forum has been created."
      redirect_to @forum
    else
      flash[:failure] = "A forum could not be created."
      @something_special = SomethingSpecial.find(:all, :order => "id DESC")
      render :action => "new"
    end
  end

end
</pre>

You could instead have:

<pre lang='rails'>
class ForumsController

  def new
    @forum = Forum.new
    common_lookups
  end
 
  def create
    @forum = Forum.new(params[:forum])
    if @forum.save
      flash[:success] = "A forum has been created."
      redirect_to @forum
    else
      flash[:failure] = "A forum could not be created."
      common_lookups
      render :action => "new"
    end
  end

  private
    def common_lookups
      @something_special = SomethingSpecial.find(:all, :order => "id DESC")
    end
end
</pre>

<h3>Shorter Routing</h3>

One last thing that I'd like to show you is shorter routing. Ever since the restful routing helpers were added, routing to specific controllers and their actions has become easier and easier. Rails 2.0 makes it extremely easy, but first we'll see how far we've come:
<ol>
<li><span class='term'><%= link_to @forum, { :controller => "forums", :action => "show", :id => @forum.id } %></span></li>
<li><span class='term'><%= link_to @forum, forum_path(@forum) %></span></li>
<li><span class='term'><%= link_to @forum, forum_path %></span></li>
<li><span class='term'><%= link_to @forum, @forum %></span></li>
<li><span class='term'><%= link_to @forum %></span></li>
</ol>

As long as there's a <span class='term'>#to_s</span> method in the Forum model it will insert that as the phrase shown to the user for the link. All of the above should produce the same URL, with the exception of the first which will produce <span class='term'>/forums/show/1</span>, and going down the list they're just shorter ways of writing the same thing. If you had nested routes such as <span class='term'>forum_topic_path(@forum, @topic)</span> you could do <span class='term'><%= link_to @topic, [@forum, @topic] %></span> as the extremely short version of it. The reason why we can't do just <span class='term'><%= link_to [@forum, @topic] %></span> is because this will show the to_s version of @forum, followed immediately by the to_s version of @topic.
