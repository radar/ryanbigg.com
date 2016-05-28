--- 
wordpress_id: RB-373
layout: post
title: "Elixir Tip: Enum.any? + match?"
---

I recently found out about the [match?/2](http://elixir-lang.org/docs/stable/elixir/Kernel.html#match?/2) function in Elixir through the #elixir-lang IRC channel on Freenode.

What this function allows you to do is to determine if a given pattern matches a given expression. For instance, if you wanted to know if a list of maps contained a particular key + value combination, you could do this:

```elixir
people = [%{name: "John"}, %{name: "Jane"}]
Enum.any?(people, fn (person) -> match?(%{name: "John"}, person) end)
```

This code will get Elixir to tell you if any of the people have the name "John". In this case, the result would be `true`. You could even get fancy and use a shorter function:

```elixir
Enum.any?(people, &(match?(%{name: "John"}, &1)))
```

This shorter function defines the same function in the first example, but instead of having a named argument to the function, `&1` is used instead.
