---
wordpress_id: RB-1768817451
layout: post
title: Beware grpc gem and Ruby 4.0
---

Finally got to the bottom of ridiculously slow build times on one of my applications. I’m talking 30+ minute builds, all without `sassc`!

 We use a gem in the app called `newrelic-infinite_tracing`, which has a dependency on another gem called `grpc`. This gem has native extensions that are pre-built. You'll see these listed on RubyGems as lists like:

* 1.76.0 October 24, 2025 x86-linux-gnu (22.5 MB)
* 1.76.0 October 24, 2025 x86_64-linux-gnu (19.8 MB)
* 1.76.0 October 24, 2025 x86_64-linux-musl (18.8 MB)
* ...

These list the version, architecture and platform that you're going to be installing these gems on. These gems can also be locked to specific Ruby versions, and these 1.76.0 gems are indeed locked to only Ruby `>= 3.1` and `<= 3.5.dev`. **This does not include Ruby 4.0!** So when we go to install this gem onto Ruby 4.0, it finds _no_ precompiled binaries, and instead compiles it all from scratch, bringing back memories of `sassc` and `nokogiri`'s old compile times before RubyGems introduced this wonderful precompiled binaries feature.

I got to the bottom of this issue by running `bundle install` with no more `-j` option, and then measuring which gem took the longest time to install during a CI build step. The step helpfully output timestamps on each line of the `bundle install` process, which helped a lot toward narrowing it down!
