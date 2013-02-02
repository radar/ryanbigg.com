--- 
wordpress_id: RB-340
layout: post
title: About spec/support
---

I'm going to expand on a tweet I wrote this morning:

> Thinking more and more that spec/support is
> an anti-pattern. I don't want everything required for every test.

I came to this thought when I was working on sharing testing support code
between an engine and an application, for an example in Chapter 4 of
[Multitenancy with Rails](https://leanpub.com/multi-tenancy-rails). What I had
originally was a file in `spec/support` called `SubdomainHelpers`, defined like
this:

    module SubdomainHelpers
      def within_account_subdomain(&block)
        context "within a subdomain" do
          let(:subdomain_url) { "http://#{account.subdomain}.example.com" }
          before { Capybara.default_host = subdomain_url } 
          after { Capybara.default_host = "http://example.com" }
          yield
        end
      end
    end

This module is then used to extend the RSpec `describe` blocks, like this

    describe "User sign in" do
      extend SubdomainHelpers
      ...
    end

And then we can call `within_account_subdomain` whenever we need it.

---

My problem with this is that this file is required *all the damn time*, even in
tests which don't use Capybara. The culprit is this default line in
`spec/spec_helper.rb`

    Dir[File.dirname(__FILE__) + "/support/**/*.rb"].each {|f| require f }

This line is used for requiring all the files in `spec/support` so that you
don't have to. Seems like a good idea, but isn't once you have a ton of things
in `spec/support`.

Making it easy to require the file defining `SubdomainHelpers` in both the
engine and the application involves moving the helper in to the `lib` directory
of the engine, and then requiring that file in the appropriate places:

    require 'subscribem/testing_support/subdomain_helpers'

Even if we *weren't* using an engine and an application and just had the
application, I would much rather just be requiring just the files I need for a
test, like this:

    require 'support/subdomain_helpers'

Than having the full range of `spec/support` files loaded all at once on the
off chance a spec might need it. I wouldn't expect this to *dramatically* increase a spec suite's
run time, but it's got to be helping somewhat.
