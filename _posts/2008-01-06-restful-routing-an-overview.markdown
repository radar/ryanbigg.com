--- 
wordpress_id: 108
layout: post
title: "Restful Routing: An Overview"
wordpress_url: http://frozenplague.net/?p=108
---
Here's something I posted on rubyonrails talk:

In truth, restful routing is plain and simple. It's like those books you wrote when you were a kid in kindergarten that if a book critic were to read them he would jab his eyes out with a pen.

For this example I'm going to use a personal favourite: a forum system. It's small enough to not be overwhelming, yet large enough to explain how restful routing should work (and generally why you should use it).

It all starts with the good 'ol config/routes.rb file. In here is where all the nice little routes live, from map.root all the way down to the   map.connect ':controller/service.wsdl', :action => 'wsdl' that many people still leave in their routes file, thinking that if they remove it the entire world would collapse upon itself into one small quantum singularity. In here you'd place something similar to:
<pre lang="rails">
map.resources :forums, :has_many => :topics
map.resources :topics, :has_many => :posts
map.resources :posts</pre>

Not running on Rails 2.0? Then this is the code you want:

<pre lang="rails">
map.resources :forums do |forum|
  forum.resources :topics, :name_prefix => "forum_"
end

map.resources :topics do |topic|
  topic.resources :posts, :name_prefix => "topic_"
end

map.resources :posts
</pre>

This defines routes like:
<pre>/forums/1</pre>
- Show a forum
<pre>/forums/1/topics</pre>
- Index action for a single forum
<pre>/forums/1/topics/1</pre>
- showing a single topic
<pre>/topics/1</pre>
- Same thing
<pre>/topics/1/posts/</pre>
- I would imagine this would do a similar thing to /topics/1
<pre>/topics/1/posts/1/edit</pre>
- Allows you to edit a single post
<pre>/posts/1/edit</pre>
- Same thing

Now to define something like this without the magic of restful routing, one would have to be clinically insane:
<pre lang="rails">
map.connect "/forums/:id", :controller => "forums", :action => "show"
map.connect "/forums/:forum_id/topics/", :controller => "topics", :action => "index"
map.connect "/forums/:forum_id/topics/:id", :controller => "topics", :action => "show"
map.connect "/topics/:id", :controller => "topics", :action => "show" <- Does this look familar to /forums/:id?
map.connect "/topics/:topic_id/posts", :controller => "posts", :action => "index"
map.connect "/topics/:topic_id/posts/:id/edit", :controller => "posts", :action => "edit"
map.connect "/posts/:id/edit", :controller => "posts", :action => "edit"</pre>
And this is only the tip of the iceberg!

Seeing a pattern here? Restful routing gives you a whole heap of cool stuff, namely the 7 core methods that I'll cover right after the models.

A forum system has the following tables: forums, topics, posts and users, and the models would look something like the following:
<pre lang="rails">
class Forum < ActiveRecord::Base
  has_many :topics
  has_many :posts, :through => :topics
end</pre>
<br>
<pre lang="rails">
class Topic < ActiveRecord::Base
  has_many :posts
  belongs_to :forum
  belongs_to :user
end
</pre>

<br>
<pre lang="rails">
class Post < ActiveRecord::Base
  belongs_to :topic
  belongs_to :user
end</pre>

<br>
<pre lang="rails">
class User < ActiveRecord::Base
  has_many :topics
  has_many :posts
  def to_s
    login
  end
end
</pre>
The fields don't matter, but throughout the tutorial I make reference to @forum.name or something similar, so we'll assume forums has at least a name field. We'll assume post has a text field and users has a login field.

That'll give you some idea of how the system works: Forum -> Topics -> Posts.

In restful routing there are seven "core" methods (actions) that you're given for the controllers: index, show, new, create, edit, update, destroy. Each of these have a set request method on them, for example you can't GET to the create, update and destroy actions and you can't post to the index, new or edit actions. These actions work with these request methods:

