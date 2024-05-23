---
wordpress_id: RB-1716410791
layout: post
title: Scheduling with Ice Cube
---

I work in a system that needs to have recurring calendar-based payments happen, where the frequency of these payments is down to a (mostly) arbitrary selection by users. Recurring calendar events are interesting, especially if someone picks the _end of the month_ for an event to occur. Some months that means the 30th, but it can also mean the 28th, 29th and 31st, depending on not only the _month_ but also the _year_, thanks to leap years. Recurring payments can occur over multiple years, so one year there might be a payment done on the 29th of February one year, and another done on the 28th of February the year either side of that.

The frequency of these payments that we allow for in our system are weekly, fortnightly, every-4-weeks, monthly, quarterly, half-yearly, and yearly. When a schedule is created, we use the start date for the schedule as the basis for the ongoing payments. Schedules can optionally have an end date too, where those payments will stop happening.

On top of that, weekly and fortnightly payments can optionally have a day of the week chosen for payments, which means that they sometimes don't line up with the declared start date.

Monthly payments can also have the same option, but instead of day of the week it's day of the month. If someone selects the 31st as their billing day, we need to consider what we'd do in months like February, April, June, September and November, which don't have those days.

All of this sounds like quite the headache, given it involves the two most difficult things: _time_ and _money_. Putting the money thing to one side for the moment, we'll stay focussed on just the _time_ thing.

To help with the scheduling calculation, we use the [ice_cube](https://rubygems.org/gems/ice_cube) gem.

Let's say that we have a schedule that:

* Starts today: `2024-05-22`.
* Has no end date
* Reoccurs monthly
* Day of the month: 31st

With `ice_cube`, we can write code to generate schedules:

```ruby
start_date = Date.parse('2024-05-22')

schedule_rule = IceCube::Rule.monthly.day_of_month(31)

schedule = IceCube::Schedule.new(start_date) do |s|
  s.add_recurrence_rule(schedule_rule)
end

puts schedule.first(10)
```

This seems innocent enough. But if we run it, we'll see that it's not quite right:

```text
2024-05-31 00:00:00 +1000
2024-07-31 00:00:00 +1000
2024-08-31 00:00:00 +1000
2024-10-31 00:00:00 +1100
2024-12-31 00:00:00 +1100
2025-01-31 00:00:00 +1100
2025-03-31 00:00:00 +1100
2025-05-31 00:00:00 +1000
2025-07-31 00:00:00 +1000
2025-08-31 00:00:00 +1000
```

We asked for a monthly recurring schedule, but we also said that this has to be on the 31st day of the month. The `ice_cube` gem dutifully follows our instructions, and sets a reoccurring schedule for all months with 31 days and the first 5 months there are May, July, August, October, and December.

We would also see this bug if we specified the 30th or 29th for the day of the month.

To fix this, we can instead specify a negative day:

```ruby
start_date = Date.parse('2024-05-22')

schedule_rule = IceCube::Rule.monthly.day_of_month(-1)

schedule = IceCube::Schedule.new(start_date) do |s|
  s.add_recurrence_rule(schedule_rule)
end

puts schedule.next_occurrences(10)
```

This will produce the following schedule:

```text
2024-05-31 00:00:00 +1000
2024-06-30 00:00:00 +1000
2024-07-31 00:00:00 +1000
2024-08-31 00:00:00 +1000
2024-09-30 00:00:00 +1000
2024-10-31 00:00:00 +1100
2024-11-30 00:00:00 +1100
2024-12-31 00:00:00 +1100
2025-01-31 00:00:00 +1100
2025-02-28 00:00:00 +1100
```

We can do similar scheduling rules for the things I mentioned earlier too, such as scheduling things on Mondays:

```ruby
schedule_rule = IceCube::Rule.weekly.day(:monday)
```

```text
2024-05-27 00:00:00 +1000
2024-06-03 00:00:00 +1000
2024-06-10 00:00:00 +1000
2024-06-17 00:00:00 +1000
2024-06-24 00:00:00 +1000
2024-07-01 00:00:00 +1000
2024-07-08 00:00:00 +1000
2024-07-15 00:00:00 +1000
2024-07-22 00:00:00 +1000
2024-07-29 00:00:00 +1000
```

The [README for the gem](https://github.com/ice-cube-ruby/ice_cube) contains plenty of other examples.
