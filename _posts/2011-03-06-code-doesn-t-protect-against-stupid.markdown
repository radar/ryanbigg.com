--- 
wordpress_id: RB-301
layout: post
title: Code doesn't protect against stupid
---

Herein lies a tale of woe, heartache and eventual triumph over stupidity.

I've been developing <a href='http://github.com/radar/forem'>forum engine</a> for the past week or so as part of my research for the engines chapter on Rails 3 in Action. It's been an interesting experience.

This afternoon, I was contacted by Adam McDonald who's working with me on it as part of a learning exercise for him and free labour for myself. He asked questions about how to get the engine running so that he could see it and I told him to run `bundle exec rails s` and go to `http://localhost:3000/forem`. Only one of those two things worked. So I told him to instead just run the tests and I'd take a look at the issue later on, as I was completing Chapter 13 of the book.

So now (actually, just previous to this post) I remembered the issue and tried it myself. It was still broken! This was simply because we didn't have a `root` route defined in the routes file, like <a href='https://github.com/radar/forem/commit/f0d9f261d1ad4af2350c5c074b4767761f467070'>this commit adds</a>. So I added one.

Then I saw `uninitialized constant Forem::ForumsController`.

WHAT?! How *dare* code be broken on my watch! The tests passed, so this code had absolutely no reason to be broken. I thought it may have been because the engine wasn't loading the controllers in that special mode of `bundle exec rails s`. It turns out I was almost right.

So I got hacky and ended up doing a `require ENGINE_ROOT + "app/controllers/forem/forums_controller"` which just *didn't* work. I checked that `ENGINE_ROOT + "app/controllers/forem"` was indeed the right path by using `File.expand_path` and then copy+pasting it to the command line and `cd`'ing into the directory. That god damned file was there.

A moment of swearing took place where I ranted in IRC and to Adam about the lack of documentation on engines making things impossible.

Then when I calmed down, I went back into the console and saw this. 

![Only one l](https://img.skitch.com/20110306-dgugwhpaij8h38fjqifxbg42se.png)

The well-trained eye (not mine) would see quite immediately that `forums_controler.rb` is missing an l.

### So why did this work in the first place?

Oh my God. I was stunned. How could I be so stupid? I corrected it and sure enough the route worked. Major "oh durr" moment was had.

This has worked all this time because I've been running only the tests (`bundle exec rspec spec`, for the curious), which run in the `test` environment. This environment dutifully duplicates the `production` environment habit of loading all the files in `app/**/*`, regardless of the names. That way when requests are made to the application, it doesn't need to go looking for the files containing the right classes; everything should (and is) loaded by that point.

When I run `bundle exec rails s`, Rails starts up in `development` mode instead! When we make a request to a route, Rails will go looking for the proper controller (in this case, `app/controllers/forem/forums_controller.rb`, with TWO l's) and if it can't find it then it will scream at you, claiming that you treated it wrong.

Well, that was a fun experience. I don't think I'll ever do that again and I'll be checking the dark corners of my applications for this little furry beast.