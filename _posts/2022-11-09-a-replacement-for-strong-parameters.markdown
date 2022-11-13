---
wordpress_id: RB-1667944762
layout: post
title: A replacement for strong parameters
---

I'm not going to take [this week's (very obvious) bait about how "Vanilla Rails is plenty"](https://dev.37signals.com/vanilla-rails-is-plenty).

In the past, I've spent effort watching DHH's videos and [issuing a (time-stamped) rebuttal](https://ryanbigg.com/2018/03/on-writing-software-well-2-a-review), and writing up about [a new Rails feature I would consider harmful](https://ryanbigg.com/2017/06/current-considered-harmful).

<p style='font-size: 125%'><strong>I even <a href='https://leanpub.com/maintain-rails/'>wrote a book called Maintainable Rails</a> that offers my take on how to build a maintainable Rails application. A whole 30,000 words of it!</strong></p>

I am not going to follow that pattern today, even though the vanilla Rails article is _concerning_.

You know, if their apps were _maintainable_, then they wouldn't need to keep re-writing them completely, yeah?

I digress.

Today, I want to cover a _different_ feature of Rails that I think could be improved: strong parameters.

The [documentation for strong_parameters](https://guides.rubyonrails.org/action_controller_overview.html#nested-parameters) always makes me a little confused with all of its different kinds of brackets. It feels like someone discovered Lisp and then thought it would be good to have as many brackets in Ruby, only to abandon the idea half-way.

Here's a complicated example from that documentation.

```ruby
params.permit(:name, { emails: [] },
              friends: [ :name,
                         { family: [ :name ], hobbies: [] }])
```

The documentation goes on to explain:

> This declaration permits the name, emails, and friends attributes. It is expected that emails will be an array of permitted scalar values, and that friends will be an array of resources with specific attributes: they should have a name attribute (any permitted scalar values allowed), a hobbies attribute as an array of permitted scalar values, and a family attribute which is restricted to having a name (any permitted scalar values allowed here, too).

The documentation also explains that the permitted scalar values are:

```
The permitted scalar types are `String`, `Symbol`, `NilClass`, `Numeric`, `TrueClass`, `FalseClass`, `Date`, `Time`, `DateTime`, `StringIO`, `IO`, `ActionDispatch::Http::UploadedFile`, and `Rack::Test::UploadedFile`.
```

That's quite a few permitted types!

How might we approach this differently? I think we could do this in a clearer fashion with a gem called [dry-schema](https://dry-rb.org/gems/dry-schema/1.10/). The dry-schema gem allows us to define particular schemas that our data should comply with, and like strong parameters it will automatically drop keys that are not specified in the schema itself.

### Creating the schema

Let's try creating a schema from the above strong parameters code, but this time in dry-schema. I'm also going to add an extra field here called age:

```ruby
PersonSchema = Dry::Schema.Params do
  required(:name).filled(:string)
  required(:age).filled(:integer)
  required(:emails).value(array[:string]).value(min_size?: 1)
  required(:friends).array(:hash) do
    required(:name).filled(:string)
    required(:family).hash do
      required(:name).filled(:string)
    end
  end
  required(:hobbies).array(:string)
end
```

With this schema we're clearly defining the types of the data that we expect. Now we've limited the type of `name` to string, so it can no longer accept a file for its value. That is probably for the best.

The `required(:friends).array(:hash)` syntax might hurt a little bit to read, but it means "an array of any length, where the values are all hashes". The block of this method then defines the permitted keys within those hashes.

You could define this schema at the top of your controller, if you like, or in its own file at `app/schemas/person_schema.rb`. It really should depend on the context in which it is used.

It goes further than strong parameters, because it specifies the types expected for things such as emails and hobbies, whereas strong parameters would allow any "permitted scalar values" in there, including things such as numbers. The `dry-schema` version _also_ specifies that there has to be at least one email address.

### Using a valid set of parameters

A hash that would pass the checks for this schema.

```ruby
params = {
  name: "Ryan",
  age: 34,
  emails: ["me@ryanbigg.com"],
  hobbies: ["MTG", "Coding"],
  friends: [
    {
      name: "Dear",
      family: { name: "Reader" }
    }
  ]
}
```

We can check this with:

```ruby
result = PersonSchema.(params)
```

We will get a `Dry::Schema::Result` back from this, which we can grab the output of with:

```
result.output
```

### Type-coercions

Another hash that would pass the checks, even though it might not look like it, is this one:

```ruby
params = {
  name: "Ryan",
  age: "34",
  emails: ["me@ryanbigg.com"],
  hobbies: ["MTG", "Coding"],
  friends: [
    {
      name: "Dear",
      family: { name: "Reader" }
    }
  ]
}
```

The `age` key here is specified as a string, but the schema says the type must be an `integer`. Let's look at what happens:

```ruby
result = PersonSchema.(params)
result.output[:age] # => 34
```

The `Dry::Schema.Params` type will do its best to cooerce string parameter values to their matching Ruby counterparts. This will also work for things such as dates in the "YYYY-MM-DD" formats, too. No more needing to do a `Date.parse` if that parameter is being sent to something else, like a service object instead of a model.


### Unknown Keys are removed

Like with strong parameters, if we attempt to pass an extra key:

```ruby
params = {
  name: "Ryan",
  age: 34,
  emails: ["me@ryanbigg.com"],
  hobbies: ["MTG", "Coding"],
  friends: [
    {
      name: "Dear",
      family: { name: "Reader" }
    }
  ],
  very_smart: true
}
```

Then the schema will remove this additional key, proving that I am just regular smart, if that.

### Re-using schemas

`dry-schema` also allows us to re-use schemas. Let's say that we have two schemas, our `PersonSchema` and another schema called `FriendSchema` that defines the shape of the friend keys. Heres how we could use those together:

```ruby
FriendSchema = Dry::Schema.params do
  required(:name).filled(:string)
  required(:family).hash do
    required(:name).filled(:string)
  end
end

PersonSchema = Dry::Schema.Params do
  required(:name).filled(:string)
  required(:age).filled(:integer)
  required(:emails).value(array[:string]).value(min_size?: 1)
  required(:friends).array(FriendSchema)
  required(:hobbies).array(:string)
end
```

This is particularly helpful if you had a couple of complicated data structures that you wanted to validate at the same time, and use each of those schemas in different locations.

I'd like to see strong parameters do that!

### Error messages are provided

If the hash passed in is completely invalid, like this one:

```ruby
params = {}
result = PersonSchema.(params)
```

Then we can retrieve error messages that are similar to Active Model validations back out:

```
=> {:name=>["is missing"], :age=>["is missing"], :emails=>["is missing"], :friends=>["is missing"], :hobbies=>["is missing"]}
```

On top of this, the `result` is also going to respond to `success?` with `false`, meaning we could use this in a controller action to check if the parameters are valid, before even passing them to their final destination. That might be a model (with, perhaps, it's own validations), or it could
be another service.

---

I've only scratched the surface on what `dry-schema` can do. I purposely wanted to keep this post short today to cover how it could replace strong parameters within Rails to provide a much better developer experience than that bracketed mess.

If you'd like to know what else dry-schema can do, make sure to check out [its documentation here](https://dry-rb.org/gems/dry-schema/).
