--- 
wordpress_id: RB-344
layout: post
title: Debugging Rails Controllers
---

Here's my flow for debugging a misbehaving controller. Imagine that there's a form at `app/views/messages/new.html.erb` that is posting to `MessagesController#create`. The parameters aren't being passed through from the form to the controller, and the model is raising a validation error saying that a field is blank -- even though it's *clearly* not.

### Step 0: Does restarting the server fix the problem?

### Step 1: Check the form

* Is the attribute defined in the correct place? 
* Is it using the form builder helper (i.e. `f.text_field`) or is it using `text_field_tag`? If it's supposed to be `params[:message][:body]` then it should be using the form builder. If not, then it should be using `text_field_tag` or similar.
* Unlikely, but still possible: Is the field disabled before submission of the form? Disabled fields are not passed through as parameters.

### Step 2: Check the controller

* Is the route to the controller defined correctly in `config/routes.rb`?
* Is the controller set up to receive the right parameters?
* Did I spell 'message' with the correct number of 's's within `params[:message]`?
* Are the parameters from the form permitted using strong_parameters?
* Are *all* the parameters from the form permitted?
* Did I spell the parameters correctly? 
* What does the log output say for this controller? Does it contain the parameters I want with the values I want?
* Can I place a `binding.pry` statement at the top of the action and print out `params` to see the correct parameters there too?

### Step 3: Check the model

* If using `attr_accessible`, are the attribute marked as accessible?
* Did I accidentally use `attr_accessor` when I meant to use `attr_accessible`?
* Did I define a setter method for this attribute accidentally that doesn't actually set the attribute?
* Is there a callback that unsets this parameter somehow?
* If it's nested attributes that are being sent through, go check the nested model for the above.



