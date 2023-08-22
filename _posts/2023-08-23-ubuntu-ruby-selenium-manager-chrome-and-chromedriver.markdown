---
wordpress_id: RB-1692737323
layout: post
title: Ubuntu, Ruby, Selenium Manager, Chrome and ChromeDriver
---

[This is a rehash of my Alpine Linux version of this post](/2023/08/alpine-linux-selenium-manager-chrome-and-chromedriver). I'll skip the fluff here and jump straight to the good stuff.

The packages needed for Chromedriver are:

```
libnss3 libnspr4
```

The packages needed for Chrome are:

```
libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

(There's also a package called `chromium-shell` that installs all of these necessary dependencies, and at least half a kitchen sink too. The install time for this package is very long.)

The `Dockerfile` is therefore:

```
FROM ruby:3.2.2

RUN apt-get update && apt-get install libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2

# OR this, but the install time is much longer:
# RUN apt-get update && apt-get install chromium-shell

RUN adduser --disabled-password --gecos "" app
COPY --chown app:app . /app
WORKDIR /app
USER app

RUN bundle config set --local path vendor/bundle
RUN bundle install
CMD bundle exec irb
```

And we can then build and run this image:

```
docker build . -t ubuntu-selenium
docker run -it ubuntu-selenium
```

And confirm it works by running:

```ruby
Bundler.require

Selenium::WebDriver.logger.level = Logger::DEBUG

options = ::Selenium::WebDriver::Chrome::Options.new

options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

Selenium::WebDriver.for :chrome, capabilities: options
```

This output should include things like a check for both Chrome + ChromeDriver, which will fail:

```
DEBUG Selenium [:selenium_manager] Checking chromedriver in PATH
DEBUG Selenium [:selenium_manager] Running command: chromedriver --version
DEBUG Selenium [:selenium_manager] Output: ""
DEBUG Selenium [:selenium_manager] chromedriver not found in PATH
DEBUG Selenium [:selenium_manager] Checking chrome in PATH
DEBUG Selenium [:selenium_manager] Running command: which chrome
DEBUG Selenium [:selenium_manager] Output: ""
DEBUG Selenium [:selenium_manager] chrome not found in PATH
DEBUG Selenium [:selenium_manager] chrome has not been discovered in the system
```

(The chrome one fails here, as `chromium` has installed Chrome at `/usr/bin/chromium`.)

After that, we'll see log lines for downloads of Chrome + ChromeDriver:

```
DEBUG Selenium [:selenium_manager] Reading metadata from https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json
DEBUG Selenium [:selenium_manager] Required browser: chrome 116.0.5845.96
DEBUG Selenium [:selenium_manager] Downloading chrome 116.0.5845.96 from https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/116.0.5845.96/linux64/chrome-linux64.zip
DEBUG Selenium [:selenium_manager] chrome 116.0.5845.96 has been downloaded at /home/app/.cache/selenium/chrome/linux64/116.0.5845.96/chrome
DEBUG Selenium [:selenium_manager] Reading metadata from https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json
DEBUG Selenium [:selenium_manager] Required driver: chromedriver 116.0.5845.96
DEBUG Selenium [:selenium_manager] Driver URL: https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/116.0.5845.96/linux64/chromedriver-linux64.zip
DEBUG Selenium [:selenium_manager] Driver path: /home/app/.cache/selenium/chromedriver/linux64/116.0.5845.96/chromedriver
DEBUG Selenium [:selenium_manager] Browser path: /home/app/.cache/selenium/chrome/linux64/116.0.5845.96/chrome
```

Importantly, this shows version 116.0.5845.96 for both Chrome + ChromeDriver. We want these to match for compatibility reasons. As Chrome releases newer versions, the version that's downloaded here will differ.

Then we'll see ChromeDriver starting up:

```
DEBUG Selenium [:selenium_manager] Browser path: /home/app/.cache/selenium/chrome/linux64/116.0.5845.96/chrome
DEBUG Selenium [:driver_service] port prober could not bind to ::1:9515 (Address not available - bind(2) for "::1" port 9515)
DEBUG Selenium [:driver_service] Executing Process ["/home/app/.cache/selenium/chromedriver/linux64/116.0.5845.96/chromedriver", "--port=9515"]
DEBUG Selenium [:process] Starting process: ["/home/app/.cache/selenium/chromedriver/linux64/116.0.5845.96/chromedriver", "--port=9515"] with {[:out, :err]=>#<IO:<STDOUT>>, :pgroup=>true}
DEBUG Selenium [:process]   -> pid: 28
2023-08-22 05:46:27 DEBUG Selenium [:driver_service] polling for socket on ["127.0.0.1", 9515]
Starting ChromeDriver 116.0.5845.96 (1a391816688002153ef791ffe60d9e899a71a037-refs/branch-heads/5845@{#1382}) on port 9515
Only local connections are allowed.
Please see https://chromedriver.chromium.org/security-considerations for suggestions on keeping ChromeDriver safe.
[1692683187.222][SEVERE]: bind() failed: Address not available (99)
ChromeDriver was started successfully.
```

The "address not available (99)" error here is because ChromeDriver is trying to bind to `::1:9515`, but this Docker image is not setup with IPv6 support, so that will fail.

Finally, we'll see some JSON requests to `POST session` going back and forth from `9515`, indicating ChromeDriver's opening a Chrome window and that's succeeding.

```
DEBUG Selenium [:command] -> POST session
DEBUG Selenium [:command]    >>> http://127.0.0.1:9515/session | {"capabilities":{"alwaysMatch":{"browserName":"chrome","goog:chromeOptions":{"args":["--headless","--no-sandbox","--disable-dev-shm-usage","--disable-gpu"],"binary":"/home/app/.cache/selenium/chrome/linux64/116.0.5845.96/chrome"}}}}
```
