---
wordpress_id: RB-296
layout: post
title: "Rails 3 in Action: SaaS"
---

I've been writing the 12th chapter for Rails 3 in Action for about a month now. It's been a tough process because I haven't felt sold on the idea or the "flow" of the chapter since I begun writing it. It's a chapter about Software as a Service (SaaS), mainly covering letting users sign up for an account on a monthly subscription that has different limits depending on the plans they picked. My main thought has been "What does this have to do with Rails 3?". Sure, there's some elements of it such as using the `scope` method in routes to change the URLs from `/projects/1/tickets/2` to `/[account_name]/projects/1/tickets/2`, (which by the way I hear the [API's got a pretty good example of](http://api.rubyonrails.org/classes/ActionDispatch/Routing/Mapper/Scoping.html#method-i-scope)) but as for introducing new features, it's a pretty barren chapter.

Plus, it's long. Simply implementing that scope breaks a whole bunch of functionality in the application and the chapter (in its current form) goes through covering how to fix that up. Most of it is the same two fixes. Not all that terribly exciting. I had planned to put the fixing-everything-up into one chapter (12) and then the actual SaaS stuff into the next chapter (13). However, tonight the fixing-everything-up chapter has gotten too long and it just feels tedious writing it.

That's not what I want a chapter of Rails 3 in Action to feel like. It should be showing you features of Rails 3 that will help you along in your daily life. It should be exciting, not the same landscape for section after section after section. SaaS, to me, just doesn't seem to fit in the book, but that isn't to say that I'm scrapping my work entirely on this.

I will be taking the SaaS stuff out of Rails 3 in Action to reduce page count and I will complete it and release it as a separate guide when the book is complete. This wouldn't be such a pain if refactoring a Rails application to have all its routes under a scope was so difficult.

I'm sorry to anybody who expected the final release to contain the SaaS chapter, but I think it's best if we let that one simmer for the time whilst we cook up something more exciting, such as how to write an API.

Thanks for reading the book so far, I really hope you've enjoyed it. If you've got any qualms or queries, you can reach me through [email](mailto:radarlistener@gmail.com), [twitter](http://twitter.com/ryanbigg) or GTalk at radarlistener@gmail.com.

I've put a Chapter 12 related question [on Stack Overflow](http://stackoverflow.com/questions/4613996/implementing-account-scoping) that somebody may know the answer to. It's to do with the routing helpers, which was the main headache with this chapter.