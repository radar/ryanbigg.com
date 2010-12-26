--- 
wordpress_id: 143
layout: post
title: Administration Namespacing
wordpress_url: http://frozenplague.net/2008/03/16/administration-namespacing/
---
A while after completing work at SeaLink, Tom asked me about my forum hobby project and why it wasn't working. This led to me working on it for a few days and getting it all up to scratch again, and this involved moving it over to Rails 2.0 (that's how long I hadn't worked on it for), and using the awesomeness that is namespacing.

Namespacing is where you have some controllers in a separate area of your site. In my example, I have an admin folder in <span class="term">app/controllers</span> which contains all the controllers for the administration section of my site, and all the relevant actions. Just inside the <span class="term">app/controllers</span> directory, I have the other controllers which do all the basic stuff such as showing forums, basically anything a standard user can do.

It seems to be a fairly common question asked in places, so I figured if I sat down and wrote this, I would have something to send to people, much like my <a href="http://frozenplague.net/2008/01/06/restful-routing-an-overview/">Restful Routes tutorial</a>, which ideally should've covered namespacing too.

First of all we're going to create our namespace. To do that, we open up <span class="term">config/routes.rb</span> and specify our namespace:
<pre lang="rails">map.namespace(:admin) do |admin|
admin.resources :forums, :topics, :posts
end</pre>
Now what this does is defines some routes for us. If you've seen <span class="term">map.resources</span> you'll know that this defines routes for us, for example doing map.resources :forums will define methods such as <span class="term">forums_path</span> which is the same as <span class="term">{ :controller => "forums", :action => "index" }</span> and <span class="term">forum_path(@forum) </span>which is the same as <span class="term">{ :controller => "forums", :action => "show", :id => @forum.id }</span>. These methods really are lifesavers and save you a hell of a lot of typing. The routes defined by this namespace method however are prefixed with whatever argument you pass it, in this case we've passed it <span class="term">:admin</span> so it's going to give us routes like <span class="term">admin_forums_path</span>, which is the same as <span class="term">{ :controller = > "admin/forums", :action => "index" }, </span>and as you can see again saves us a lot of typing.

Now that we have our namespace, we can create our subfolders. These subfolders are placed in <span class="term">app/controllers </span>and <span class="term">app/views </span>and are given the same name as the namespace, admin. So go ahead and do that now. In <span class="term">app/controllers/admin </span>is where we place our controllers. As an example, here's what my forums controller's edit and update actions look like:
<pre lang="rails">class Admin::ForumsController < Admin::ApplicationController
  before_filter :store_location, :only => [:index, :show]
  def edit
    @forum = Forum.find(params[:id]) 
    @forums = Forum.find(:all, :order => "title") - [@forum] - @forum.descendants
  end

  def update 
    @forum = Forum.find(params[:id])
    if @forum.update_attributes(params[:forum])
      flash[:notice] = "Forum has been updated."
      redirect
    else
      flash[:notice] = "Forum has not been updated."
      render :action => "edit"
    end
  end
end</pre>
What I really want to show you in here is only the first line the class is defined as Admin::ForumsController, which shows that we're namespacing it. We don't have to define the Admin prefix anywhere. What we do have to define however is our non-existant Admin::ApplicationController. In my code, I've defined my own Admin::ApplicationController as a means of calling methods that should be called before all admin actions, such as my <span class="term">non_admin_redirect</span> method, which is defined in <span class="term">lib/authenticated_system.rb</span> and goes something like this:
<pre lang="rails">  def non_admin_redirect
    if !is_admin?
      flash[:notice] = "You need to be an admin to do that."
      redirect_back_or_default(:controller => "/accounts", :action => "login")
    end
  end</pre>
To define your <span class="term">Admin::ApplicationController</span>, make a file in <span class="term">app/controllers/admin</span> called <span class="term">application_controller.rb</span>. Even though the main application controller is defined as <span class="term">application.rb</span> in <span class="term">app/controllers</span>, that file is automatically loaded by Rails. If we named our application_controller to just application.rb, it would not be automatically loaded because Rails only looks for application.rb and files ending in _controller.rb in the app/controllers directory, so we name ours application_controller.rb so it plays nice with Rails.

In here we define our class, layout and helper:
<pre lang="rails">class Admin::ApplicationController < ApplicationController
  layout "admin"
  helper "admin"
  before_filter :non_admin_redirect
end</pre>
I've defined a new layout here because my admin layout is different to my main layout, but still includes some elements from it (thanks to nested_layouts)

The before_filter is triggered before every action in the admin controller to make sure it's an admin doing the action rather than a standard user.

And that's all there is to it, really. It's all pretty simple. Now all you've gotta do is generate your views. Remember to place them in app/views/admin/the_controller's_name, otherwise you'll run into problems.

It seems I forgot to mention how it's supposed to work when you're calling the method to go to the namespaced path, well that's simple.  If you have a forum you would like to edit, the correct method is <span class="term">edit_admin_forum_path(forum_object)</span>, because you want to edit, in the namespace of admin, a certain forum. For paths not requiring a prefix, such as the show and index actions, they are <span class="term">admin_forum_path(forum_object)</span> and admin_forums_path respectively.

For an action such as an update action, it would be <span class="term">admin_forum_path(forum_object)</span> with a <span class="term">:method => :put</span> option specified in whatever you're using. Usually you won't have to do this, because the form_for helper would do it for you, but in some cases you might have to.
