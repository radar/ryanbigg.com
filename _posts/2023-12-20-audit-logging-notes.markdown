---
wordpress_id: RB-1703023411
layout: post
title: Audit Logging Notes
---

I've recently been working on adding audit logging to an application at work, and I wanted to share some notes on the process here, as I couldn't find much written about it online.

What I could find though was GitHub's own audit logging that they have for organizations. A lot of these notes was inspired by how they have approached this.

This application in question that I'm working on is called the Merchant Dashboard, and is typically used by merchants to view and process transactions. Common actions that can be taken include things such as creating purchases, issuing refunds, or setting up payment plans for their customers.

Audit logging means tracking all the "write" events that a user can take within our application. We want to provide a history of these actions so that merchants can look through their users' activities. While we, as application owners, can look through the logs to determine who took what action when, our merchants have not been able to access this data themselves. This audit logging feature aims to address that.

## Audit Table Schema

We have a table that tracks all the events a user takes, tracking:

* `timestamp`: **When** the event happened.
* `user_id`: **Who** took the action.
* `merchant_id`: The merchant account where the action was taken.
* `action`: **What** the action was (a string like `create_purchase`)
* `record_id` / `record_type`: If the action was taken on a record, what the record was. This can be nullable, as some actions do not involve a record that isn't the user's record, such as logging in, or resetting a password.
* `payload`: Any additional metadata we wanted to include

A record in the audit log table might look like:

* `timestamp`: 2023-12-23 09:42:00
* `user_id`: 1
* `merchant_id`: 2
* `action`: `create_purchase`
* `record_id` / `record_type`: 3 / Purchase
* `payload`: `{}`

Or:

* `timestamp`: 2023-12-23 09:42:00
* `user_id`: 1
* `merchant_id`: nil
* `action`: `login`
* `record_id` / `record_type`: nil
* `payload`: `{}`

We separate the login event from any particular merchant in our application, as a user can login and then switch between the different merchants they have access to.

## Displaying audit logs

Displaying this information is done in two distinct ways. We want to display audit log information on a per-user basis; what actions has _this particular user_ taken? And: we want to display audit log information for a whole merchant account; what actions _have all users_ taken on _this particular merchant account_?

In both situations, all of these things are helpful:

* Show events in reverse chronological order
* Group events by date
* Paginate events, rather than showing _all events ever_, show 25-50 events on a page.
* Provide searching, allowing a user to search for _actions_ or _record IDs / types_.
* Allow users to filter by a specific date range. Default this date range to the last 30 days.
* Indicate potentially dangerous events with a specific label, such as password reset for the user, failed login attempts or deletion of data.

## Handling deleted records

Also worth considering here is how you would display an audit log line for a deleted record. Say that these two events occurred:

1. A customer was created
2. The same customer record was deleted

Is it still relevant that the customer was created in the first place? Perhaps. A customer could've had a payment processed for them in the interleaving time, which would be a very relevant log line to catch.

For this reason, consider soft-deletion of important records using something such as [the discard gem](https://github.com/jhawthorn/discard). That way, you can still point the audit log to the record in question, even if it remains invisible from other parts of the system.

## Staff / system level events

Our system allows for internal staff to "impersonate" users and act on their behalf. For events such as this, the impersonation attempt should be logged. If there are any other write actions taken while impersonation is happening, the event is logged against the user being impersonated, and tagged (using the payload) as an impersonation event.

For automatic system-level events, such as scheduled payments, we will log these as well on a merchant account level so that they appear tied to a "system" user.

## Audit log retention

While it would be great to keep data for all time, disk space is finite, and when it's not it's _expensive_.

Consider automatically culling audit logs after a pre-defined period, perhaps a year or two.
