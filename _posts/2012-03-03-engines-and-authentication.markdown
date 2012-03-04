--- 
wordpress_id: RB-324
layout: post
title: Engines and Authentication
---

I've been in America now longer than I've been in my new apartment, but it's for very good reasons. The first of these was <a
href='http://spreeconf.com'>SpreeConf</a>, which was held in New York City and the second was <a href='http://ruby.onales.com'>Ruby
on Ales</a>, held in Bend, Oregon. Both were amazing conferences for their own reasons.

At both of these conferences, I gave a talk about Rails Engines. In this talk, I covered a lot of the lessons that I learned about
developing an engine, and the one of them that I would like to expand on today is about how an engine should deal with
authentication.

Put simply, the engine should not deal with authentication *at all*. You can stop reading now, this blog post is over and you've
learned everything you're going to learn. Go forth and develop engines without authentication. Thanks for reading!

---

If you're staying for after-the-fold, then let me explain my reasonings for this.

When we (Phil Arndt, Josh Adams and I) were developing <a href='https://github.com/radar/forem'>Forem</a>, we talked about what authentication engine we would support inside Forem. The issue was that different people have different opinions on what authentication system is "best". Some like <a href='https://github.com/technoweenie/restful-authentication'>Restful Authentication</a>, some like <a href='https://github.com/binarylogic/authlogic'>Authlogic</a>, others like <a href='https://github.com/thoughtbot/clearance'>Clearance</a>, others like <a href='https://github.com/NoamB/sorcery'>Sorcery</a>, and finally others like to build their own custom solution. That was something made easier with the inclusion of `has_secure_password` in Rails 3.1.

That's a lot of fragmentation!

Therefore, picking *one* authentication solution means that we would isolate a large group of people. This is what the "auth"
component of Spree does, spree_auth.

---

The way that spree_auth deals with authentication is that it uses Devise. It has a `Spree::User` model in it, and there's also some
Devise setup inside `config/initializers/devise.rb`. The `Spree::User` model is how Spree deals with authentication inside the
engine.

By having this authentication inside Spree, we are expressly stating that you *must* use Devise and have it as a dependency of your
application, even if your application uses something completely different.

A bigger problem comes up when your application *is also* using Devise. `spree_auth`'s configuration combined with your application's configuration for Devise may cause slowdowns or conflict with each other. This may not happen though, because the railtie's (i.e. `spree_auth`'s) initializers are run before the application's, and so it would take precedence.

For instance, we've had a couple of reports where the Devise configuration in <a href='https://github.com/resolve/refinerycms'>RefineryCMS</a> have been conflicting with Spree's authentication.

Finally, by having two different User models (one in the application and one in the engine), it doesn't allow users to be shared
across the two components. This means that you would need to modify Spree to work with your application or your application to work
with Spree, which is not the ideal situation.

---

How we deal with this in Forem is that we simply *do not* include an authentication engine of any kind. This means that you can use
Restful Authentication or Authlogic or Devise or Clearance or Sorcery or something custom and we couldn't care less.

The way that this works inside Forem is that we ask two questions when `rails g forem:install` runs. The first one is effectively
"What is your `User` class?" and the second one is "What is `current_user` inside your application?". Forem then takes these values
and inserts code into `config/initializers/forem.rb` for the `Forem.user_class` setting and defines a method in the
`ApplicationController` class *of the application* called `forem_user` that simply calls the `current_user` method inside your
application.

The `Forem.user_class` setting is used in a couple of places. Firstly, it's used in the `Post` and `Topic` models to set up the
author/user associations so that we can track who created what topics or posts. Secondly, it's used in `Forem::ApplicationController` for
the `current_ability` method for the CanCan-backed authorization system that Forem uses.

The `forem_user` method is used to get at the current user of the request and allows Forem to check permissions and determine if a
user is logged in or not.

The application, not the engine, is what is providing the authentication engine. The application is *God* and should always have
final say on what is happening, not the engine itself.

---

I personally think Forem's approach is the best that we're going to get with engines now. This method allows an application to
provide the authentication engine and for the engine to hook into it easily enough.

It's my thinking that we should remove the `spree_auth` gem entirely and then rely solely on the application to provide a `User` (or
similar) class. The authentication parts of RefineryCMS (and engines in similar situations) should also be removed. The application is
what should have the say on what authentication engine to use, and not an engine.
