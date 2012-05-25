---
wordpress_id: 32
layout: post
title: Testing and Migrations
wordpress_url: http://frozenplague.net/?p=32
---
So I begun a new, very awesome job on Monday. I would say the job trumps anything Coles has to offer and here's some of the reasons:

1. Chairs (something that Coles really needs), comfortable ones too
2. Wide-screens
3. Lack of green bags
4. Great people with equally great knowledge about everything Rails
and of course,
5. Doing something I truly love

[font:size=4]Testing[/font]
Before starting the new job, I had some knowledge of Ruby and Rails, but since then I think it's expanded a bit. For example, I now know how to test. Say I want to make sure that it returns an error if the blog's subject is blank, and assuming I've set up the model correctly.

[code]
require File.dirname(__FILE__) + '/../test_helper'
class BlogTest < Test::Unit::TestCase
def test_validation
assert !Blog.new(:description => "Here's a description", :text => "And here's some text, but uh oh...").save
end
end
[/code]
Basically it says make sure that when I create a new blog using the fields and data provided that it errors. If it errors then it will pass the test. Testing is much more complex than that, especially when you get to the controller testing.

In this example we assume there's already two blogs in the table, which is default for fixtures. We also assume that the blog controller's action "create" is protected by the acts_as_authenticated method of logged_in, which requires session[:user] to be something other than false!

[code]
require File.dirname(__FILE__) + '/../test_helper'
#believe it or not, this line actually includes the blog controller (app/controllers/blog_controller.rb)!
require 'blog_controller'

class BlogController; def rescue_action(e) raise e end; end

class BlogControllerTest < Test::Unit::TestCase
  def setup
    @controller = ForumController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end
fixtures :blogs, :users
def test_posting
#posts to blog/create and specifies session[:user] = 1
post :create, { :blog => { :subject => "Alright, this should work.", :description => "At least, we hope so.", :text => "And we need text, don't forget text." }}, { :user => 1 }
assert_equal 3, Blog.count
end
end
[/code]

Again, that code should pass and everything should be OK. These can be so much more complicated, I'm just using basic examples to show why they are awesome.

Another feature of testing is the mocks, located in "yourapp/test/mocks" these allow you to create duplicates of the libraries that you would otherwise use in the application, but may want some of the methods to perform differently than what they do in the real version. For example today I used the following:

[code]
module AuthenticatedSystem
def logged_in?
return true
end
end
[/code]

So when the test runs it loads the mocked version of AuthenticatedSystem, and when the "logged_in?" method is called it uses the method defined in the mocked version instead of the one in the real version.

[font:size=4]Migrations[/font]

Another thing we covered was Migrations. Migrations let you keep track of the versions of your database, and therefore allow you to revert changes if you manage, and apparently you will manage, to stuff something up.

To generate a migration first of all you can run the "ruby script/generate migration <name>", where <name> is something logical, like create_tables. This will generate the first migration, or first version of your database. This file will be located at "db/migrate/001_<name>.rb", go on and open it up to see something like this:

[code]
class CreateTables < ActiveRecord::Migration
  def self.up
  end
  def self.down
  end
end
[/code]

Which we can flesh out to be something more like this:

[code]
class CreateTables < ActiveRecord::Migration
  def self.up
    create_table :blogs do |t|
add_column "subject", :string
add_column "description", :string
add_column "text", :text
add_column "created_at", :datetime
    end
create_table :comments do |t|
add_column "text", :text
add_column "user_id", :integer
add_column "created_at", :datetime
  end
create_table :users do |t|
add_column "login", :string
add_column "password", :string
end
end

  def self.down
    drop_table :blogs
    drop_table :comments
    drop_table :users
  end
end

[/code]

Alright, so I elaborated a bit that time. Basically, that should create a very skeletised version of a blog + comments + users database for a blog application. So, how do we get it into the database? Well, you could go into mysql and type something like...

CREATE TABLE `blogs` (
`id` INT(11)...
etc. etc etc.
)

Or you could just go into your terminal/prompt and type the beautiful command of:
[code]
rake db:migrate
[/code]

In a hassle-free instant your tables are in your database raring to go.

Now say that I forgot to put in the blog_id field for comments (which I intentionally did in the example), you need to create a new migration by performing "ruby script/generate migration <another_name>" where another_name can be whatever you please.

Again you'll see the familiar self.up and self.down methods if you open 002_<another_name>.rb which we'll alter to make it become:

[code]
class add_blogid < ActiveRecord::Migration
  def self.up
    add_column("comments","blog_id",:integer)
    end
  end

  def self.down
    remove_column("comments","blog_id",:integer)
  end
end
[/code]

After that we run "rake db:migrate" again in the terminal/prompt and we're now up to version 2 of our database. How do we know that? Look in db/schema.rb,

[code]
ActiveRecord::Schema.define(:version => 2)
[/code]

Now what if you stuff something up?

rake db:migrate VERSION=<version_number_you_want_to_revert_to>

So say you want version 2 because you obliterated the users table in version 3,

rake db:migrate VERSION=2

I would like to thank Anuj and Vishal for being exceptionally patient with me thus far.

-------

Aside:

A few years ago I did work experience at this place called "Berlin Wall Software Supermarket", and on my first day the owner (Rob) says to me "You shouldn't be here.", first impressions weren't all that excellent. He emphasised his jerk-ness by making me and my work experience buddy go through the whole store and make sure the stock was in alphabetical order. Then we were seperated because we were getting on too well. So I went to the other store.

There I worked with the owner's son, Jamie. First impressions were that he was a pretty decent person, but as soon as we got to the store it turned out he too was an asshole.

Now that I've got a new job I get to walk past both stores every day. The one closer to my work has faded displays of World of Warcraft and is always empty when I walk past it. The other store is now closed down and has been converted into a clothing store.

I make it my duty to walk past that store every day and silently laugh at them and think of how far I have come since those days.
