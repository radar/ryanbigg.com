---
wordpress_id: RB-1544654456
layout: post
title: Polymorphic Routes
---

Really early on in Rails, you would write routes like this:

```ruby
redirect_to :controller => "posts", :action => "show", :id => @post.id
```

What this would do is dutifully redirect to the `show` action inside the `PostsController` and pass along the `id` parameter with a
value of whatever `@post.id` returns. Typical 302 response.

Then Rails 1.2 came along and allowed you to use routing helpers, like this:

```ruby
redirect_to post_path(@post)
```

And the people rejoiced.

This would do effectively the same thing. `post_path` here would build a route using the `@post` object that would look something
like `/posts/1` and then `redirect_to` would send back a 302 response to that route and the browser would follow it.

Then later versions (I can't remember which one), allowed syntax like this:

```ruby
redirect_to @post
```

And the people rejoiced a second time.

### Magic, but not really

> Any sufficiently advanced technology is indistinguishable from magic.

While this seems like magic, it's not. What this is doing is actually very, very neat. The `redirect_to` method, much like its cousins `link_to` and `form_for` all use a common method to build URLs, called `url_for`. The `url_for` method takes many different varieties of objects, such as strings, hashes or even instances of models, like in the example above and then uses whatever's input to build a URL. `url_for` does this in conjunction with another method called `polymorphic_url` too.

Let's look at what `redirect_to`, `url_for` and `polymorphic_url` does with these objects. In the case of the `redirect_to @post` call above, it inspects the `@post`
object, sees that it is an object of the `Post` class (we assume, anyway) and checks to see if that object has been persisted in a
database somewhere by calling `persisted?` on it.

By "persisted", I mean that a Ruby object has a matching record in the database somewhere. The `persisted?` method in Active Record is implemented like this:

```ruby
def persisted?
  !(new_record? || destroyed?)
end
```

If the object wasn't created through a call such as `Model.new` then it won't be a new record, and if it hasn't had the `destroy` method called on it won't be
destroyed either. If both of these cases are true, then that makes the object has most likely been _persisted_ to the database in the form of a record.

If it has been persisted, then `url_for` knows that this object can be found
somewhere, and that the place it can be found is most likely under a method called `post_path`. It infers the "post" part of this method from the name of the model: `Post`. Rails then calls this method, and passes in whatever `to_param` on the model returns. By default, `to_param` is configured to return the `id`, but you can override this method in your model to return something else, like a permalink instead:

```ruby
def to_param
  permalink
end
```

If you were to do this override, your URLs would look like `/posts/polymorphic-routes` instead of `/posts/1`. Pretty useful if you want human-friendly routes! Keeping in mind of course that you would need to update your controller to find by permalinks rather than IDs too:

```
def show
  Post = Post.find_by(permalink: params[:id])
end
```

In short, Rails is effectively building a method call like this:

```ruby
#{@post.class.downcase}_path(@post.to_param)
```

Which comes out to being this by default:

```ruby
post_path(1)
```

And when that method is called you would get this little string:

    "/posts/1"

Or if you overrode `to_param`, you would see `/posts/your-permalink-goes-here` instead.

Lovely!

This is called _polymorphic routing_. You can pass an object to methods like `redirect_to`, `link_to`, `form_for` and `form_with` and Rails will
attempt to work out the correct URL of what to use.

### The form of form_form

Now, when you're coding Rails you may have used `form_for` like this a very long time ago:

```erb
<% form_for @post, :url => { :controller => "posts", :action => "create" } do |f| %>
```

Of course, with advancements in Rails you could simplify it to this:

```erb
<% form_for @post, :url => posts_path do |f| %>
```

Because the form is going to default to having a `POST` HTTP method and therefore a request to `posts_path` is going to go to the
`create` action of `PostsController`, rather than the `index` action, which is what would result if it were a `GET` request.

But why stop there? Why not just write this?

```erb
<%= form_for @post do |f| %>
```

Personally, I see no reason not to... if it's something as simple as this. The `form_for` method uses `url_for` underneath, just like
`redirect_to` to work out where the form should go. It knows that the `@post` object is of the `Post` class (again, we assume) and it
checks to see if the object is persisted. If it is, then it will use `post_path(@post)`. If it's not, then `posts_path`.

The `form_for` method itself checks to see if the object passed in is persisted also, and if it is then it'll default to a `PUT` HTTP
method, otherwise a `POST`.

So this is how `form_for` can be flexible enough to have an identical syntax on both a `new` and `edit` view. It's becoming more and
more common these days for people to even put their whole `form_for` tags into a single partial and include it in both the `new` and
`edit` pages.

### A more complex form

So `form_for` is fairly simple for when you pass a normal object, but what happens if you pass an array of objects? Like this, for
instance:

```erb
<%= form_for [@post, @comment] do |f| %>
```

Well, both `url_for` and `form_for` have you covered there too.

The `url_for` method detects that this is an array and separates out each part and inspects them individually. First, what is this
`@post` thing? Well, in this case let's assume it's a `Post` instance that _is_ persisted and has the id of 1. Second, what is this
`@comment` object? It's a `Comment` instance that has not yet been persisted to the database.

What `url_for` will do here is build up the URL helper method piece by piece by placing each part in an array, joining it into a routing method and then calling that routing method with the necessary arguments.

First, it knows that the `@post` object is of the `Post` class and is persisted, therefore the URL helper will begin with `post`. Second, it knows that the `@comment` object is of the `Comment` class and is _not_ persisted, and therefore `comments` will follow `post` in the URL helper build. The parts that `url_for` now knows about are `[:post, :comments]`.

The `url_for` method combines these individual parts with an underscore, so that it becomes `post_comments` and then appends `_path`
to the end of that, resulting in `post_comments_path`. Then it passes in just the persisted objects to the call to that method, resulting in a call like this:

    post_comments_path(@post)

Calling that method results in this:

    "/posts/1/comments"

Best part? `form_for` will still know to use `POST` if the `@comment` object is not a persisted object, and `PUT` if it is. A good
thing to remember is that the `form_for` is always for the _last_ object specified in the array. The objects prior to it are just its
nesting, nothing more.

The more objects that are added, the more times `url_for` will do the hard yards and build the path out... although I recommend that
you keep it to just two parts.

### A symbolic form

Now that we've covered using an array containing objects for `form_for`, let's take a look at another common use. An array containing
at least one Symbol object, like this:

```erb
<%= form_for [:admin, @post, @comment] do |f| %>
```

What the `url_for` method does here is very simple. It sees that there's a `Symbol` and takes it as it is. The first part of the
`url` will simply be the same as the symbol: `admin`. The URL that `url_for` knows of at this point is just `[:admin]`.

Then `url_for` goes through the remaining parts of the array. In this case, let's assume both `@post` and `@comment` are persisted
and that they have the ids of 1 and 2 respectively. Same classes as before. `url_for` then adds `post` to the URL that it's building,
and `comment` too, resulting in `[:admin, :post, :comment]`.

Then the joining happens, resulting in a method of `admin_post_comment_path`, and because both `@post` and `@comment` are persisted here,
they're passed in, resulting in this method call:

```ruby
admin_post_comment_path(@post, @comment)
```

Which (usually) turns into this path:

    /admin/posts/1/comments/2

### Testing routes in the Rails console

Rails provides a way to test out these routes in the `rails console`, through its `app` helper.

If we want to test out our `post_path` helper, we can do it with this call in the `rails console`:

```ruby
app.post_path(1)
# => /posts/1
```

If we wanted to test out something more complex, like what `redirect_to @post` might return, we can invoke `url_for`:

```ruby
post = Post.first
app.url_for(post)
# => /posts/1
```

This will also work with an array of objects:

```ruby
post = Post.first
comment = post.comments.first
app.url_for([post, comment])
# => /posts/1/comments/2
```

And also if we use the array with a symbol inside it:

```ruby
post = Post.first
comment = post.comments.first
app.url_for([:admin, post, comment])
# => /admin/posts/1/comments/2
```

### Working with weirdly named routes

If you have routes that do not match their model names within the application, then you're going to run into trouble with `url_for` and friends.

Let's imagine you've got routes like this:

```ruby
resources :posts, as: :articles
```

You will not be able to use things like:

```ruby
link_to @post.title, @post
```

Or:

```ruby
redirect_to @post
```

This is because the routing helper that we will need for this is called `article_path`, and not `post_path`. The inferrence of the route from the model name will break in this particular usage of `link_to`.

If you are unable to change the routes themselves to correct this difference, the way around it is to use a different syntax. This one:

```ruby
link_to @post.title, [:article, id: @post.id]
```

We can test this in our console too by using `app.url_for` again:

```ruby
post = Post.first
app.url_for([:article, id: post.id])
```

The way this work is that it sees that the first element is a symbol called `:article`, and so it infers that the start of the routing helper is `article_`. Then, given that there's no more symbols, it builds a routing helper called `article_url`. The final element of the array is then passed as an argument to this method, finishing up as this method call:

```ruby
article_url(id: post.id)
```

### Conclusion

You can use the array form of polymorphic routing with the `redirect_to`, `link_to`, `form_for` and `form_with` methods. There's probably other
methods that I'm not remembering right now that can do it too... it's generally anything in Rails that would normally take a URL.

There's no need to build your URLs in any Rails version greater-than 2 using hashes; that's pretty old school. If you see cases like this in your applications, attempt a refactoring!

Experiment with your new knowledge of polymorphic routing and use it to the best of your advantage.
