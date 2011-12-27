--- 
wordpress_id: 1158
layout: post
title: The Rails 3 Upgrade
wordpress_url: http://ryanbigg.com/?p=1158
---
During the interim between GetUp and my-next-big-job I've spent the week at a place in Brisbane called <a href='http://ennova.com.au'>Ennova</a> hanging out with such talented people as <a href='http://twitter.com/ltw_'>Lucas Willett</a> and <a href='http://twitter.com/jasoncodes'>Jason Weathered</a>. During my brief stint I was <s>roped into</s> asked to help out with a Rails 3 upgrade. Here's a semi-detailed list of what we did in order to upgrade the existing Rails 2.3.8 application to Rails 3.0.1.

<h3>The Rails 3 Upgrade Handbook</h3>

<a href='http://railsupgradehandbook.com'>The Rails 3 Upgrade Handbook</a> by Jeremy McAnally contains invaluable information for helping ease the upgrade process between 2.3.x and 3.0. We referenced it a couple of times, but mostly played it by ear.

I warn you now: this is a huge post (around 4,000 words). I think it contains a lot of good information that could probably help you or someone you know upgrade their application to Rails 3. It was 5 days effort upgrading this application to Rails 3 for two people, but a large majority of that time was spent fixing up the tests for the application as some were not that well-written. Most of the code is good code, though, and that's really helpful when you're doing something like this. In this post there's only going to be mentions of things that are different for this particular application between Rails 2 and Rails 3 and the workflow we went through on each day during this effort.

Our plan of attack was to get at least `rails console` booting first, then make `rails console production` boot. Next, the application has both RSpec and test/unit tests as well as Cucumber features, so we chose to get the RSpec tests passing first, then the test/unit tests. If all of these tests passed then most of the Cucumber feature should fall in to place, as they did. The following task would be getting the Cucumber tests passing. During this whole process every time we came across a deprecation warning we would try to fix it.

<h3>Bundler</h3>

