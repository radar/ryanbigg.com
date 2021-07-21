---
wordpress_id: RB-1626909473
layout: post
title: Using Ruby 2.7's new triple-dot syntax to clean up service objects
---

In big Rails projects there's been a bit of a push to move things out to _service objects_. You might recognise these from their appearance in things like controllers:


```ruby
CreateBook.new.call(book_params)
```

The `CreateBook` class itself might look like this:

```ruby
class CreateBook
  include Dry::Monads[:do, :result]

  def call(params)
    ...

    book_params = yield validate(params)
    create_book(book_params)
  end
end
```

In order to access that instance `call` method from the controller, we must first create an instance of this `CreateBook` class. This makes our code _slightly_ messy because we must always `new` before we `call`. The `call` here _must_ be an instance method because we've included `Dry::Monads` methods within instances of this class, as per the best-practices when using that gem.

However, we can tidy things up here by using Ruby 2.7's new triple-dot syntax. This syntax is another special type of argument, used in the same place you might use positional or keyword arguments. We can use triple-dots to pass arguments from a class method down to an instance method, like in this example:


```ruby
class CreateBook
  include Dry::Monads[:do, :result]

  def self.call(...)
    new.call(...)
  end

  def call(params)
    ...

    book_params = yield validate(params)
    create_book(book_params)
  end
end
```

Anytime the `call` method on the _class_ is called, a new `CreateBook` _instance_ is created, then those arguments from the class-level `call` are passed to the instance-level `call`. By defining this new `call` method on the class itself, we can then change our controller to this:

```ruby
CreateBook.call(book_params)
```

This makes our code out to the `CreateBook` class from wherever we're using it slightly easier, while still allowing us to create & use instances of `CreateBook` if we wish. One particular case where that might come in handy is if you wanted to inject a dependency here:

```ruby
CreateBook.new(book_repository: book_repo).call(book_params)
```

But that's a story for another day.
