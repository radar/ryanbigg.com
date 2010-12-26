--- 
wordpress_id: 1004
layout: post
title: Using Cucumber tables to specify associations
wordpress_url: http://ryanbigg.com/?p=1004
---
How many times do you use Cucumber to seed data by using a step such as this:

    And there is a list:
      | name          |
      | GetUp people! |

Probably a lot, right? Good. Then this post is probably for you.

How many times have you done it and needed to specify an association in there too? Like this:

    And there is a list:
      | name          | parameters[email_contains] |
      | GetUp people! | getup                      |

Probably a couple of times.

<h3>So what can be done?</h3>

As you may know, by using this syntax in Cucumber you get a variable which I always call "table" in my steps. You may call it something else. What matters is that it's a `Cucumber::Ast::Table` object that has a method called `hashes` on it. This will return a `Hash` object for every single row minus one in your table. The minus one is the first row -- the header row -- which provides the keys for the hash. The remaining rows are the values for each of the hashes. In the first example, our hash is:

    { :name => "GetUp people!" }

In our second example, our hash is:

    { "name" => "GetUp people!", "parameters[email_contains]" => "getup" }

Bah! This won't do!

<h3>Enter <span class='term'>to_query</span></h3>

There's a lovely method on `Hash` that will allow you to convert any `Hash` object to query parameters. It's called `to_query`. The second Hash `to_query` output is this:

    "name=GetUp+people%21&parameters%5Bemail_contains%5D=getup"

<strong>Eeew!</strong>

<h3>Query strings are not pretty</h3>

So to deal with query strings, Rack parses them into a `Hash` object (and Rails, a `HashWithIndifferentAccess` object) using the lovely `Rack::Utils.parse_nested_query` method. This forms the query string into the `params` hash which we have come to know and love. The very same `params` hash you use to create objects with. 

See where I'm going with this? Great!

So we define our step like this:

    Given /^there (is|are)\s?a?\s?lists?:$/ do |is_or_are, table|
      table.hashes.each do |hash|
        List.create!(Rack::Utils.parse_nested_query(hash.to_query))
      end
    end

The regular expression is to match "there is a list:" or "there are lists:", in case we want to create more than one. By passing in the parsed hash (and because we're using `accepts_nested_attributes_for`, the model is actually ListParameter<strong>s</strong>), we're able to create not only the new `List` record, but also assign the `ListParameter` record too.

<h3>Not only for <span class='term'>belongs_to</span></h3>

You can also assign `has_many`s through this too, although the syntax is a little bit more uglier. Again, providing you're using `accepts_nested_attributes_for` for the `has_many` association, this should work just as well as if you posted it from a real form.

      And there is a link:
        | url               | clicks_attributes[0][user_id] |
        | http://google.com | 1                             |

How about that?!