Before I came to Ennova they (like all smart / cool / awesome people I know) had already switched their 2.3.8 (I'm going to keep stressing this point) application over to using Bundler. It worked beautifully! If they hadn't done this then we would have to install the "rails_upgrade" plugin using this line:

    script/plugin install git://github.com/rails/rails_upgrade.git

And then run `rake rails:upgrade:gems` to switch the `config.gem` lines in the _config/environment(s)/*.rb_ files to `gem` lines in a _Gemfile_. There's other commands that this plugin provides to which we should have used to upgrade our application in retrospect, but I think not using them didn't slow us down *that* much. <a href='https://github.com/rails/rails_upgrade'>Check out the README here.</a>

Because they'd already done this we began the process of upgrading to Rails 3 began with this line in the <em>Gemfile</em>:

<pre>
  gem 'rails', '3.0.1'
</pre>

Then we needed to run `bundle install` and then we were on our way.

<h3>Monday</h3>

<strong>Partner: Lucas Willet</strong>

Most of the upgrade process is a matter of "following the bouncing ball". If we saw a deprecation warning, generally speaking it was explanatory enough that we were able to understand what it meant and then go about fixing it. The notes beneath are for those issues which were <em>not</em> purely deprecation warnings, but "gotchas". 

To "upgrade" the application, we begun by ensuring that everything was committed to a branch and that the application was stable. This application is a well-tested application (not 100% coverage, but getting there) and we assumed that if all the tests were passing on the 2.x version of the application then the goal to ensure that the Rails 3 application was upgraded is that all the tests should be passing too. If the application had any failing tests it would be priority #1 to fix these up before going through with the upgrade.

The application uses Git for version control so we checked out a new branch called "rails-3" and began our work. The next command we had to use was the `rails new .` from within the application itself which runs the Rails application generator on the current directory. This is where you have to be really careful that it doesn't override things such as the _app/controllers/application.rb_ file. If you've got version control then it's quite easy to check out this file, but if you miss it then it's difficult (as in, you'd have to generate another application and copy over the important bits) of a file if you press the wrong key during this part. Be very careful.

Our first test was to see if we could get `rails console production` running which would mean that the application was at least booting in production mode, then we would move on to getting the tests to pass. the "production" environment is very similar to the "test" environment and although we *could* have used the "test" environment, we wanted to make sure that all the production-environment code was running. When we ran this command, it bombed as expected. **No upgrade is smooth.**

The first couple of errors we encountered we for the `acts_as_archive` and `searchlogic` gems. I don't have the errors to hand right now, but they were show-stoppers. Quite a lot of the errors we encountered were because we were using older versions of gems, or that the gems had not been updated on their "canonical" repositories so we had to find forks. These were both this kind of error.

`acts_as_archive` was easy enough to upgrade, we found <a href='http://github.com/xxx/acts_as_archive'>a fork by xxx</a> for it and pointed our Gemfile at that. We found out that the _gemspec_ wasn't quite right (it referenced a non-existant `rails` directory) and so we committed a patch to make it stop displaying a warning for it and xxx was kind enough to merge it.

Then there was Searchlogic. What a gigantic clusterfuck of code. I don't blame him for writing such terrible code, it was written before ARel existed and ARel does effectively most of what Searchlogic does anyway. I'm sure <a href='http://github.com/binarylogic'>binarylogic</a> has the best intentions at heart, but his code is really fucking confusing for me. We also found a <a href='http://github.com/railsdog/searchlogic'>Rails 3 compatible fork of Searchlogic by railsdog</a> and it worked for most cases. We ended up chucking it out and writing our own scopes using ARel (which, if at all possible, has now made me <strong>more</strong> in love with Aaron Patterson), including a custom <a href='https://gist.github.com/663752'>module of our (Jason and myself) own called `WildcardSearch`</a>. This allows us to search for keywords in specific fields of the table we're looking up in, and allows us to also do queries on associated records too. Check out the code, it's great stuff.

In the application there was a _config/preinitializer.rb_ which was being used for setting up Bundler, as well as defining constants or changing things such as the default date formatting in the application. For Rails 2.3.8, you need the _config/preinitializer.rb_ to load Bundler, but because we upgraded to Rails 3 this part of the file was now redundant... but where would you put the constants / settings? We decided it would be best to move them into an initializer, which involved quite simply creating a new file at _config/initializers/default.rb_ and moving the code across. Generally speaking, any code that sets up your application's environment should now be placed in _config/initializers_, not _lib_.

Next up, in _config/environments/production.rb_ we set the `config.active_support.deprecation` to `:notify` so that when the application was running in production mode (like when we were running `rails console production`) it would show us the deprecation warnings in the console rather than hiding them. We also set this same setting to `:stderr` in the _config/environments/test.rb_ and _config/environments/development.rb_ files. Also in these files there was reference to an old setting called `consider_all_requests_local`, which we removed reference to.

The first deprecation warning that came up when `rails console production` decided it wanted to start booting our application was that the syntax in our routes file was deprecated. This was because we were using the deprecated mapper, which in simple terms meaning that our routes went like this:

    ActionController::Routing::Routes.draw do |map|
      map.root :controller => "welcome", :action => "index"

When they should be something like this:

    Rails.application.routes.draw do
      root :to => "welcome#index"

Ahh, much better! This is where we stuffed up, we should have run the `rake rails:upgrade:routes` command *before* we ran `rails new .` because the rails upgrade plugin only works on a Rails 2 application. We spent a couple of minutes going through this file fixing up all the lines in this file to use their new syntax. Whilst it's handy to know how each of the methods map across between Rails 2 and 3, it's also good to know that if you don't know what a route *should* be in Rails 3 that you can reference the <a href='http://guides.rubyonrails.org/routing.html'>Routing Guide</a>. The current (as-of-writing) gem version for _declarative\_authorization_ is 0.5 and it uses this old, deprecated routing syntax too. Thankfully sttfn has updated his gem like all good gem authors *should*, and we were able to load the gem straight from GitHub with this line:

    gem 'declarative_authorization', :git => "git://github.com/stffn/declarative_authorization"

The next warnings when running `rails console production` was that we were using `named_scope` when in Rails 3 the correct method is simply `scope`. We did a find-and-replace to fix these up, only to run `rails console` and to find out that `authlogic` this time was the one throwing the remaining warnings. I'd already done an upgrade at GetUp from Rails 2 to Rails 3 and because binarylogic is inattentive of his gems I went about doing an upgrade for it to make it work with Rails 3, resulting in <a href='http://github.com/radar/authlogic'>my fork of authlogic</a> which should have all the deprecation warnings fixed.

More ActiveRecord deprecations were next, with a couple of callbacks in our application defined like this:

    def after_update
      # do something
    end
    
Other callbacks like `before_create` and `after_create` existed too. Rather than defining the callback methods like this, the correct way in Rails 3 to define these is to define them as methods (private ones for bonus points) and then use the callback to call them, like this:


    after_update :do_something
    
    def do_something
      something.do!
    end
    
It's best practice to define the callbacks like this because you may have multiple callbacks you want to run after a record has been updated, or created or whatever. 

It was after this that our `rails console production` booted with no errors. Great! The application has RSpec and test/unit tests, and I'm very partial to RSpec so we tried running it and it bombed too. We bumped the version number of `rspec-rails` up to 2.0.1 in the _Gemfile_, ran `bundle install` again and then tried running the tests. They failed because of this error:

    no such file to load -- spec
    
We had to change the requires in _spec/spec\_helper.rb_ from this:

    require 'spec/autorun'
    require 'spec/rails'
    require 'spec'
    
To this:

    require 'rspec/autorun'
    require 'rspec/rails'
    require 'rspec'
    
Also in this file, the `Spec::Runner` constant doesn't exist, and this is used for this line further down in the file:

    Spec::Runner.configure do |config|
       ...
    end
    
RSpec is now configured using the `RSpec` constant, so the above lines are now:

    RSpec.configure do |config|
      ...
    end

At this point RSpec was launching and we were informed of our next deprecation warning: the `cache_template_loading` setting for the application configuration (ours was in _config/environments/test.rb_) has been deprecated, and so we had to remove it. After this our specs were at least running (but not all passing), and so we decided we'd come back to them after we attempted to get the test/unit tests to pass. Just like `rails console` and the RSpec tests before them, they bombed too.

This time it was due to this error:

    no such file to load -- test_help
    
To be honest, I don't use test/unit to test Rails applications, I just hate it. I was pairing with Lucas on the application and he'd been brought up to only ever use RSpec and Cucumber, so he was just following my lead on this one. Then I made a bad mistake: **I removed the test_help line**. 

<small>We found out a few days later that this file is actually now at `rails/test_help`. This file is incredibly important for transactions in tests and it wasn't until Wednesday when we fixed this problem. Don't make the same mistake as us, it's important!</small>

In quite a lot of our test/unit tests we had this line:

    include ActionController::Assertions::SelectorAssertions

This module has now been moved into Action Dispatch and so the correct `include` is this:

    include ActionDispatch::Assertions::SelectorAssertions

The rest of Monday was spent working on writing the `WildcardSearch` module and getting stuck on a little bug with it.

<h3>Tuesday</h3>

<strong>Partner: Jason</strong>

This was the first day that I got to pair with <a href='http://twitter.com/jasoncodes'>Jason Weathered (@jasoncodes)</a> and we carried on the good work that Lucas and I did the day before. Jason's been doing Rails for about a year now but is scarily on or very near my level. Dude is amazing.

The first problem we fixed on Tuesday was that `rake spec` was running, but not returning anything. It turns out that it this is because we had `rspec-rails` in the `:test` group which means that its rake tasks were only being loaded in the `test` environment, where by running `rake spec` we need them to exist in the `:development` group. Moving this gem into a group block like this:

    group :development, :test do 
      gem 'rspec-rails', '2.0.1'
    end

This makes RSpec's rake tasks available in the `development` environment so we were able to run `rake spec.` All of Tuesday was spent trying to get the RSpec tests to pass once again. 

With the forked version of Searchlogic we were using, our `*_like_any` methods like the one used in this method:

    def text_contains(text)
      name_or_description_or_optional_originator_username_or_status_like_any
    end
    
Just weren't working. The methods were apparently undefined. The intention of this method is to find an Event with a name or description containing keywords. Let's assume that `text` in this context is "foo bar", the query the `like_any` method uses here will look up an `Event` record which has a name containing either foo *OR* bar, or a description containing either foo *OR* bar, or a related user who's username contains either foo *OR* bar. It's a messy query, and this Searchlogic method generated it for us. I'm not going to post the mess here. We replaced this method with v1 of our `WildcardSearch` module, the end-result (on Thursday) looking like this:

    def text_contains(text)
      self.includes(:originator).wildcard_search(:name, :description, { :originator => :username })
    end
    
We use `includes` here and pass it an association name. ARel's really smart and will know if we use the association name here what table to join. Even better than that, when we use a `where` later on in that same query, it will use a `LEFT OUTER JOIN` to join that table and run the query on the `events` and `users` tables. ARel is extremely capable of doing what Searchlogic did, it's Rails 3 compatible and it's supported by somebody who's fairly active in the community: Aaron Patterson. It was about this moment where we decided to scrap all usage of Searchlogic in our application favour of ARel. After this replacement, quite a few of our failing specs were passing.

A large majority of this day was spent cherry-picking off failing specs. The first of these was that our tests making sure the validations were in place were checking that the error message contains a string:

    thing.errors[:user_id].should == "has already been taken"

When in Rails 3, errors[:attribute] now returns an `Array`. The Rails 3 correct version of this is:

    thing.errors[:user_id].should == ["has already been taken"]
    
Fixing this fixed up even more of our specs, but we still had work to go. During the running of our specs we encountered a deprecation warning with our mailer:

    Notifier.deliver_confirmation_instructions is deprecated, use Notifier.confirmation_instructions.deliver instead.
    
We fixed this up nice and quickly and looked through the application for `deliver_` and fixed those deprecations up too. Personally I prefer to use the `deliver!` alias method as a "destructive" / "undoable" method. 

The next issue we came across was to do with a little change between Rails 2 and 3 in regards to partial rendering. It had to do with a line like this:

    render :partial => "some/partial", :collection => @things
    
In Rails 2, when you pass the `:collection` option to `render` like this, each of the objects are passed to the partial as `object`. In Rails 3, this changes to be the name of the partial itself mainly because now you can do things like this:

    render @things
    
Let's assume for the time being that the `@things` variable is a collection of `Thing` objects. When you call `render @things` this will render, by default, the partial at _app/views/things/\_things.html.erb_. The objects of the collection are then passed through as the local variable `thing`. Our problem was that we were using the Rails 2 line, and so Rails 3 was assuming that we wanted the variables still called after the partial. To give the variables the right name we use lines like this:

    render :partial => "some/partial", :collection => @things, :as => :other_thing
    
Now the objects will be available in the partial as `other_thing`. This fixed most of the view breakages, although we had another big one coming up.

That was the `nested_layouts` gem which is no longer compatible with Rails 3. To fix this, we used <a href='http://guides.rubyonrails.org/layouts_and_rendering.html#using-nested-layouts'>this section</a> from the bottom of the Layouts and Rendering guide for Rails 3. I think this is a much more elegant solution to the `nested_layouts` hackery.

After fixing *that* test, the next problem was that one of our files in _lib_ was not being loaded. This is because in Rails 2 the files in _lib_ are autoloaded, where in Rails 3 you must manually require them. Or at least you would if you didn't have this option in _config/application.rb_:

    config.load_paths += %W( #{config.root}/lib )
    
If you wanted to add more directories to be autoloaded just add them to this array. With this small change we fixed some more "broken" tests.

The next problem was that we were getting this error in some of our views:

    undefined local variable or method `form_remote_tag'

In Rails 2 the `form_remote_tag` and related methods have been moved out into a plugin called `prototype_legacy_helper`. We installed this plugin using this command:

    rails plugin:install git://github.com/rails/prototype_legacy_helper
    
After installing this plugin our tests were *still* failing. We later found out that it was a bug with `prototype_legacy_helper` itself so I asked Jose Valim (the Rails core member) who maintains it. He replied "I don't know". Uh oh. So Jason and I fixed the bug and in doing so I gained commit rights to the project. Therefore I suppose I'm now the maintainer of it. If you want a bug fixed in it send in a patch and I'll apply it.

That's how we wrapped up Tuesday.

<h3>Wednesday</h3>

<strong>Partner: Jason</strong>

Jason and I were pairing on Wednesday too. By this point, we'd fixed the major issues with the application and were just going through the deprecation warnings in the application. A lot of the changes for this day were fixing deprecation warnings in the application, and so this day may seem like we didn't do much, but we did quite a bit.

One of the major changes was that now any helper that outputs something in a view uses the `<%=` ERB tag, rather than `<%`. The latter's going to be deprecated in Rails 3.1 so it's best that we switch this over. Most of this happened on the `form_for`, but we had a couple of `content_tag`s that were doing it too.

We started off the day by realising that we didn't need the _config/environments/cucumber.rb_ file any more, Cucumber now runs within the "test" environment rather than its own special "cucumber" environment. This also means that we could remove the `cucumber` key from _config/database.yml_ as that database setting is never used.

A couple of our functional tests had referenced a constant -- `ActionController::TestUploadedFile` -- which is now available in Rack instead as `Rack::Test::UploadedFile`. There was also some tests referring to fixtures which we converted over to using Factory Girl's factories.

We also had a plugin which had its _tasks_ folder in the root of the directory, where Rails 3 expects it to be in _lib/tasks_. It was a plugin of our own making so we moved this folder into its proper spot.


The application Sass extensively, so when we tried the application through `rails server`, it created new files at _public/stylesheets_ for the parsed Sass stylesheets. This is incorrect, as the Hassle gem we had installed should have been putting them into a _tmp_ folder and reading it from there because this application is deployed on Heroku. To fix this, we changed the `gem` specification of hassle in our _Gemfile_ to this:

    gem 'hassle', '0.0.1', :git => 'git://github.com/fphilipe/hassle.git'

Next, we created an initializer to load Hassle in as a middleware, called _config/initializers/hassle.rb_:

    Rails.configuration.middleware.use Hassle

With fphilipe's fork of `hassle`, we were able to get the stylesheets to go in the correct directory.

At the end of Wednesday, Jason and I came across a problem where a `flash[:notice]` was seemingly being lost and we spent the last half-an-hour trying to figure out why, to no avail.

<h3>Thursday</h3>

<strong>Partner: Lucas</strong>

On Thursday on the way in I talked to Lucas about Wednesday night's problem and suggested it could be a double redirect as I had seen it happen before on an application. Turns out that was the problem, and we used `flash.keep` to keep the flash for the next request. With this final little change, all the test/unit tests, functionals and RSpec tests were passing. Time to get the Cucumber features to pass.

One of the little minor-changes-that-breaks-everything was that in Rails 2 the submit button for a form, if not given an argument, defaulted to "Save changes". In Rails 3, this now defaults to either "Create [Object]" where [Object] is the class name of the form's object, or "Update [Object]". The view inspects the model object it's given to determine what the button should display! I think this is much better, but it just about broke The Everything. We went through the features and did a manual find-and-replace for all these occurrences and fixed them up.

Next, we had a helper which was outputting HTML as a string. This is problematic because in Rails 3, all HTML-as-a-string is marked as unsafe, and is escaped. To fix this we used `html_safe` on the return value of this helper. There was also another helper in this file which we fixed up a little later on too.

The next deprecation warning we came across wasn't to do with Rails, but Capybara. It was this:

    DEPRECATED: #click is deprecated, please use #click_link_or_button instead

We found the offending step and changed it to use this new method.

It was at about this point that we decided to scrap Searchlogic. On our `Person` model we had a boolean field called `active` which Searchlogic should have been defining a scope much like this for:

    scope :active, where(:active => true)
    
Sadly, this wasn't working. My suspicion was that it was defining it something like this:

    scope :active, where(:active => 't')

or

    scope :active, where(:active => 'true')
    
As I stated before, Searchlogic is a clusterfuck of a codebase and so I didn't really want go hunting in there. I also said before that ARel does exactly what Searchlogic did, so we scrapped Searchlogic. A quick run of the RSpec tests picked up any occurrences where we removed Something Important and we re-implemented the scopes with ARel. Probably took us all of 10 minutes.

In some custom code we had this:

    some_association.scoped(:include => :children)
    
It took me a little while before I realised that you can just use ARel for this too:

    some_association.includes(:children)

It was just one of those way-too-obvious fixes that you overlook initially and then gape in awe when you write it.

<h3>Friday</h3>

<strong>Partner: Jason</strong>

The final day!

We had some features that used the `WildcardSearch` module that were failing, even though we were *positive* it was correct. Turns out it wasn't case-insensitive! Also turns out that Rails 3.0.1 (well, actually the version of ARel that *comes with* Rails 3.0.1), doesn't support case-insensitive matching with the _matches_ method. Thankfully there's a smart-cookie out there who's written <a href='https://rails.lighthouseapp.com/projects/8994/tickets/3174-add-support-for-postgresql-citext-column-type'>a beautiful patch</a> for it, <strong>but it only works with PostgreSQL</strong>. That's fine, we're smart so we use PostgreSQL. We used the patch's code in an initializer and it worked flawlessly.

During the running of our tests, we used `Then show me the page` **a lot**. This resulted in lots of _capybara-\[timestamp\]_ files in the root directory. To fix this little problem, we put this code in our _features/support/app.rb_ file:

    Capybara.save_and_open_page_path = Rails.root + 'tmp'

All fixed!

One of our actions returned two formats: a `html` version and a `pdf` format. In the `pdf` `respond_to` block the code looked like this:

    @template.template_format = :html
    kit = PDFKit.new(render_to_string)

It turns out that `@template` is no longer an accessible-from-the-controller variable. Who'd have thunk it? To work around this problem, we had to use the (undocumented! grr) `:action` option for `render_to_string`, changing the final line to this:

    kit = PDFKit.new(render_to_string(:action => 'print.html.haml'))

We simply wanted the `html` version of this template, where as this code was trying to render the `print.pdf.erb` template which simply didn't exist.

The next issue was that we were using `find_or_create_by*` in a step like this:

    role = @project.roles.find_or_create_by_name(role_name, :category => category)

This syntax isn't supported in Rails 3 (it thinks that `:category` is a key like `:joins` or `:includes`) and so we had to change it to the way-more-verbose this:

    role = @project.roles.find_by_name(role_name) || @project.roles.create!(:name => role_name, :category => category)

That was the final Rails 3-caused issue that we came across on Friday, and by 4pm we had all the Cucumber features, RSpec specs, and test/unit tests all passing. Everything worked.

<h3>So now what?</h3>

Well, Ennova's not going to deploy this application directly to production just yet. I'd say they should give it a week on staging so that one of the business guys can go through the application and make sure it's working as intended. The application isn't *completely* covered in tests, so there's bound to be something we missed out. For the most part though, it's a fully-functional Rails 3 application working nearly-exactly like it did in Rails 2.

A lot of the upgrading work was done on Monday and Tuesday, with quite a large majority of the remaining time spent just fixing deprecation warnings in our application or making the tests better. All in all, I think it went very well. 

I hope this helps somebody out there get up the nerve to upgrade their application to Rails 3. It's stable, it's proven to work (Gemcutter, for instance, runs Rails 3) and it's awesome. Also, with all <a href='http://edgeguides.rubyonrails.org/3_0_release_notes.html'>the new features in Rails 3</a>, how can you resist?
