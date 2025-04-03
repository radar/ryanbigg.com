---
wordpress_id: RB-1743720122
layout: post
title: Cursor-based querying with Rails
---

It's a well known issue that `LIMIT` + `OFFSET` pagination in any SQL server will lead to performance problems once the value of `OFFSET` reaches a high enough value. This is because the database has to scan through the first [`OFFSET` amount] of records that match the query before it can start returning an amount of records up to the `LIMIT`.

This sort of addition of a `LIMIT` + `OFFSET` to a slow query is commonly also used as a stop-gap for expensive queries. Perhaps before adding this, you have a query that's building up a long list of transactions for another business to consume, and then one of your customers has a particularly impressive day and then your database has a particularly not-so-impressive time with that query. No problem, you think, you'll find the data in batches of 1000 by using a `LIMIT` and `OFFSET` (such as how `find_in_batches` in Rails operates). This query will operate _better_ than one without, but as soon as that `OFFSET` value hits a high number, you'll run into performance problems again.

When I've run into these problems, I've turned to the [postgresql_cursor](https://github.com/afair/postgresql_cursor) gem. This gem uses [PostgreSQL cursors](https://www.postgresql.org/docs/current/plpgsql-cursors.html) to iterate through all the rows of a query without loading the entire query at once.

We can use this in application by calling its methods on a model:

```ruby
Purchase.each_instance do |purchase|
  # do something with the data here
end
```

This will instantiate each of the rows into instances of the model, but sometimes you just want the raw data instead. For that, the gem provides a different method:

```ruby
Purchase.each_row do |row|
  # do something with the raw data
end
```


This breaks the queries down by defining a cursor and then iterating through the rows in batches of 1,000 by default. Here's an example of what the queries for this look like in an application I'm running locally:

```
   (2.0ms)  declare cursor_58f312c30e9a4719826fbdef24ed2017 no scroll cursor for SELECT "purchases".* FROM "purchases"
   (16.5ms)  fetch 1000 from cursor_58f312c30e9a4719826fbdef24ed2017
   (0.2ms)  fetch 1000 from cursor_58f312c30e9a4719826fbdef24ed2017
   (0.1ms)  close cursor_58f312c30e9a4719826fbdef24ed2017
```

Once I'm done working on the first set of thousand, then the gem will fetch the next thousand by calling `fetch 1000 from <cursor_id>`, with a final call to close off the cursor once there's no more data returned.

This massively eases the memory pressure on the database as it doesn't need to load more than 1,000 records at a single time, and keeps its performance linear even if we're iterating through a whole bunch of different records. All without needing a `LIMIT` or `OFFSET`!
