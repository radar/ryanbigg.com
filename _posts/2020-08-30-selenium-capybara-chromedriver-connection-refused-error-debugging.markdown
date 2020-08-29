---
wordpress_id: RB-1598740882
layout: post
title: "Selenium, Capybara, ChromeDriver: connection refused error debugging"
published: true
---

A few days ago, we started seeing this exception happening for _some_ of our Capybara feature tests:

```
1.1) Failure/Error: visit(sign_out_path)

      Selenium::WebDriver::Error::UnknownError:
        java.net.ConnectException: Connection refused (Connection refused)
      # [remote server] org.openqa.selenium.remote.server.WebDriverServlet(WebDriverServlet.java):240:in `lambda$handle$0'
      # [remote server] java.util.concurrent.Executors$RunnableAdapter(Executors.java):511:in `call'
      # [remote server] java.util.concurrent.FutureTask(FutureTask.java):266:in `run'
      # [remote server] java.util.concurrent.ThreadPoolExecutor(ThreadPoolExecutor.java):1149:in `runWorker'
      # [remote server] java.util.concurrent.ThreadPoolExecutor$Worker(ThreadPoolExecutor.java):624:in `run'
      # [remote server] java.lang.Thread(Thread.java):748:in `run'
      # ./spec/support/pages/login.rb:5:in `login'
      # ./spec/concepts/extraction/keyboard_shortcuts_spec.rb:84:in `block (2 levels) in <main>'
      # ./spec/spec_helper.rb:69:in `block (2 levels) in <main>'
      # ./spec/support/elasticsearch_spec_helper.rb:42:in `block (3 levels) in <main>'
      # ./spec/support/elasticsearch_spec_helper.rb:38:in `block (2 levels) in <main>'
```

Connection refused, fine. But connection refused to _what_? This error message doesn't give us much to go on.

Seemingly nothing that we changed had caused this issue -- it was one of those types of issues that just popped up spontaneously.

It turns out that this is due to a bug within Google ChromeDriver `85.0.4183.83`. Here's the bug report for ChromeDriver: [Issue 3578](https://bugs.chromium.org/p/chromedriver/issues/detail?id=3578).

## Debugging steps

I was able to track it down to this issue by adding this line to the configuration for our tests:

```
Selenium::WebDriver.logger.level = Logger::DEBUG
```

I knew of this trick by having to debug Selenium issues in the past -- it's a very helpful trick to get messages out of Selenium WebDriver that you wouldn't otherwise see.

When I did this, I saw these messages come through:

```
2020-08-30 08:39:15 INFO Selenium <- {"value":{"data":{"text":"{Alert text : "},"error":"unexpected alert open","message":"unexpected alert open: {Alert text : }\n  (Session info: chrome=85.0.4183.83)","stacktrace":"0   chromedriver                        0x000000010a9261b9 chromedriver + 4911545\n1   chromedriver                        0x000000010a8c5e03 chromedriver + 4517379\n2   chromedriver                        0x000000010a533da6 chromedriver + 773542\n3   chromedriver                        0x000000010a4c4072 chromedriver + 315506\n4   chromedriver                        0x000000010a4b7c23 chromedriver + 265251\n5   chromedriver                        0x000000010a491720 chromedriver + 108320\n6   chromedriver                        0x000000010a492693 chromedriver + 112275\n7   chromedriver                        0x000000010a8eef72 chromedriver + 4685682\n8   chromedriver                        0x000000010a8fcb3a chromedriver + 4741946\n9   chromedriver                        0x000000010a8fc801 chromedriver + 4741121\n10  chromedriver                        0x000000010a8d225e chromedriver + 4567646\n11  chromedriver                        0x000000010a8fd061 chromedriver + 4743265\n12  chromedriver                        0x000000010a8e3d0a chromedriver + 4640010\n13  chromedriver                        0x000000010a9160ba chromedriver + 4845754\n14  chromedriver                        0x000000010a92c387 chromedriver + 4936583\n15  libsystem_pthread.dylib             0x00007fff67652109 _pthread_start + 148\n16  libsystem_pthread.dylib             0x00007fff6764db8b thread_start + 15\n"}}
```

Well that looks like a crash!

An unexpected alert open? What does that mean?

This lead me to look through the issue logs for Capybara first, as these were tests using Capybara. The final "exit" point from our code uses Capybara code. When I looked on Capybara's issue tracker I saw that there's an issue for this problem: [Capybara Issue #2382](https://github.com/teamcapybara/capybara/issues/2382). This then links to a Selenium issue: [Selenium Issue #8638](https://github.com/SeleniumHQ/selenium/issues/8638), which itself then links to [Issue 3578](https://bugs.chromium.org/p/chromedriver/issues/detail?id=3578).

These are pretty good pieces of evidence that indicate it was a chromedriver issue. I then recalled that a colleague of mine, Luiz, mentioned that Chrome had updated a few days ago. An update of Chrome leads to an update in Chromedriver, and since it was Chromedriver that was breaking, I thought to check that.

On the Capybara issue, there are some good steps to reproduce the issue with a minimal test case. I used this to lock Chromedriver to the more modern version:

```
Webdrivers::Chromedriver.required_version = '85.0.4183.87'
```

The issue reported on Capybara wasn't happening with that `.87` release, but it _does_ happen with this:

```
Webdrivers::Chromedriver.required_version = '85.0.4183.83'
```

So this then indicates that it's a particular version of Chromedriver that causes the issue.

There are at least two ways to fix this issue.

The first is to lock Chromedriver using `Webdrivers::Chromedriver.required_version` to a particular version. But that means we need to remember to update that.

The second way is to dismiss the alert before finishing the test:

```ruby
require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem 'capybara'
  gem 'puma'
  gem 'selenium-webdriver'
  gem 'webdrivers'
  gem 'byebug'
  gem 'pry'
end

require 'selenium-webdriver'
require 'capybara/dsl'

Webdrivers::Chromedriver.required_version = '85.0.4183.83'
Selenium::WebDriver.logger.level = Logger::DEBUG

html = <<~HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello World</title>
    <meta charset="utf-8">

    <script type="text/javascript">
      window.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        event.returnValue = '';
      });
    </script>
  </head>
  <body>
    <h1><a href="https://google.com">Hello World</a></h1>
  </body>
</html>
HTML

app = proc { |env| [200, { "Content-Type" => "text/html" }, [html] ] }

session = Capybara::Session.new(:selenium_chrome, app)
session.visit '/'
session.click_on 'Hello World' # interact with the page, to get Chrome to fire `beforeunload`
session.driver.browser.switch_to.alert.accept
session.visit '/'
```

It's the third-to-last and second-to-last lines here that will work around the issue here -- we need to attempt to navigate away from the page and then click the alert. Then we can carry on testing after that point.
