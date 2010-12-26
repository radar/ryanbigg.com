--- 
wordpress_id: 200
layout: post
title: Rescue Correctly!
wordpress_url: http://frozenplague.net/?p=200
---
Too many times I've seen people being over-zealous in rescuing their exceptions. They try doing something like this:

<pre lang='rails'>
def show
  @forum = Forum.find(params[:id])
  rescue Exception
   flash[:notice] = 'The forum you were looking for does not exist'
end
</pre>

Which will work when it can't find a forum, and also when you have a typo. Exception the ancestor class of all other exceptions, and so every exception will trigger this rescue. Try making the code look like this:

<pre lang='rails'>
def show
  @forum = Forum.find(params[:id)
  rescue Exception
    flash[:notice] = 'The forum you were looking for does not exist'
end
</pre>

and you'll wonder why a forum is telling you it doesn't exist when it obviously does! The easiest way to fix this is to rescue correctly. By rescuing correctly, you prevent hours of potential headaches and your code becomes clearer to what it's doing. In this example, when a forum object can't be found it will raise the <span class="term">ActiveRecord::RecordNotFound</span> exception, so this is what you should rescue.

<pre lang='rails'>
def show
  @forum = Forum.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    flash[:notice] = 'The forum you were looking for does not exist'
end
</pre>

Another situation is when you're using <span class="term">#save!</span>. This "destructive" version of <span class="term">#save</span> will raise an <span class="term">ActiveRecord::RecordInvalid</span> or <span class="term">ActiveRecord::RecordNotSaved</span>, depending on the kind of validations you have on your model. I use it here in this example:

<pre lang='rails'>
def create
  @topic = @forum.topics.build(params[:topic])
  @post = @topic.posts.build(params[:post])
  @topic.save!
  flash[:notice] = 'Topic has been successfully created'
  rescue ActiveRecord::RecordNotSaved, ActiveRecord::RecordInvalid
    flash[:notice] = 'Topic could not be created'
  ensure
    redirect_to forum_topics_path(@forum)
end
</pre>

I've actually specified two arguments to the rescue method here, the first is <span class="term">ActiveRecord::RecordNotSaved</span>, and the next is <span class="term">ActiveRecord::RecordInvalid</span>. The rescue method uses the splat operator (*), so it can take as many arguments as you can throw at it. I've also used another method here <span class="term">ensure</span>. No matter how many exceptions get thrown, the code after the ensure statement will always be ran.

The final thing I would like to cover is rescuing two exceptions, but doing two different things.

<pre lang='rails'>
def create
  @topic = @forum.topics.build(params[:topic])
  @post = @topic.posts.build(params[:post])
  @topic.save!
  flash[:notice] = 'Topic has been successfully created'
  rescue ActiveRecord::RecordNotSaved
    flash[:notice] = 'Topic could not be created, the record could not be saved'
  rescue ActiveRecord::RecordInvalid
    flash[:notice] = 'Topic could not be created, the record is invalid'
  ensure
    redirect_to forum_topics_path(@forum)
end
</pre>

