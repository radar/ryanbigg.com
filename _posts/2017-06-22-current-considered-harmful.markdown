---
wordpress_id: RB-378
layout: post
title: CurrentAttributes considered harmful
---

I was made aware of [this commit](https://github.com/rails/rails/commit/24a864437e845febe91e3646ca008e8dc7f76b56) recently (thanks to Rebecca Skinner) to Rails which introduces what is effectively a global state to Rails applications.

Rather than writing why global state in-general is a bad thing myself, I will instead link you to this [excellent question + answer on the Software Engineering Stack Exchange](https://softwareengineering.stackexchange.com/questions/148108/why-is-global-state-so-evil).

> Very briefly, it makes program state unpredictable.
>
> To elaborate, imagine you have a couple of objects that both use the same global variable. Assuming you're not using a source of randomness anywhere within either module, then the output of a particular method can be predicted (and therefore tested) if the state of the system is known before you execute the method.

This implementation also chooses to use [thread-local variables](https://github.com/rails/rails/commit/24a864437e845febe91e3646ca008e8dc7f76b56#diff-3c3c0f647bc4702f9453c173a707aa06R90) which [this answer over on Stack Overflow](https://stackoverflow.com/a/8291218/15245) explains is not a good choice because:

> * It's harder to test them, as you will have to remember to set the thread-local variables when you're testing out code that uses it
> * Classes who use thread locals will need knowledge that these objects are not available for them but inside a thread-local variable and this kind of indirection usually breaks the law of demeter
> * Not cleaning up thread-locals might be an issue if your framework reuses threads (the thread-local variable would be already initiated and code that relies on ||= calls to initialize variables might fail

Not to mention that this also violates the well-established [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter) too. Suddenly, `Current` is available _anywhere_ in your application. Good code is _explicit_ in how it makes data available to its methods / functions. This `CurrentAttributes` feature is not good code, nor is it making it _explicitly clear_ how `Current.user` arrives in the model. It is just there "magically".

I enjoy and have benefited from Rails magic in the past. Some of my favourite features are `render @collection` and the [polymorphic routing](http://ryanbigg.com/2012/03/polymorphic-routes). Those are great features because their scope is limited. I know that I can render a collection in a view. I know I can use polymorphic routing in controllers, models and helpers.

This `CurrentAttributes` is much too magical for my liking because of how it introduces a thread-local global state which hides where the actual work of setting values on `Current` is done, and because it is _implicit_ about where those values come from.

"They're just set in the controller!", may be a defense for this. But what if you don't have a controller? What if you have a background job instead? How about a test? True, in both cases you could use `Current` to provide the values:

```ruby
def perform(user_id, post_id)
  Current.user = User.find(user_id)
  post = Post.find_by(post_id)
  post.run_long_running_thing
  # code to run the job goes here
end
```

Here, `Post#run_long_running_thing` can simply access the current user by accessing `Current.user`. But it is not immediately clear -- if all you're looking at is the `Post#run_long_running_thing` method -- where `Current.user` is being set in the first place. It's implied that it's set somewhere else, but to attempt to find where it's set in this context may be difficult. Doing a find in the project for `Current.user =` may turn up multiple places (controllers, jobs, etc.) where the variable is set. Which one is the right one _for this context_?

As for tests, for those you would need to setup `Current.user` before hand if you had any code relying on that. I'd imagine something like:

```ruby
let(:user) { FactoryGirl.create(:user) }
before { Current.user = user }

it "runs the long running thing" do
  post.run_long_running_thing
end
```

Again, it is not explicit when you're looking at the `run_long_running_thing` method or its tests where `Current.user` is being set.

There doesn't appear to be anywhere in the `CurrentAttributes` code -- as far as I can tell -- where it would reset the state of this `Current` object in between each test. Therefore, setting it in one test like what I've done above now makes it bleed through "magically" into other tests. That behaviour seems like a horrible thing to have in a codebase. You could very well have situations where you're _expecting_ `Current.user` to be `nil` but instead it's set to some vaule because some other test set it. Now which of the 500 tests in my application did that? Good luck finding it.

### Convention over configuration, and perhaps explicitness over implicitness?

Rails is still a good framework. I know DHH's rebuttal to this will be "don't use it then" or something along those lines. Similar to his response to [my reverting of callback suppression](https://github.com/rails/rails/pull/25115) a while back.

> Protecting programmers from themselves is explicitly not in the charter for Rails when it comes to providing features that have a valid use case but could be abused.

I just can't reason with the guy at all. We have vastly different opinions on this sort of thing.

I think Rails choosing to go with ultra-implicitness -- like in this `Current` case -- is a vastly wrong move that will lead to a lot of frustration with Rails codebases that use this feature. I think Rails should, in situations like this, choose to opt for explicitness over implicitness. Rails has enough magic in it and it certainly doesn't need any more.

This feature is not something that was sought after (it appears like DHH thought it was a good idea one day and just _did it_), and we have much better ways of doing this. For instance, in the job code above, it would be better to pass it explicitly:

```ruby
def perform(user_id, post_id)
  user = User.find(user_id)
  post = Post.find_by(post_id)
  post.run_long_running_thing(user)
  # code to run the job goes here
end
```

Similarly, in the test explictness also wins:

```ruby
let(:user) { FactoryGirl.create(:user) }

it "runs the long running thing" do
  post.run_long_running_thing(user)
end
```

In both of these cases, it is _very_ clear how `user` arrives in the `run_long_running_thing` method: it is passed in as an argument.

Introducing a global state to Rails seems like a terrible idea and while I deeply, deeply wish this change is reverted, that is very likely not going to happen because it's DHH's change and it's his framework. DHH is allowed to be a footgun merchant if he wishes to be. I am just sad to see that, despite evidence that this is a genuinely bad idea, DHH carried on with it. I thought with his years of experience he would know better by now.
