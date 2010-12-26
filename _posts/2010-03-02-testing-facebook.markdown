--- 
wordpress_id: 825
layout: post
title: Testing Facebook
wordpress_url: http://ryanbigg.com/?p=825
---
<strong>I would strongly, strongly, strongly encourage people to now use <a href='http://github.com/intridea/omniauth'>OmniAuth</a> for all their Facebook needs.</strong>

We're currently adding Facebook integration to an existing application that uses Authlogic. That means adding a button that any user can press on the login form that then takes them to Facebook, signs them in and then lets them log into our site. For this purpose and the time being "Facebook integration" means only that: letting the user login with their Facebook details. For the Facebook side of things we're using <a href='http://github.com/mmagino/facebooker'>Facebooker</a> which is not the well-documented library we all would hope it is. Oh, and you <strong>cannot</strong> use it as a gem with Rails.

Also along with Facebooker we also use the <a href='http://github.com/kalasjocke/authlogic_facebook_connect'>Authlogic Facebook Connect</a> plugin to provide us with a button we use on our login form. It also provides us with a file called _xd\receiver.html_ in our _public_ folder which's use <a href="http://wiki.developers.facebook.com/index.php/How_Connect_Authentication_Works">is documented here</a>. 

We created our _application.html.erb_ using these key elements, as specified in the Authlogic Facebook Connect README:

    <html>
      <head>
        <%= javascript_include_tag :defaults %>
        <%= fb_connect_javascript_tag %>
      </head>
      <body>
        <%= fb_connect_javascript_tag %>
        <%= init_fb_connect "XFBML" %>
      </body>
    </html>

Our login page is nothing out of the ordinary save for this tag placed where we want the button to connect to Facebook:

    <%= authlogic_facebook_login_button :length => "long" %>

As stated in the <a href='http://wiki.developers.facebook.com/index.php/How_Connect_Authentication_Works'>Canonical Documentation</a> because we've generated the button the Javascript included into the layout will be executed when the user visits the page. This Javascript then calls the `FB.init("YOUR_API_KEY_HERE", "xd_receiver.htm");` which does some Facebook/Javascript magic I am still yet to comprehend. This voodoo eventually renders a button that your user can click. When your user clicks this button it opens a popup window that asks the user to log into Facebook if they aren't already, otherwise this will do a "seamless" login. We'll go with the first option here and assume the user hasn't logged in. But by the time you've read this, they have logged into Facebook and now the Javascript continues to execute, retrieving values from the popup window and stores them as cookies. After this is all "said and done" your form will be submitted and your app will carry on its merry way.

Here's the beginning of our Authlogic-juiced User model:

    class User < ActiveRecord::Base
      acts_as_authentic do |c|
        c.session_class = UserSession
  
        c.login_field = :email
        c.validate_login_field = false
        c.validate_email_field = false
        c.validate_password_field = false
  
        c.ignore_blank_passwords = false
      end

      # Validations for email based accounts
      with_options :unless => :facebook_uid do |u|
        u.validates_presence_of :email, :message => :missing_email

        u.validates_presence_of :password, :on => :update, :if => :require_password?, :message => "^You must enter a password."
      end

      with_options :unless => Proc.new {|u| u.email.blank? } do |u|
        u.validates_format_of :email, :with => Authlogic::Regex.email, :message => "^The email given looks invalid, please check for typos."
        u.validates_uniqueness_of :email, :message => :email_in_use
        u.validates_confirmation_of :email, :message => "^The emails given did not match."
      end
    end

As you can see here if `facebook_uid` is present we are not validating the presence of `email` or `password` for obvious reasons.

When your form is submitted it'll go a `create` action in a controller (we called ours `UserSessionsController`) and looks like this:

    class UserSessionsController < ApplicationController
      before_filter :check_fb, :only => :create
      #...
      def create
        @user_session = UserSession.new(params[:user_session])
    
        if @user_session.save && !@user_session.user.suspended?
          unless @user_session.user.facebook_uid.nil?
            @user_session.user.active = true
            @user_session.user.save
          end

          flash[:notice] = t(:msg_welcome)
          if @user_session.user.login_count > 1 && @user_session.user.last_login_at?
            flash[:notice] << " " << t(:msg_last_login, @user_session.user.last_login_at.to_s(:mmddhhss))
          end
          redirect_back_or_default root_url
        else
          #...
        end
      end
      #...
      private

        def check_fb
          if params[:user_session].nil?
            ensure_authenticated_to_facebook
          end
        end
    end


We have specific code here to activate a user if they log in through Facebook; we assume that if a person is logging in through Facebook that they are not an automated robot (as opposed to a manual one?) and they do not need a confirmation email sent. What's most exciting about this code however is *not* the create action, but the `before_filter` we run... erm, before... it.

