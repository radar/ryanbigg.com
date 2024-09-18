---
wordpress_id: RB-1726695598
layout: post
title: Use classes to represent data
---

**Accessing JSON structures through strings is an anti-pattern and a sign of lazy programming.**

When we write Ruby code, we use classes to represent data within our own applications. Typically, these are models from within the Rails application. But I've seen a repeated pattern of Rubyists consuming JSON data _without first casting that to an object_.

It opens the door for mistakes to be made, especially when it comes to typos in strings. It's too easy to get muddled up and think things are different to what they are — for example, a string that's under_scored is different to one that's camelCased. Accessing values in a JSON payload with the wrong key will result in a `nil` value.

Take for example this JSON object:

```json
{
  "contacts": [
    {
      "first_name": "Ryan",
      "last_name": "Bigg",
      "address": {
        "address_line_1": "1 Test Lane"
      }
    }
  ]
}
```

To access this data, we might mistakenly write this code in Ruby:

```ruby
data[0]["address"]["adddress_line_1"]
```

Not only is this full to the brim of unnecessary punctuation, but this will then return a nil value as there is no such key as `adddress_line_1` -- we've mistakenly added a 3rd "d".

To get around this, we could define a struct class to represent these contacts

```ruby
Contact = Struct.new(:first_name, :last_name, :address, keyword_init: true)
```

We could even go a step further and add a helper method for combining the first and last name:

```ruby
Contact = Struct.new(:first_name, :last_name, :address, keyword_init: true) do
  def full_name
    "#{first_name} #{last_name}"
  end
end
```

However, this only addresses the outer-layer of contacts, and not the inner-layer of addresses. To get that information, we would still need to use the bracket syntax:

```ruby
puts contacts.first["address"]["address_line_1"]
```

Or, we can use `dig`, which is a little neater but still has lots of punctuation:

```ruby
puts contacts.dig(0, "address", "address_line_1")
```

To tidy this up further, we can use `dry-struct` instead of Ruby's built-in structs, and then define two classes to represent both contacts and addresses.

```ruby
module Types
  include Dry.Types()
end

class Address < Dry::Struct
  transform_keys(&:to_sym)

  attribute :address_line_1, Types::String
end

class Contact < Dry::Struct
  transform_keys(&:to_sym)

  attribute :first_name, Types::String
  attribute :last_name, Types::String
  attribute :address, Address

  def full_name
    "#{first_name} #{last_name}"
  end
end
```

We can then use this to load the data by running:

```ruby
contacts = data["contacts"].map &Contact.method(:new)
```

(Keen observers will note that we could have an outer structure with a `contacts` attribute too!)


When we load the contact + address data like this, we can then access the data within it like a typical Ruby model:

```
contacts.first.address.address_line_1
```

Only the most minimal amount of punctuation required. Then, if we happen to mis-type the key again:

```
contacts.first.address.adddress_line_1
```

We get a runtime error:

```
undefined method `adddress_line_1' for #<Address address_line_1="1 Test Lane"> (NoMethodError)

contacts.first.address.adddress_line_1
                      ^^^^^^^^^^^^^^^^
```

By using `dry-struct` we've added some guardrails around our data structure, and avoided the possibility for mis-typing keys. On top of this, we can enforce that certain keys are always required by using the `required` method on the type.

```ruby
class Contact < Dry::Struct
  transform_keys(&:to_sym)

  attribute :first_name, Types::String.required
  attribute :last_name, Types::String.required
  attribute :address, Address

  def full_name
    "#{first_name} #{last_name}"
  end
end
```


While we've define just string types for our values, we may have additional fields (such as a contact's date of birth) that we could enforce stricter types on if we wished as well:

```ruby
class Contact < Dry::Struct
  transform_keys(&:to_sym)

  attribute :first_name, Types::String.required
  attribute :last_name, Types::String.required
  attribute :date_of_birth, Types::Date.required
  attribute :address, Address

  def full_name
    "#{first_name} #{last_name}"
  end
end
```

All this ensures that JSON data that we ingest is modeled in a similar manner to the models within our application. We avoid the time sinks of mis-typed data resulting in nils. We avoid the excessive punctuation of accessing nested data. And ultimately: We have type enforcement for the data that we're ingesting.
