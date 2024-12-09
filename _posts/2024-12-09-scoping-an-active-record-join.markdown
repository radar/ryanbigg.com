---
wordpress_id: RB-1733781277
layout: post
title: Scoping an Active Record join
---

Active Record is well known for its footguns, like N+1 queries and letting you dump _all the business logic_ for your applications in models. (For an alternative, read [Maintainable Rails](https://leanpub.com/maintain-rails).)

A lesser-known footgun is this seemingly innocuous use of `joins` in a tenanted Rails application. By "tenanted" I mean that most records have something like a `tenant_id` on them that declares ownership. In our case, it's `merchant_id`. Here's the query:

```ruby
FraudCheck.where(merchant: merchant).joins(:purchase)
```

Fraud checks belong to a merchant, and they also belong to a purchase. Purchases have just the one fraud check. Merchants have many fraud checks and purchases.

The query this executes is:

```sql
SELECT "fraud_checks".* FROM "fraud_checks"
INNER JOIN "purchases" ON "purchases"."id" = "fraud_checks"."purchase_id"
WHERE "fraud_checks"."merchant_id" = 1
```

This seems like a relatively good query and it'll run "fast enough" on small data sets. However, as your dataset grows and becomes measured in multiple terabytes, such a query will get slower and slower.

This query runs slow because it's querying two tables, one very quickly because it has a small dataset to query through, and one very slowly because it has a much larger dataset to trawl through. The first table it queries is `fraud_checks`, and it finds all of those where the `merchant_id=1`, which is a smaller dataset than "all fraud checks ever". The second table it queries is "purchases", which it attempts to find all purchases from all time matching the `purchase_id` values returned by the fraud checks query.

We can shorten this query's execution time by scoping the purchases to just those from the merchant by using `merge`:

```ruby
FraudCheck
  .where(merchant: merchant)
  .joins(:purchase)
  .merge(
    Purchase.where(merchant: merchant)
  )
```

This now executes this query:

```sql
SELECT "fraud_checks".* FROM "fraud_checks"
INNER JOIN "purchases" ON "purchases"."id" = "fraud_checks"."transaction_id"
WHERE "fraud_checks"."merchant_id" = 2736
AND "purchases"."merchant_id" = 2736
```

The query is now limited to just fraud checks _and_ purchases that match that `merchant_id`, resulting in a smaller table scan for purchases that match the selected fraud checks.

We further limit this query by applying a date range scope on the purchases too:


```ruby
FraudCheck
  .where(merchant: merchant)
  .joins(:purchase)
  .merge(
    Purchase.where(merchant: merchant, created_at: start_date..end_date)
  )
```

This results in a super fast query compared to what we started with, as we've now drastically reduced the scope of purchases that can match our query.
