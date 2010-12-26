--- 
wordpress_id: 180
layout: post
title: Updating a select box based on another
wordpress_url: http://frozenplague.net/?p=180
---
In two projects now I've had to use code where I update a select box (machines) in regards to what's selected in the first (customers). mark[oz] from #rubyonrails asked how to do this last week and I told him I would write a blog post the following night. 5 days later, here it is.

I use this when I'm creating a new call and the user needs to select which customer and then which machine. I have the following in my CallsController:
<pre lang="rails">def new
  @call = Call.new
  @customers = Customer.find(:all, :order => "name ASC")
end</pre>
Relatively simple. We instantiate a new call object so the form knows where to go, and we define <span class="term">@customers</span> so the first select box has some information.

Of course in our Customer model we have:
<pre lang="rails">class Customer < ActiveRecord::Base
  has_many :machines
end</pre>
And the machine model:
<pre lang="rails">class Machine < ActiveRecord::Base
  belongs_to :customer
end</pre>
And the call model:
<pre lang="rails">class Call < ActiveRecord::Base
  belongs_to :machine
  belongs_to :customer
</pre>

These define the relationships used within the system.

Next is the <span class="term">new.html.erb</span> page itself.
<pre lang="rails"><strong>New Call</strong>
<% form_for @call do |f| %>
  <%= render :partial => "form" %>
  <%= submit_tag "Create" %>
<% end %></pre>
And a stripped-down version of the form partial:
<pre lang="rails"><%= f.label "customer_id" %>
<%= f.select "customer_id", @customers.map { |c| [c.name, c.id] }%>
<%= observe_field "call_customer_id", :url => by_customer_machines_path, :with => "customer_id" %>
<%= f.label "machine_id" %>
<%= f.select "machine_id", "Please select a customer" %></pre>
Right now that we have the form all set up, lets set up our machines controller
<pre lang="rails">class MachinesController < ApplicationController
#CRUD operations go here

def by_customer
  @machines = Machine.find_all_by_customer_id(params[:customer_id])
end
end</pre>
And our <span class="term">by_customer.rjs</span>:
<pre lang="rails">page.replace_html 'call_machine_id', options_from_collection_for_select(@machines, "id", "name")</pre>
And finally the config/routes.rb:
<pre lang="rails">map.resources :customers do |customer|
  customer.resources :machines
end

map.resources :machines, :collection => { :by_customer => :post }</pre>
Now when we select a customer from the top drop down, the machines drop down should be populated too.
