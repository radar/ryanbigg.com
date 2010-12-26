--- 
wordpress_id: 172
layout: post
title: Self-Referential Relationships
wordpress_url: http://frozenplague.net/?p=172
---
I've seen this question asked time and time again, so I'm going to write a short tutorial about how to do it. The question is self-refferential relationships for a model, often the User model to determine the relationship between two different users. I'll assume that you've already got a Rails application and at least a User model for this. We'll use a has_many :through relationship to define which users are related to who.

Let's generate a model for the relationship: <span class="term">script/generate model relationship</span>. This will generate a migration which we'll create our relationships table with.

<strong class="code-title">db/migrate/xxx_create_relationships.rb</strong>
<pre lang="rails">class CreateRelationships < ActiveRecord::Migration
  def self.up
    create_table :relationships do |t|
      t.integer :user_id, :friend_id
      t.string :relationship_type
    end
  end

  def self.down
    drop_table :relationships
  end
end</pre>
And that should do us. Run <span class="term">rake db:migrate</span> to add the table in.

Now we go into our User model and we add in the following:

<strong class="code-title">app/models/user.rb</strong>
<pre lang="rails">class User < ActiveRecord::Base
  has_many :relationships
  has_many :friends, :through => :relationships
end</pre>
And in our relationship.rb model:

<strong class="code-title">app/models/user.rb</strong>
<pre lang="rails">class Relationship < ActiveRecord::Base
  belongs_to :friend, :class_name => "User"
  belongs_to :user
end</pre>
And now we see if it works:

<strong class="code-title">script/console</strong>
<pre lang="rails">>> u = User.find_by_name("Ryan")
=> #
>> u.friends << User.find_by_name("Charlie")
=> #
>> u.save
=> true</pre>
Now what if we want to change that relationship field? We'll add in two methods in to the user model to find the relationship for a specific user.

<strong class="code-title">app/models/user.rb</strong>
<pre lang="rails">def to_i
  id
end

def find_relationship_with(user)
  Relationship.find_by_friend_id(user.to_i)
end</pre>
The first method, <span class="term">to_i</span>, will return just the id for the user. The reason why we do this is because in the next method, <span class="term">find_relationship_with</span> we pass in a single argument, user. Now because we've defined the to_i method on our User model, this means we can either pass in a user id or a user object to this method, and it will call to_i on whatever we pass in, ending up with an id. When the method's done, it will return a relationship object which you can then modify.

Best of luck.
