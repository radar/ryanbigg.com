---
wordpress_id: RB-1692680263
layout: post
title: Alpine Linux, Selenium Manager, Chrome and ChromeDriver
---

Selenium, and by extension the selenium-webdriver gem, after version 4.11 come with [a new feature called Selenium Manager](https://www.selenium.dev/blog/2022/introducing-selenium-manager/). This CLI tool will automatically install whatever browser and driver you need to run your Selenium tests. (These are installed under `~/.cache/selenium...`)

Today, I tried setting this up in an Alpine linux based Docker image and ran into trouble where it claimed it could not find the executable.

I was seeing errors such as:

```
/bin/sh: ./chromedriver-linux64/chromedriver: not found
```

The file was definitely present though!

Other answers on the internet pointed to this being an issue with missing libraries. Those answers pointed to the `ldd` tool, and sure enough that showed the libraries that were required for chromedriver. The command was:

```
ldd ./chromedriver-linux64/chromedriver
```

This listed the system libaries that the chromedriver executable was dependent on Then I read through those messages that were output and attempted to find packages that matched the messages.

To make Chromedriver v116 work on Alpine Linux, you have to have these packages installed:

```
apk add gcompat glib nss libxcb libgcc
```

After installing these packages, Chromedriver was able to start.

But Chromedriver is not so useful without a Chrome to drive it. I used `ldd` once again, and found a _huge_ list of packages that Chrome requires. Instead of installing all of these, you can install Chrome using:

```
apk add chromium
```

This will then install Chromium (whatever's latest and all of the package dependencies). This will be enough to get Chrome running.

Ultimately, I ended up building a small Docker image to test this out properly. Here's that image's `Dockerfile`:

```
FROM ruby:3.2.2-alpine
RUN apk update && apk add gcompat glib nss libxcb libgcc chromium

RUN adduser -D app
RUN mkdir /app
RUN chown app:app /app
USER app
WORKDIR /app
COPY --chown=app:app . /app

RUN bundle config set --local path vendor/bundle
RUN bundle install
CMD bundle exec irb
```

I build this with:

```
docker build . -t selenium
```

Then I run it with:

```
 docker run -it selenium
```

This will launch me into an IRB session. To check if Selenium can correctly download + use Chrome and ChromeDriver, I run this code, which is very similar to the code that would be used to configure this within `rails_helper.rb` in a Rails app:

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

So the important thing to note here is that if you've got:

1. A Ruby image that uses `ruby:3.2.2-alpine` (or similar) as its base
2. And you want to use the built-in Selenium Manager to download Chrome + Chromium
3. You will need to have these packages installed:

```
apk add gcompat glib nss libxcb libgcc chromium
```