As you can see, the `before_filter` calls `ensure_authenticated_to_facebook` which is a method from Facebooker, traditionally used itself as a `before_filter` but because we have the ability to log in with an email & password OR a facebook login, is called conditionally. That method looks like this:

    def ensure_authenticated_to_facebook
      set_facebook_session || create_new_facebook_session_and_redirect!
    end

This attempts the `set_facebook_session` method first:

    def set_facebook_session
      # first, see if we already have a session
      session_set = session_already_secured?
      # if not, see if we can load it from the environment
      unless session_set
        session_set = create_facebook_session
        session[:facebook_session] = @facebook_session if session_set
      end
      if session_set
        capture_facebook_friends_if_available! 
        Session.current = facebook_session
      end
      return session_set
    end

We do not have a current session so it'll go and call `create_facebook_session`:

    def create_facebook_session
      secure_with_facebook_params! || secure_with_cookies! || secure_with_token!
    end

So this uses three methods: `secure_with_facebook_params!`, `secure_with_cookies!` or `secure_with_token`. Remember what I said earlier about what happens when the user presses the button? No? Here's a refresher: it sets cookies. Not the edible kind, sadly. So the method that'll be used here is `secure_with_cookies!`. 

I feel now is a good time to show you the test we wrote.

    describe UserSessionsController do
      describe "create" do
        describe "facebook user" do
          it "creates account based on facebook details" do
            Facebooker.use_curl = false 
            FakeWeb.allow_net_connect = false
            FakeWeb.register_uri(:post, "http://api.facebook.com/restserver.php", :body => Rails.root + "spec/fixtures/get_users_info.xml")
      
            setup_fb_connect_cookies

            post :create

            response.should redirect_to(root_url)
            @assigned_user = assigns[:user_session].user
            @assigned_user.new_record?.should be_false
            @assigned_user.active.should be_true
          end
        end
      end
    end

The `Facebooker.use_curl = false` is only neccesary if you have the _curb_ gem installed. Hat-tip to <a href="http://ryanbigg.com/2010/03/testing-facebook/comment-page-1/#comment-34739">Balvig</a> in the comments!

We first disable internet connections using FakeWeb. We do this so we can stub out the response to Facebooker's internal call to `getUsersInfo` to Facebook and always return a valid user object. The fake XML <a href="http://gist.github.com/319392#file_get_users_info.xml"> can be viewed in this gist.</a>

After Fakeweb has done its thing we call the `setup_fb_connect_cookies` method which does exactly what it says on the box, it lives in the _spec/support/facebook\_helpers.rb_ file:

    def setup_fb_connect_cookies
      cookie_hash_for_auth.each {|k,v| request.cookies[ENV['FACEBOOK_API_KEY']+k] = CGI::Cookie.new(ENV['FACEBOOK_API_KEY']+k,v).first}
    end

    def cookie_hash_for_auth
      hash = {"_ss" => "not_used", "_session_key"=> "whatever", "_user"=>"77777", "_expires"=>"#{1.day.from_now.to_i}"}
      raw_string = hash.map{ |k,v| [k.gsub(/^_/, ''), v].join('=') }.sort.join
      actual_sig = Digest::MD5.hexdigest([raw_string, Facebooker::Session.secret_key].join)
      hash.merge("" => actual_sig)
    end

Why such complicated code? Well, this provides the cookies that Facebooker needs in order to log in. The final three lines in the `cookie_hash_for_auth` method is all about setting up a "signature" which Facebook parses in the parameters to ensure that they haven't been tampered with. The generation of this was ripped straight from the guts of Facebooker which uses (almost) the same code to generate an MD5 to verify the signature against.

In short: We now have cookies that our `post :create` is going to use. So, when this is triggered `secure_with_cookies!` does its thing:

    def secure_with_cookies!
        parsed = {}

        fb_cookie_names.each { |key| parsed[key[fb_cookie_prefix.size,key.size]] = cookies[key] }

        #returning gracefully if the cookies aren't set or have expired
        return unless parsed['session_key'] && parsed['user'] && parsed['expires'] && parsed['ss'] 
        return unless (Time.at(parsed['expires'].to_s.to_f) > Time.now) || (parsed['expires'] == "0")      
        #if we have the unexpired cookies, we'll throw an exception if the sig doesn't verify
        verify_signature(parsed,cookies[Facebooker.api_key], true)

        @facebook_session = new_facebook_session
        @facebook_session.secure_with!(parsed['session_key'],parsed['user'],parsed['expires'],parsed['ss'])
        @facebook_session
    end

This has now generated a value for `session[:facebook_session]`, a `Facebooker::Session` object. Great. The `@user_session` in our controller has a user method that returns a valid user and we ensure it's that way in the remainder of the controller test. Great, so that part works. Now about how *doing* something with the logged in user?

