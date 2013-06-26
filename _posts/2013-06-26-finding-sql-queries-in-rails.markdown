--- 
wordpress_id: RB-341
layout: post
title: Finding SQL queries in Rails
---

In my work on Spree, sometimes I've been wanting to know *where* queries are coming from. Just like any large codebase, the "magic" that goes on inside it to make the cogs spin the right way can be a bit complex.

Active Support's Notifications feature is really handy for this. All I need to do is subscribe to the `sql.active_record` event and get it to output the stacktrace of where the query is generated, like this:

```ruby
ActiveSupport::Notifications.subscribe("sql.active_record") do |_, _, _, _, details|
  if details[:sql] =~ /INSERT INTO "spree_inventory_units"/
    puts caller.join("\n")
    puts "*" * 50
  end
end
```

Whenever a query that inserts a new record into the `spree_inventory_units` table is issued through Active Record, this code will give me a complete stacktrace of where that came from.