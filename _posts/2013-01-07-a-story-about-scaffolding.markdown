--- 
wordpress_id: RB-338
layout: post
title: A story about scaffolding
---

When Rails was released, one of the "showy" features in it was the ability to get up and running quickly. That's always been the focus for Rails.

One of the things that allowed you to get up and running so quickly was the scaffold feature of Rails. You would run `rails generate scaffold posts` and there you would then have a scaffold for posts that would allow you to perform CRUD (Create, Read, Update and Destroy) actions on these posts. Back in Rails 1 days, it was a simple one line in your controller: `scaffold`. In later Rails releases (can't remember right now which one specifically), this was changed to generating the familiar scaffold controllers you see today that provide a HTML and XML response, or even more recently, a HTML and JSON response.

Scaffolding is great for getting something that will allow you to perform those CRUD actions on it. However, the moment you need to step outside that safe cocoon, you run into trouble. You want to add a new field to your database, say an author field if we're sticking with the Post scaffold idea. So you do that, but then you don't realise that you need to add the field to the `attr_accessible` list[^1] (which you had no idea about until someone told you about it in the Rails channel), and you'd need to add it to the form partial as well. Newbies don't learn how to do these very, very basic things first off *if they're using scaffolding* and that's why it's a bad thing.

If you begin using scaffolding, you can indeed see exactly what functionality Rails is capable of. Goodo, you can create, read, update and delete things. The problem, however, is that you end up not learning how any of it works, and it seems like "a wizard did it". Of course, as you get more knowledgeable about Rails you'll know that there's no such thing as wizards.

Learning from the ground up that in order to be able to display even a list of posts on a page that you need a `Post` model, that the model responds to an `all` method, that is then called in a thing called `PostsController` and then that information is stored in an instance variable which is then accessed by this thing called a "view" which has the same name as your action... that may seem like hard work at first (hint: it is), but it's worth it. That is because the moment you want to step outside the cocoon of a CRUD resource and do something differently, you'll probably know how to. 

Scaffolding doesn't teach you the extreme basics of Rails development. Building things from scratch does. This foundation is absolutely critical to understanding how Rails works.

[^1]: `attr_accessible` is going away in Rails 4, being replaced by https://github.com/rails/strong_parameters