Well for that purpose, <a href="http://blog.eizesus.com/2010/02/facebooker-tips-1-session-expiry-cucumber-and-env-6-2-2010/">Elad Meidar wrote a blog post covering how to do it in Cucumber</a>. This consists of setting up your facebooker.yml to having a `cucumber` key share the configuration of the `development` key and a couple of steps:

    Given /^I am logged in as a Facebook user$/ do
  
      # Initializer facebooker session
      @integration_session = open_session
  
      @current_user = User.create! :facebook_id => 1
 
      # User#facebook_user returns a Facebook::User instance, i decided to mock the session in here since i am not
      # sure what the behavior might be if it will be in the actual model.
      @current_user.facebook_user.session = Facebooker::MockSession.create(ENV['FACEBOOK_API_KEY'], ENV['FACEBOOK_SECRET_KEY'])
      @current_user.facebook_user.friends = [ Facebooker::User.new(:id => 2, :name => 'Bob'),
        Facebooker::User.new(:id => 3, :name => 'Sam')]
      @integration_session.default_request_params.merge!( :fb_sig_user => @current_user.facebook_id, :fb_sig_friends => @current_user.facebook_user.friends.map(&:id).join(',') )
    end

This code sets the parameters on the next request and Facebooker accepts these and uses them to create a new `Facebooker::Session` object, which it stores in `session[:facebook_session]`.

The `open_session` method comes from Facebooker by placing this line in _features/support/app.rb_:

    require 'facebooker/rails/cucumber'

The `facebook_user` method on our `User` object comes from defining it on the `User` model:

<script src="http://gist.github.com/296758.js?file=user.rb"></script>

Now with the steps and correct requires in place, we have our feature:

    Feature: Facebook
      In order to use the site as a facebook user
      As a user
      I want to have already logged in with Facebook and be roaming the wide brown lands

      Scenario: logging into facebook
        Given I am logged in as a Facebook user
      	And I am on the homepage
        Then I should be on the homepage

This is just a silly example that ensures that the user is not redirected back to the login page if they are logged in as a Facebook user. I hope you write better features than this. This feature will fail for the time being because our `current_user` method only queries `current_user_session`, so we'll modify it to be this instead:

    def current_user
      @current_user ||= (current_user_session && current_user_session.record)
      @current_user ||= User.find_by_facebook_uid(session[:facebook_session].user.uid)
    end

Now we can use `current_user` to reference current Facebook users too, meaning our feature will now pass.

With a controller spec and feature passing, that's lunch!

<h3>For After Lunch</h3>

So how was lunch? I hope it was good. Since this is only a one-way kind of communication I can't accurately respond to whatever you're going to say. Sorry!

Right then! So our application is tested well enough that we know that we can log in using faked-out Facebook cookies, but does the actual real-world side of things work? Does clicking the button actually prompt the user to log into Facebook if they haven't already or just go through that whole section transparently and present them with an already logged in screen?

Chances are this is a big, gigantic, fat

<h3>No.</h3>

You'll more-than-likely run across an "Invalid parameter" issue as we had when we tried to use our application. The error code for this is 100.

So what's up?

Well, as it turns out, when you try to go to the login page for an application that hasn't yet been activated it just warns you that it hasn't been activated. I'm not quite clear on how Facebooker works in this particular section, but it is my understanding that the login page is supposed to take you to the application page. Let me explain in step-by-step kind of way. "application's page" means your site in this scenario. You've set this up by specifying the "Connect URL" in the "Connect" section of your Application Settings page to be the root-level of your site. So this is how Facebooker does its thing:

<ol>
<li>Facebooker grabs an auth_token using the `facebook.Auth.createToken` API method. This returns something like `72a910e1f24eb6034549d23cd2245f28`</li>
<li> This `auth_token` is then passed to `http://facebook.com/login.php` as a parameter, which is rendered in whichever fashion you wish. For all intents and purposes, our application renders it in another browser window.</li>
<li>The login.php page detects if you are logged out or in and does either:
  <li> If you're logged out of Facebook, prompts for an email and password. If you "get this right", Facebook sets up some cookies, links that `auth_token` to your Facebook user, and redirects you to the application.</li>
  <li> If you're logged in to Facebook, Facebook sets up some cookies, links that `auth_token` to your Facebook user, and redirects you to the application.</li>
</li>
<li>The cookies are then used to call `facebook.Auth.getSession` which, because you're now most-definitely logged into Facebook, will return a session object. Something that looks like:

<pre>
2.5KVyRHmZWBbOun8ZwDwQxg__.3600.1243290000-608966587\n  608966587\n  1268190000
</pre>
</li>

<li>Facebooker creates a `Facebooker::Session` object based on this return value which it stores in your application as `session[:facebook_session]`</li>

What could possibly go wrong is that if you have your application in "Sandbox Mode" (under "Advanced" in "Application Settings"), when you go to the login page you'll be shown the "This application is under construction" and therefore Facebook will not link your user account with the `auth_token` so when `facebook.Auth.getSession` tries to do what its name implies: it'll fail with "Invalid Parameter". Just be careful about that! It had us caught up for a day and bit, we didn't know about that option.

 I hope you found this as informative as I found it interesting to investigate.

