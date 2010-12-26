--- 
wordpress_id: 946
layout: post
title: Classes are cached in the test environment
wordpress_url: http://ryanbigg.com/?p=946
---
I <a href='http://ryanbigg.com/2010/05/rails-3-book-week-3/'>mentioned yesterday</a> that I was saving juicy topics for the book I'm writing, but this is just one that's too good to miss from posting here too. Consider it (and the posts before it) a sample. The book is in a very similar vein.

Today we were working on our application at work which we refer to as three-point-oh. In three-point-oh, there were some features that were broken unrelated to the work we were currently doing on the `donations` branch which we had just merged into `master`. It was one of those issues where you could run the features that were breaking by themselves and they'd work just fine. 

You know the type.

In our system we have an `ActivityObserver` which creates an `Activity` record every time someone performs any kind of CRUD action upon any observed class in our system. The catch is that `User.current_user` must be set for an activity record to be created, otherwise there's no record of CRUD. 

One of the observed classes was `Contact`. One of our features runs the `db:seed` task for its own setup (the very first line of the Background) and in this we set up a `Contact` record for the scenarios. Of course by it being the first line, we're not going to have a currently logged in user, and therefore an `Activity` record is not going to be created.

But what happens if we run another scenario where we log in? Well, then `User.current_user` will be set to that user whom we log in with. Then, of course, Cucumber will perform its dutiful task once the scenario has finished running and clear the database, thereby eradicating all records, including the one that `User.current_user` is set to . What Cucumber does (and should) not do is destroy objects. When we ran the features in a group, if any of those features were logging in they would be setting `User.current_user`, then of course that related record would be being wiped when the scenario completed.

Then came the seeding feature. This is the feature that runs the `db:seed` task for itself and because `User.current_user` was set in a prior ran feature, it was creating `Activity` records for users that no longer exist. When the app then went to display these activities on the homepage, it would attempt access the `avatar` method on a user that no longer existed, thus giving us an `undefined method avatar for nil:NilClass`. 

This was because between requests in test mode, <strong>classes are not reloaded</strong>. Therefore, `User.current_user` would not be unset. To unset it, we specify this in a file located at _features/support/start.rb_:

    Before do
      User.current_user = nil
    end

We could probably also use foreign key constraints to ensure that when we create an activity record that the user record we're creating it for exists, but that's information probably best kept for the book or another blog post.



