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
