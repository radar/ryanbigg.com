--- 
wordpress_id: RB-370
layout: post
title: Working with date ranges in Active Record
---

**TL;DR: [Use the by_star gem and save yourself a lot of hassle](https://github.com/radar/by_star).**

When you're trying to get records for a particular date range in Active Record, for example from the beginning of the month to the end of the month, you may be tempted to write code like this:

```ruby
beginning_of_month = Date.today.beginning_of_month
end_of_month = beginning_of_month.end_of_month
Post.where(created_at: beginning_of_month..end_of_month)
```

Let's say that the month is March 2016 (and it is, at the time of writing). This query will get you all posts between the 1st of March and the 31st of March, but not in the way you expect it. It will get you all posts between 00:00:00 of the 1st of March and 00:00:00 of 31st of March, which is probably not what you want, as it misses the last days posts completely. 

What you'll want is all the posts between 00:00:00 of the 1st of March and 23:59:59.99999 of the 31st of March.

To do this, you _could_ use `Time.current` instead:

```ruby
beginning_of_month = Date.today.beginning_of_month
end_of_month = beginning_of_month.end_of_month
Post.where(created_at: beginning_of_month..end_of_month)
```

This will give you the right set of posts, because `Time.current.end_of_month` is something like `Thu, 31 Mar 2016 23:59:59 UTC +00:00` (or it might even be in your local time zone, like `Wed, 09 Mar 2016 14:39:25 AEDT +11:00).

Or you could use [the `by_star` gem](https://github.com/radar/by_star). I wrote this gem to easily query date /
time ranges in Active Record and it has saved me a lot of frustration. The above code examples would then become:

```ruby
Post.by_month(Date.today)
```

This will retrieve all posts by the current month, and that means all the posts between 00:00:00 of the 1st of March and 23:59:59.99999 of the 31st of March will be returned if I ran this query today.

## Conclusion

[Use the by_star gem and save yourself a lot of hassle](https://github.com/radar/by_star).






