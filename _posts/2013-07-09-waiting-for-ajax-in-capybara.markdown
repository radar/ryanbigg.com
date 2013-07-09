--- 
wordpress_id: RB-342
layout: post
title: Waiting for AJAX in Capybara
---

In Spree recently, we've been using more and more of [Spree's API](http://guides.spreecommerce.com/api) for the Backend component. This means that we've introduced more AJAX-powered features into the backend, which has lead to some interesting test failures.

Some of these test failures are that the tests just aren't waiting long enough for an AJAX request to complete before checking for content on the page. Others are more ... bewildering:

```
F
An error occurred in an after hook
  ActiveRecord::StatementInvalid: 
    SQLite3::BusyException:
    database is locked: DELETE FROM "spree_activators";
  occurred at ...lib/sqlite3/statement.rb:108:in `step'
```

This error happens when an AJAX request is still being processed by the server, but the test finishes and Database Cleaner attempts to wipe the database. The server has locked the database until it's done what it needs to do, and during that lock Database Cleaner attempts to wipe all the data and can't.

To fix this, we just needed to wait for all AJAX requests to complete. This means replacing `sleep` with magic numbers, like this:

```
sleep(2)
```

With this method:

```
def wait_for_ajax
  counter = 0
  while page.execute_script("return $.active").to_i > 0
    counter += 1
    sleep(0.1)
    raise "AJAX request took longer than 5 seconds." if counter >= 50
  end
end
```

This code will call `$.active` which is jQuery-code for "how many `$.ajax` requests are still active?", and if that returns more than 0, then it will sleep for a moment, and check again. This code gives AJAX requests 5 seconds to wrap up before raising an exception and moving on.

Use this `wait_for_ajax` method when you need to wait for AJAX requests to finish in your tests to prevent weird, unpredictable JavaScript errors.

