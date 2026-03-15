---
wordpress_id: RB-1773605910
layout: post
title: From Heroku to Render
---

After [the announcement that Heroku is entering maintenance mode](https://www.heroku.com/blog/an-update-on-heroku/), I got wary of the one (1) application I host on there going down. It's a Rails app for photos for my kid, which has almost 2,500 photos of her since before she was born until the modern day. I created the app to share these photos with my family back in Adelaide.

I was also listening to [this Remote Ruby episode](https://www.remoteruby.com/2260490/episodes/18827088-heroku-hosting-and-the-ai-era) Saturday morning that convinced me to go looking abroad too.

For a Rails app that's nearing ten years old (for a kid that's nearing ten years old), it holds up pretty well. This weekend-gone I bumped the Ruby and Rails versions to modern ones without much fuss. The biggest thing in that upgrade was moving off Webpacker and switching to ESBuild, just as that's my personal preference now. And I brought in Propshaft over Sprockets. That's all just for the sprinkles of React + Sass I have in this application.

That done, I went and tried to sign up to [Fly](https://fly.io) and got some errors saying my attempt had "Validation errors" but it wasn't clear what that meant. Then I got into the dashboard and attempted to setup an app, and got confused on the instructions for connecting a Rails app to either Fly's managed or unmanaged PostgreSQL. This was _after_ I dockerised the application based on Fly's advice.

That's the thing about Heroku: I didn't have to care about dockerising or what PostgreSQL I was using. I could `git push` and Heroku would handle the rest of the setup.

After Fly gave me the irrits on Saturday, I started afresh on Sunday with a go of [Render](https://render.com). Sign up succeeded without validation errors (big tick) and after pushing my now-Dockerised app over to GitHub's private container registry, I was able to deploy the app to Render easily.

Next up was the database setup which is its own separate service under the same project. That was a few button presses away. Switching back over to the app to add a `DATABASE_URL` environment variable I was pleasantly surprised to see a "Datastore URL" as an option in the environment variable screen. This set up the database URL correctly first try without me having to copy each part (username, password, dbname) over one by one.

Then it was only a matter of dumping the database from Heroku with `heroku pg:backups` incantations, and then restoring it into Render with a straight `pg_restore`, and then the app was fully deployed.

DNS cutover was straightforward too. I took out the Heroku entries, pointed them to Render's load balancer and setup a Custom Domain for the app. I removed the SSL certificates from the Heroku app. It took about half an hour for the app to switch over properly.

I'm sure I'm only just touching the edges of what Render can provide, with nothing in this app needing things like autoscaling, one-off jobs, etc.

This is breath of fresh air compared to my day job where it's Terraform-this and AWS-that. Being able to deploy an application with a few straightforward button presses in a UI felt like magic. The AWS UI designers sure could learn a lot from the Render team.
