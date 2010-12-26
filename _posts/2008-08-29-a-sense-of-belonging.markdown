--- 
wordpress_id: 211
layout: post
title: A Sense of Belonging
wordpress_url: http://frozenplague.net/?p=211
---
Numerous times I've needed and I've seen other people have needed the need to check whether an object belongs to the currently logged in user. I've worked out that something like this works:
<pre lang="rails">class User < ActiveRecord::Base
  has_many :posts
  def owns?(object)
    object.user == self
  end
end</pre>
This works when you have a currently logged in user and call it by using <span class="term">current_user.owns?(@post)</span>. Now what if you wanted to do it the other way around? Well it's really as simple as this:
<pre lang="rails">class Post < ActiveRecord::Base
  belongs_to :user
  def belongs_to?(other_user)
    user == other_user
  end
end</pre>
Now you can reference that through <span class="term">@post.belongs_to?(other_user)</span>.

If you wanted to use either of these in the controller, it would be like this:
<pre lang="rails">class PostsController < ApplicationController
  def edit
    @post = Post.find(params[:id])
    check_ownership
  end

  def update
    @post = Post.find(params[:id])
    if current_user.owns?(@post) # or @post.belongs_to?(current_user)
    # carry on...
      if @post.update_attributes(params[:post])
        flash[:success] = "Post updated!"
        redirect_to topic_path(@topic)
      else
        flash[:error] = "Post could not be updated."
        render :action => "edit"
      end
    else
      flash[:error] = "You do not own that post."
    end
  end

  private
    def check_ownership
      if !current_user.owns?(@post) # or @post.belongs_to?(current_user)
        flash[:error] = "You do not own that post!"
        redirect_back_or_default topic_path(@topic)
      end
    end
end</pre>
Now here we've called <span class="term">check_ownership</span> in the edit action which will stop the template from being rendered by calling <span class="term">redirect_back_or_default</span>. We can't call (as I found out thanks to Blue_Sea) <span class="term">check_ownership</span> in the same way in the update action because the code will still be executed. So we must call the methods we defined in the model, either <span class="term">current_user.owns?(@post)</span> or <span class="term">@post.belongs_to?(current_user)</span>.
