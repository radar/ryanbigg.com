--- 
wordpress_id: 1186
layout: post
title: Commit it, or else!
wordpress_url: http://ryanbigg.com/?p=1186
---
I've seen the same question pop up a couple of times now:

<blockquote>
  Should I commit the Gemfile.lock file that Bundler generates?
</blockquote>

Yes. Do it. Do it now if you haven't already.

Another common question is:

<blockquote>
  I always get conflicts in my db/schema.rb file, why should I commit that?
</blockquote>

This post answers both.

<h3>"Why should I commit Gemfile.lock?"</h3>

When you run `bundle install` in your project, Bundler will download and install all the gems and their dependencies and their dependencies' dependencies (and so on) and then create a `Gemfile.lock` file based on what it installed.

This file is incredibly important because it lists all the precise versions of everything that your project uses at that point in time. Of course, it's up to you to ensure that the project is actually working at this point... something that you should be doing before you commit the `Gemfile` **and** the `Gemfile.lock` files. Whenever somebody else clones this project (say, in a couple of days after your setup) and runs `bundle install`, they will get the <strong>exact same</strong> versions of the gems. Without `Gemfile.lock`, dependencies will be re-resolved and versions could have been updated during that time. This can lead to undesired outcomes.

Commit it, or else.

<h3>"Why should I commit schema.rb?</h3>

The `db/schema.rb` file in Rails plays a very similar role to that of the `Gemfile.lock`. Its purpose is to provide the schema for the database at the absolute latest point. This allows everybody who's working on the project --  regardless of what time they enter the project -- to run `rake db:schema:load` to get the absolute latest schema.

Now note here that I **don't** recommend running `rake db:migrate` to get the latest database schema. There's a couple of reasons why people may think this is a good idea, but let me tell you right now: it isn't. If you're getting started on a project, use `rake db:schema:load` to get set up (after, of course, setting up the database).

`rake db:migrate` will run _every single damn migration_ in your project, creating tables in one "step" and then destroying them in a future step. This is an utter waste of time. `db/schema.rb` has the final outcome of it already there for you.

Also, if you're using `rake db:migrate` to insert data into your database: don't. Use `db/seeds.rb` for that. 

On a similar train of thought: if you're using migrations to execute queries that you can't do using Rails helpers, perhaps that's not such a good idea either. Think about it: the only way you're going to be able to run those again on another machine is by running all the migrations again, which we've just established is a Terrible Idea. What may be less of a Terrible Idea is to have an alternative Rake task such as a `db:setup` script which runs `db:schema:load` and then executes those specific queries. Yes, it's more files to maintain, but this would stop you from having to run **all** the migrations to get those specific queries to re-run. Migrations shouldn't be used to do this kind of low-level activity; it just simply doesn't fit.

As for the conflicts in `db/schema.rb`? You're a programmer for crying out loud. Suck it up and deal with it. Or <a href='http://tbaggery.com/2010/10/24/reduce-your-rails-schema-conflicts.html'>code up a solution</a>, at least.
