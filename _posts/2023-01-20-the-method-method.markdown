---
wordpress_id: RB-1674187762
layout: post
title: The method method
---

The `method` method in Ruby is one of my favourite methods in Ruby. It gives you an object that represents an underlying method. It's helpful for demonstrating that integer addition in Ruby is a method call:

```
1.method(:+)
=> #<Method: Integer#+(_)>
```

## Where is this method defined?

With this method `method`, you can find out where a method is defined, if it is defined in Ruby code anywhere:

```
SomeModel.method(:find).source_location
=> ["...activerecord-x.x.x/lib/active_record/core.rb", 337]
```

Then I can look at this source code within the Active Record gem to _find out_ how `find` works.

## Call me, maybe?

Methods can also be passed in place of traditional block arguments:

```
class Maths
  def self.square(num)
    num ** 2
  end
end

square = Maths.method(:square)

[1, 2, 3, 4].map(&square)
```

The `map` syntax here is short-hand for:

```
[1, 2, 3, 4].map { |number| square.call(number) }
```

Which is exactly the same behaviour that a `Proc` has:

```
a_proc = -> (num) { num ** 2 }
[1, 2, 3, 4].map(&square)
```

## More documentation

You can find more about the [Method class](https://devdocs.io/ruby~3.1/method) here. You can even find out why this code returns `true`:

```
def moo(arg) arg == 3; end

number = 3
case number
when method(:moo)
  true
else
  false
end
```
