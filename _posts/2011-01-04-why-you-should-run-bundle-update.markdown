--- 
wordpress_id: RB-295
layout: post
title: Why you should run bundle update
---

### Prelude

`bundle update` is a command provided by the Bundler gem which will update *all* your gem dependencies to their latest versions. Providing you have a `Gemfile.lock` pre-existing, running `bundle install` will only install the versions specified in the `Gemfile.lock` and will complain that you have incompatible versions:

    Bundler could not find compatible versions for gem "activesupport":
      In snapshot (Gemfile.lock):
        activesupport (3.0.0)

      In Gemfile:
        rails (= 3.0.3) depends on
          activesupport (= 3.0.3)

    Running `bundle update` will rebuild your snapshot from scratch, using only
    the gems in your Gemfile, which may resolve the conflict.

This command advises you to run `bundle update` which "will rebuild your snapshot from scratch", or in layman's terms: throw out the `Gemfile.lock` file and start again, finding *newer* versions of gems if they are available and building a bundle for those.

Beneath is an example of just this happening, and an argument as to why you should run it, but carefully.

### Alex's Tale

There's [a post by Alex from OptimisDev](http://optimisdev.com/posts/don-t-ever-run-bundle-update) that basically says: "Don't even run bundle update". That's even the title of the post. His argument is that by running `bundle update` his I18n version changed from `0.4.0` to `0.5.0` which caused his translations to break. This is because in `i18n 0.5.0` the translation syntax has changed _from_ `\{\{key\}\}` _to_ `%{key}`. Why did this happen? He was using the [`formtastic` gem](http://rubygems.org/gems/formtastic/versions/1.2.3.beta) which had specified a dependency on `i18n` of `>= 0.4.0` which will install any version of i18n that is `0.4.0` or greater, a category that `i18n 0.5.0` with its breaking API changes falls into.

### A story on gem versioning

Generally speaking, there's three parts of a version for a gem: the major, the minor and the tiny. For example, Rails right now has a major version of 3, a minor version of 0 and a tiny version of 3, making the full version `3.0.3` currently. 

The "rule" (or perhaps it's more of a guideline) of gem versioning is that any subsequent releases for the *same* minor version, but a newer, higher tiny version number should fix any bugs that existed in the previous version, without breaking any functionality. Therefore you should be able to have a gem dependency like this in your `Gemfile` without any fear that it would break:

    gem 'rails', '~> 3.0.0'
 
The `~>` part of the version indicates that we want the latest version in the series that we've specified. Because we've specified a major, minor and tiny version here, we'll get the latest tiny release of the `3.0` series (`3.0.3` at current writing) when we run `bundle install`. In a new tiny release, there should be *no breaking changes*, only patches. Therefore, specifying versions like this is considered the safest method.

For minor and major releases, things can be broken and so developers should take care when running any kind of task that updates their gems to the latest version.

### When gem dependencies go bad

In Alex's case, formtastic has declared it depends on `i18n >= 0.4.0` which is how _gem dependencies go bad_. In new minor or major releases of `i18n`, it's just about guaranteed that shit will be broke, and that's exactly what's going to be installed when an unwitting person runs `bundle update`. As gem authors (and I'm probably guilty of this myself), we should be specifying `~>` for their own gem dependencies. And we as application developers should be doing for our own gem dependencies in our `Gemfile` files. This is the way to be safe against breaking changes from a new minor or major gem version. I'm not saying that *every* new major/minor release has breaking changes, but rather to be wary when you're upgrading.

### Staying safe

If we follow these simple guidelines then we can live a peaceful life of Gem Dependency Heaven instead of Gem Dependency Hell (think pre-Bundler days).

Whilst it's probably not a good idea to run `bundle update` (and Alex used stronger wording with the "ever" word), it's still useful in some contexts. Recently, David Chelimsky released a new tiny version of rspec-rails (2.4.1) which fixed a single bug. If I had `gem 'rspec-rails', '~> 2.4.0'` and had `rspec-rails 2.4.0` installed but wanted to use the newest gem, I could update it by running a simple command:

    bundle update rspec-rails

This command updates the `rspec-rails` gem and its dependencies to satisfy their latest version specifications, leaving every other gem untouched.

So it's *potentially unsafe* to run `bundle update` because new versions of gems could break your application, but this should be a rare occasion because your gem versions should be specified as `~> <a tiny version>`, and if the authors of the gems are as smart as they should be, tiny versions should only contain bug fixes.

