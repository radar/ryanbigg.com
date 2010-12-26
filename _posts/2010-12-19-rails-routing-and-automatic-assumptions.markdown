--- 
wordpress_id: 1204
layout: post
title: Rails routing and automatic assumptions
wordpress_url: http://ryanbigg.com/?p=1204
---
Last night while working on chapter 12 for <a href='http://manning.com/katz'>Rails 3 in Action</a> I stumbled across an interesting problem detailed in <a href="https://gist.github.com/746414">this gist</a>. The problem I was seeing is that the `edit_admin_user_path` route <em>was not</em> failing, while the `admin_user_permissions_path` path <em>was</em> failing.

I had my suspicions to why the first link worked and spent the remainder of last night digging through my favourite bit of Rails and Rails related source(ry): Action Dispatch and rack-mount. I didn't figure it all completely out until after a good night's sleep. It wasn't until I saw pixeltrix's comment on the Gist this morning that it all clicked. 

I knew from a while ago that sometimes Rails will just *know* what to put as the `:id` part of a route and I never did bother questioning how that part of Rails works until last night. It turns out that Action Dispatch (and by extension, rack-mount) are very intelligent in the way that they build routes. Take the `edit_admin_user_path` route for example. This requires two parameters: `:account_id` and `:id`, representing an account and user object respectively. The routing code doesn't *care* what arguments are passed in here, only the order of them. All it does is call `to_param` on the objects to extract the segments for the routes. So when you do this:

<pre>
   edit_admin_user_path(@user)
</pre>

But the order of the parameters in the URL are `:account_id` and then `:id`, Rails will assume that the first object is meant for the `:account_id` parameter. How does it work out the `:id` parameter then? It's not passed into the helper, so instead it's gathered from the current request's parameters. Therefore, this helper generates a URL such as `/2/users/2/edit` inadvertently. We can change this to be simply:

<pre>
   edit_admin_user_path
</pre>

Then Rails will assume that we want the current `:account_id` and `:id` from the current request, making our code much shorter, compared to what we'd have to do if this feature didn't exist:

<pre>
  edit_admin_user_path(@account, @user)
</pre>

The `admin_user_permissions_path(@user)` helper throws an error because it expects to receive both a `:account_id` and `:user_id` parameter. Without the `:user_id` parameter available or passed in to the helper, rack-mount won't know how to generate this URL and will raise a "No route matches" error.

Oh, and I also <a href='http://twitter.com/ryanbigg/status/16104049640210432'>offered a free copy of Rails 3 in Action</a> to the person who helped me solve this issue, but it was really a team effort. alindeman, pixeltrix and pacsoe all get free, signed dead-tree copies when the book's done. Thanks lads.