GET: index, show, new, edit
POST: create
PUT: update
DELETE: destroy

"What the?! PUT &amp; DELETE, where did they come from?", I hear you cry! These are hacked into the calls for the appropriate action using javascript, it passes in one more parameter (_method) which is then handled by the rails code and depending on what method you called you will get the page you were looking for, or a routing error.

The forums controller could look like this:
<pre lang="rails">
class ForumsController < ApplicationController
  def index
    @forums = Forum.find(:all)
  end

  def show
    @forum = Forum.find(params[:id])
  end

  def new
    @forum = Forum.new
  end

  def create
    @forum = Forum.new(params[:forum])
    if @forum.save
      flash[:notice] = "You have created a forum!"
      redirect_to forums_path
    else
      render :action => "new"
    end
  end

  def edit
    @forum = Forum.find(params[:id])
  end

  def update
    @forum = Forum.find(params[:id])
    if @forum.update_attributes(params[:forum])
      flash[:notice] = "You have updated #{@forum.name}"
      redirect_to forum_path
    else
      flash[:error] = "This forum could not be updated."
      render :action => "new"
    end
  end

  def destroy
    @forum = Forum.find(params[:id])
    @forum.destroy
    flash[:notice] = "You have deleted #{@forum.name}"
    redirect_to forums_path
  end

end</pre>
You'll see here that I've twice made a call to redirect_to using the argument of forums_path. Because we've defined map.resources :forums in our config/routes.rb file, it knows that we want to go to { :controller => "forums", :action => "index" } and the best part is that we don't have to keep trying { :controller => "forums", :action => "index" } every time we want to go to that specific action, but instead we type forums_path.

I've also made a single call to forum_path, and I haven't specified an argument for it, so how does Rails know that I want to go to the forum that I just updated?

Rails will see that there's an argument mission from the forum_path and will go looking for the @forum instance variable you've defined in your controller. If you never defined one or defined it as something other than @forum, it will mention something about ambiguous routes and you'll have to specify the variable.

Now what if you wanted to go to the new or edit action? Simple: new_forum_path and edit_forum_path(@forum) will take you to the corresponding actions. Remember that you don't need to specify an argument for the edit_forum_path if @forum is defined. Inside these actions you'll want to go further, you'll want to create a new forum and update a forum.

For the create action you could specify this for your form:
<strong>Rails 2.0:</strong>
<pre lang="rails"><% form_for @forum do |f|%></pre>
Rails 2.0 will see that @forum is a new record and link you the create action.

<strong>Pre Rails  2.0:</strong>
<pre lang="rails"><% form_for :forum, @forum, :url => forums_path do |f|%></pre>
Prior to Rails 2.0 that checking wasn't in, you'll have to define your own link.

"B-b-b-ut", you stammer, "you've linked to the forums index, right? Isn't that what forums_path is?"

Well, yes and no. This has everything to do with the four request methods mentioned previously, because the form's method attribute is "post", Rails knows that if you're posting to forums_path, you mean the create action. And now for the update action!

Here the form_for's a little different, but only for pre-Rails 2.0:

<strong>Rails 2.0:</strong>
<pre lang="rails">
<% form_for @forum do |f| %></pre>
Again the same deal applies: Rails 2.0 knows that @forum is not a new record, so it'll link you to to the update action because it's included in a form. This automatically specifies  :html => { :method => :put } for you.

<strong>Pre Rails 2.0</strong>
<pre lang="rails">
<% form_for :forum, @forum, :url => forum_path(@forum), :html => { :method => "put" } do |f| %></pre>
It knows to link you to the update action because of the method => "put" we've specified.

Now lets escape from the confines of a single controller and bring the topics controller into the mix. In the forum show action is where you would generally show all the topics for that forum, but for the purposes of this tutorial I will do it in the topics controller instead. This will have something similar defined to the forums controller but personally I would define this for the controller:
<pre lang="rails">
class TopicsController < ApplicationController
  before_filter :get_forum

  def index
    @topics = @forum.topics
  end

  #other actions
  private
    def get_forum
      @forum = Forum.find(params[:forum_id]) if params[:forum_id]
    end
