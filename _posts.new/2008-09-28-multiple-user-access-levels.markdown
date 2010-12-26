--- 
wordpress_id: 274
layout: post
title: Single Table Inheritance
wordpress_url: http://frozenplague.net/?p=274
---
This tutorial was written using Ruby 1.8.6, Rails 2.1.

A lot of the time I see people asking how they can do something like access levels for their Rails applications and this usually boils down to some STI (single table inheritance) love. You'll need to have <a href="http://github.com/technoweenie/restful-authentication/tree/master">restful_authentication</a> installed.
<h3>What is Single Table Inhertiance?</h3>
Single Table Inheritance is where you have multiple models that inherit from a single table, hence the name. It's great for situations like this where we want multiple user access levels, but we don't want to create multiple tables for the different kinds of users of our application.
<h3>Okay.. so how do I use it?</h3>
Firstly you start off with one model that inherits from <span class="term">ActiveRecord::Base</span>, and I would advise running <span class="term">script/generate authenticated person session</span> to get this:

<strong>app/models/person.rb</strong>
<pre lang="rails">class Person < ActiveRecord::Base

end</pre>
And then you subclass some other classes from <span class="term">Person</span>
<strong>app/models/student.rb</strong>
<pre lang="rails">class Student < Person

end</pre>
<strong>app/models/teacher.rb</strong>
<pre lang="rails">class Teacher < Person

end</pre>
<strong>app/models/admin.rb</strong>
<pre lang="rails">class Admin < Person

end</pre>

The great thing about splitting these into individual files is because they're more easily managed and closely follows the convention of one model per file.

Now you have a person, student and teacher model and you should have a brand new migration for your people table in <em>db/migrate</em> so go on and open that up and you'll see something like this:
<pre lang="rails">class CreatePeople < ActiveRecord::Migration
  def self.up
    create_table "people", :force => true do |t|
      t.column :login,                     :string, :limit => 40
      t.column :name,                      :string, :limit => 100, :default => '', :null => true
      t.column :email,                     :string, :limit => 100
      t.column :crypted_password,          :string, :limit => 40
      t.column :salt,                      :string, :limit => 40
      t.column :created_at,                :datetime
      t.column :updated_at,                :datetime
      t.column :remember_token,            :string, :limit => 40
      t.column :remember_token_expires_at, :datetime

    end
    add_index :people, :login, :unique => true
  end

  def self.down
    drop_table "people"
  end
end</pre>
To enable STI for this table, just add:
<pre lang="rails">t.column :type, :string</pre>
into the create_table block, just after <span class="term">t.column :remember_token_expires_at, :datetime</span>. This type column will be set to whatever class the record is, so if we create a new Student object, this type column will be set to "Student".

<h3>Controllers</h3>
To create new objects for these subclasses I would recommend building a people controller and using the form partial from that to base your form off from the other controllers, such as <span class='term'>StudentsController</span> and <span class='term'>TeachersController</span>. These controllers should <strong>NOT</strong> subclass from PeopleController, they should be their own independent controllers because Teachers, People and Students are all individual resource types. 

<h3>Associated Models</h3>

If you have associated models (e.g. Person has_many :enrolments), any subclass of Person will inherit this relationship. For the relationship, this will be referenced via person_id still in the enrolments table.
