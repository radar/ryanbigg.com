---
wordpress_id: RB-1740994987
layout: post
title: Decorating arrays with SimpleDelegator
---

Let's say that I have a long list of transactions and that I want to apply some filtering steps to these with Ruby. I might have gathered this list from somewhere in particular, or I could generate it with some quick Ruby:

```ruby
require 'csv'

Transaction  = Data.define(:date, :amount, :status)

transactions = 100.times.map do
  Transaction.new(
    date: Date.today - rand(30),
    amount: rand(1.0..250.0).round(2),
    status: rand < 0.9 ? "Approved" : "Declined"
  )
end
```

These transactions are a list occurring anywhere in the last 30 days, with amounts between $1 and $250, with a status that has a 90% chance of being "Approved" and 10% chance of being "Declined".

To filter on these I can use common methods like `select`:

```ruby
transactions
  .select { it.amount <= 25 }
  .select { it.date == Date.parse("2025-02-26") }
```

That would find me any transaction with an amount less than $25, occurring on the 26th of February. Easy enough!

But we can bring this code closer to English by using `SimpleDelegator` to decorate our array, creating a neat DSL:

```ruby
class Transactions < SimpleDelegator
  def amount_lte(amount)
    select { it.amount <= amount }
  end

  def for_date(date)
    select { it.date == Date.parse(date) }
  end

  def select(&block)
    self.class.new(super(&block))
  end
end
```

This class inherits from SimpleDelegator and defines methods to provide that simple DSL. Our code from before:

```ruby
transactions
  .select { it.amount <= 25 }
  .select { it.date == Date.parse("2025-02-26") }
```

Can now instead be written as:

```ruby
transactions
  .amount_lte(25)
  .for_date("2025-02-06")
```

This has centralized the implementation details of how we query the transactions into one simple class. Anything that needs to massage the input before we run a query on transactions now has a nice place to live. An example of this is to put `Date.parse` inside `for_date`. This could be customized further to _only_ do that `Date.parse` if the object passed in is a string and not a `Date` already.

As a bit of "homework" here, can you update this class to add methods for finding only approved or declined transactions? Is there a chance you could make outside this `Transactions` class to make the syntax cleaner?

Could you also support this syntax?

```ruby
transactions.for_date(date_1).or(transactions.for_date(date_2))
```

And now can you write that code any shorter as well?