end</pre>
The private call makes any method after it private, that means that if you were to try and access this method (without restful routing), it would play dumb. Personally, I think something like this should be in-built to Rails, if you're accessing a child object (topics) from a parent (forum) it should automatically define @forum for you.

Because we've already defined the :has_many topics on map.resources :forums, the topic routes are already defined for us, so to view all the topics for a forum, before you would have to do define a route like this:
<pre lang="rails">
map.connect "/forums/:forum_id/topics/", :controller => "topics", :action => "index"</pre>
and then call it like this:
<pre lang="rails">
{ :controller => "topics", :action => "index", :forum_id => @forum.id }</pre>
Instead you've already defined :has_many => :topics, so instantly you'll gain access to forum_topics_path. Again the wonderful Rails will realise that you want all topics for the @forum object and then direct you to "/forums/1/topics/" through forum_topic_path. To edit a single topic, you could do edit_forum_topic_path as of Rails 2.0, or forum_edit_topic_path prior to Rails 2.0. The first reads more like "edit this topic belonging to this forum" where the second reads like "in this forum, edit this topic". Alternatively you could ditch the whole forum part out of the method call and just do edit_topic_path because we've defined map.resources :topics.

Throwing one more controller into the mix now, called posts_controller. This would be very similar to the topics controller but instead of get_forum it would have get_topic, modified correctly.

Now what if you wanted to add a custom action to posts_controller, called quote? This action would bring up a form with the post you were quoting which would then send the information from the form into posts/new to create a new post:

<strong>config/routes.rb</strong>
<pre lang="rails">
map.resources :posts, :member => { :quote => :get }</pre>
The extra argument of :member indicates a hash of any further actions and their request methods you would like to be added onto singular posts. You can call these like all the other singular methods: quote_post_path(@post), for example. The request methods can be in string or symbol format, it doesn't matter.
<pre lang="rails">def quote
  @old_post = Post.find(params[:id])
  @post = Post.new
  @post.text = "[quote='#{@old_post.user}']#{<wbr></wbr>@old_post.text}[/quote]"
  render :action => "new"
end</pre>
Here I've defined the old post only to get the text and the user's name from it, and then we're rendering the new view so we have the form. Everything from there on is taken care by Rails.

Now what if you want to define a new action to work with a group of posts? Well you define it like this:
<strong>routes.rb</strong>
<pre lang="rails">map.resources :posts, :member => { :quote => :get }, :collection => { :destroy_all => :delete }</pre>
Now if you wanted to destroy all posts for a topic, bar the first one, with an action like this (remembering @topic is defined in get_topic):
<strong>posts_controller.rb</strong>
<pre lang="rails">def destroy_all
  @posts = @topic.posts  - @topic.posts.first
  @posts.each { |post| post.destroy }
  flash[:notice] = "All posts have been deleted.
end</pre>
You would link_to it like this:
<pre lang="rails">
<%= link_to "Delete all posts", destroy_all_topic_posts_path(@topic), :method => "delete", 
:confirm => "Are you sure you want to delete all posts from this topic?" %></pre>
The :method => "delete" corresponds with the :delete_all => :delete we 
specified in config/routes.rb.

One last thing is nested <span class='term'>form_for</span>s. Say you want to edit a post within a topic. To do this you would use this code:

<pre lang='rails'>
<% form_for [@topic, @post] do |f| %>
  <%= render :partial => "form", :locals => { :f => f } %>
  <%= submit_tag "Update" %>
<% end %>
</pre>

Here you pass one argument still to <span class='term'>form_for</span>, an array. It passes the array and will give you a url like <span class='term'>/topics/1/posts/1</span> if you were editing an existing post, or <span class='term'>/topics/1/posts</span> if you were creating a new post.
