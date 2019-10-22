---
wordpress_id: RB-1551781922
layout: post
title: Ruby Trickery
---

Last week I gave a talk at Melbourne Ruby involving some card tricks and Ruby trickery.

The talk is up on Youtube:

<iframe width="560" height="315" src="https://www.youtube.com/embed/lSiD3LZanPI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I do some card tricks for about 10 minutes, and then some Ruby tricks. I won't reveal how I did the card tricks in this blog post, but I will reveal how I did the Ruby tricks.

The Ruby trickery starts at about the 9m30s mark in that video. You can see the code for most of these tricks at [radar/trickery on GitHub](https://github.com/radar/trickery).

In this post, I'll cover all the tricks I had planned for the talk, not just the ones I showed off.

**Please, do not use any code in this blog post in production systems. It can cause weird behaviour. Especially the one involving JavaScript sorting.**

The point of this post is to show the things Ruby is capable of.

## Numbers

### Addition

My first trick was to override addition, which I did with this code:

```ruby
class Integer
  alias_method :old_plus, :+

  # 2 + 2 = 6
  def +(num)
    old_plus(old_plus(num))
  end
```

This allowed me to call `2 + 2` and get a result of `6`. It runs two plus operations, effectively doubling the number on the left before adding the number on the right. This is why `2 + 5 = 9` and `3 + 7 = 13`. By aliasing the original `+` method using `old_plus`, we can override the `+` method, but still use the old one.

### Multiplication

The next trick applies to multiplication, but is a little more advanced:

```ruby
class Integer
  alias_method :old_multiply, :*

  def *(num)
    m = method(:old_multiply).unbind
    m.bind(3).(num / self)
  end
end
```

This code calls `method(:old_multiply)`, but `unbind`s it from `self`. I can then rebind this method to anything else with the `bind` method, before calling it again. This re-binding makes the number `3` always the `self` within the `old_multiply` method, regardless of what is passed through on the left. However, the `self` reference inside this override will still be the left-hand-side number.

Some examples:

```ruby
3 * 3 == 3
6 * 3 == 0
99 * 999 == 30
```

### Unary minus

The unary methods are often ignored within Ruby, despite having their uses. There's [a good Ruby Inside article about unary methods](http://www.rubyinside.com/rubys-unary-operators-and-how-to-redefine-their-functionality-5610.html). You should read it.

The TL;DR is that unary methods work as prefixed method calls on particular objects within Ruby. I'll show you what I mean. But let's look at the override first:

```ruby
def -@
  +self
end
```

This is pretty straight forward. When we're told to minus something, make it a positive instead.

What's interesting here is that it won't work on negative numbers straight off the bat:

```ruby
>> -5
=> -5
```

This is because negative numbers are... well, they're negative numbers. The minus symbol there isn't a unary method call.

But things change if you assign a variable:

```ruby
>> a = 5
=> 5
>> -a
=> 5
```

The number remains positive, even though it should've been negated. This is because this code is calling the `-@` unary method.

What's fun with this is that you can keep chaining negative signs, positive signs or a combination of both:

```ruby
>> --------a
=> 5
>> ++++++++a
=> 5
>> +-+-+a
=> 5
```

All of these examples either call `-@`, `+@` or a combination of both multiple times.

## Arrays

### Sorting, the JavaScript (aka "right") way

JavaScript sorting is a well-known case of... well, weird behaviour. For example, this code:

```js
[-2, -1, 0, 1, 2].sort()
```

Should maintain the same order of the numbers, increasing left-to-right. Instead, the output is this:

```js
[-1, -2, 0, 1, 2]
```

This "weird behaviour" happens because JavaScript sorts objects based on their string versions. The string "-1" comes before "-2", but "-2" comes before "0", and so on. This  [is specified in the EcmaScript specification (5.1), Section 15.4.4.11](https://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.11), but you need a PhD or higher qualificatio (read: galaxy brain) to understand exactly what it is saying.

How does this relate to Ruby? Well, first of all Ruby does the sorting order correctly:

```ruby
>> [-2, -1, 0, 1, 2].sort
=> [-2, -1, 0, 1, 2]
```

But if we wanted to bring JavaScript style sorting to Ruby, then we can use this code:

```ruby
module JSSort
  def self.included(base)
    base.alias_method :old_sort, :sort
  end

  def sort
    self.map(&:to_s).old_sort.map(&:to_i)
  end
end

Array.include(JSSort)
```

This converts each element to a string via `map`, then sorts them using the old sorting behaviour (the default Ruby way), before converting them all back to integers.

We're not guaranteed to have arrays of integers at all times, so we might want to put a guard around that to check at least the first element is a number:

```ruby
def sort
  if first.is_a?(Numeric)
    self.map(&:to_s).old_sort.map(&:to_i)
  else
    self.old_sort
  end
end
```

This doesn't prevent against arrays that contain a mix of datatypes (numbers and strings), but only really nefarious people create those, and there aren't many of those in the Ruby community so I think we can be safe here.

This code will now make Ruby sort "correctly" -- at least according to JavaScript:

```ruby
>> [-2, -1, 0, 1, 2].sort
=> [-1, -2, 0, 1, 2]
```

If we include this module into `Range`, we can get the same delicious behaviour:

```ruby
Range.include(JSSort)
```

Let's try it:

```ruby
>> (-2..2).sort
=> [-1, -2, 0, 1, 2]
```

Now we can make Ruby sort the same way as JavaScript.

### Double Equality

A little known fact is that the `==` in code like `[1,2,3] == [1,2,3]` is actually a method call. This code calls `Array#==`, and we can override this method too.

```ruby
class Array
  alias_method :old_double_equals, :==

  def ==(other)
    method(:old_double_equals).(other) ? "yes" : "no")
  end
end
```

Rather than getting the plain (and boring) `true` or `false` when we compare arrays, we will now get "yes" or "no".

```ruby
>> [1,2,3] == [1,2,3]
=> "yes"
>> [1,2,3] == [1,2]
=> "no"
```

You can make this method a little more fun by first checking the length and then determining what to do on that:

```ruby
other.length > 3 ? "maybe" : (method(:old_double_equals).(other) ? "yes" : "no")
```

This way then, you get "maybe" if you try to compare against an array of more than 3 elements:

```ruby
>> [1,2,3] == [1,2,3,4]
=> "maybe"
```

### Triple Equality

Similarly to `==`, `===` is also a method call. When we're making this call we want to be _really_ sure that the things are equal. Getting back `false` would be disappointing, so we can override this method to always return `true`:

```ruby
class Array
  def ===(_)
    true
  end
end
```

### Not Equal

Just like its siblings `==` and `===`, `!=` is also a method call. We can override this:

```ruby
class Array
  def !=(_)
    "can't say, tbqh"
  end
end
```

We can't say, to be quite honest.

### Unary Minus (again)

We saw an example of unary minus working on a variable, but unary methods can be called before data types in Ruby too. Strings are one case where we can freeze a string by prefixing it with `-`:

```ruby
>> a = -"string"
=> "string"
>> a.frozen?
=> true
```

But arrays are another case. Arrays in Ruby don't have a unary minus method defined by default, but that doesn't stop us defining our own:

```ruby
class Array
  def -@
    clear
  end
end
```

What this code allows us to do is to clear an array by prefixing it with `-`. It'll work for the array itself, or a variable representing the array too:

```ruby
>> -[1,2,3]
=> []
>> a = [1,2,3]
=> [1, 2, 3]
>> -a
=> []
>> a
=> []
```

This saves us a full 5 characters of typing that we would otherwise have to do:

```ruby
>> a.clear
```

### Unary Plus

Just like `-@`, we can add a `+@` method to arrays:

```ruby
def +@
  replace flat_map { |x| [x] * 10 }
  self
end
```

The Japanese "十" character is the one for 10, so it makes sorta-sense that our `+@` method takes each of the element, and makes 10 of those in the array:

```ruby
>> a = [1,2,3]
=> [1,2,3]
>> +a
=> [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
```

This operation mutates the array using `replace`, replacing whatever's in the array with 10 of each of the elements.

It should be noted that `*` is [also an Array method](http://ruby-doc.org/core-2.6.1/Array.html#method-i-2A), but this one hasn't been overriden here. I should also note that the `*` method can take _either_ an Integer or a String as an argument and it behaves differently depending. Check out the docs for more info.

### Unary Bang

We've seen a few unary methods so far, but an even lesser known one is the `!@` unary method. My override for this is straightforward:

```ruby
class Array
  def !@
    map { |x| rand(100) }
  end
end
```

This will give us random numbers in our array, between 0 and 100:

```ruby
>> ![1,2,3]
=> [70, 11, 82]
```

### Unary Tilde

The last in the long line of unary methods is `~@`. This one kinda looks like a wave, so I think it should shuffle arrays:

```ruby
class Array
  def ~@
    shuffle
  end
end
```

Here's an example of using it:

```ruby
>> ~[1,2,3]
=> [2, 1, 3]
```

This saves us a grand total of 8 characters. Wow, such savings!

### Unary combos

As we saw before with the unary methods `+@` and `-@`, we can chain them:

```ruby
>> --------a
=> 5
>> ++++++++a
=> 5
>> +-+-+a
=> 5
```

Same goes for these array methods:

```ruby
>> !+~[1,2,3]
=> [53, 68, 83, 5, 66, 98, 55, 73, 0, 40, 93, 71, 83, 38, 78, 68, 11, 29, 83, 88, 86, 2, 8, 85, 72, 77, 50, 96, 78, 36]
```

Why would you want to do this? I am not sure. I think it is a quirk of the Ruby language that allows this.

But the order matters:

```ruby
>> +!~[1,2,3]
Traceback (most recent call last):
        1: from /usr/local/opt/asdf/installs/ruby/2.5.1/bin/irb:11:in `<main>'
SyntaxError ((irb):4: syntax error, unexpected !~)
+!~[1,2,3]
 ^~
 ```

## Typing without typing

That covers all my Ruby tricks in the video (and some more!), but there were a couple of other tricks I should mention. There were two distinct tricks: one where the code typed itself, and another where a terminal displayed a card after someone spoke it.

### Self-writing code

It sure would be nice if code wrote itself. But alas, technology hasn't reached that particular zenith yet.

We can simulate this sort of technology using _other_ tech, such as [Asciinema](https://asciinema.org/). This will record your terminal session, and you can play it back as you wish. This is what I did when I wrote the original `cards.rb`.

### ActiveListening

The [second `cards.rb`](https://github.com/radar/trickery/blob/master/cards.rb), works with a dual keypress on the keyboard. Six of diamonds is "6D". Ten of hearts is "0H" or "TH". Jokers aren't used in any serious card games, so they are not accounted for in this script.

So this code, if you read it, works by taking terminal input of two characters. But during the talk I get Kasia to read out some cards and then, a little while later, they appear on the screen.

But how?

This is a cheeky trick, and I needed another assistant for it. I recruited one of my juniors, Nick Wolf for this. I ran a [`tmux`](https://en.wikipedia.org/wiki/Tmux) session for all the code demos during the talk, and gave Nick `ssh` access to my machine.

Nick then connected in via `ssh`, ran `tmux attach-session` and then could control my terminal as easily as I could. When Kasia read out a card, Nick would type in the two characters required for that card.

Magic isn't magic if you know how it works. This trick was a little cheeky, but I included it as I wanted to show off that `tmux` can allow two people to share a terminal over SSH.

## Conclusion

I hope this post has been helpful to understand what strange things Ruby is capable of. There's no logical reason to override the `+` method on `Integer`, or to add extra unary methods to Arrays. It's just something that Ruby allows us to do because of the language's flexibility.

Other people have done truly amazing things with the Ruby language. There's the [trick2018](https://github.com/tric/trick2018/) repo which includes some really amazing Ruby files. Go through those and take a look.

My favourite though is the [qlobe](https://github.com/knoxknox/qlobe) -- a quine that outputs a rotating globe of the earth. It even [remembered to include New Zealand](https://www.youtube.com/watch?v=HynsTvRVLiI).
