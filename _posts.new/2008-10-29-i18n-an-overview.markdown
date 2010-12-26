--- 
wordpress_id: 336
layout: post
title: "I18n: An Overview"
wordpress_url: http://frozenplague.net/?p=336
---
Welcome to yet another overview, this time it's on the new I18n features in Rails 2.2 which you can install by typing <span class='term'>gem install rails -s http://gems.rubyonrails.org -v 2.2.0</span>.

Any mention of the <span class='term'>t</span> method in this guide are also spots where you can use <span class='term'>translate</span> too, they are just aliased methods (t is aliased to translate), it's just much easier (for me) to type t than it is to type translate. Please excuse my laziness.

I've begun adding in the translation calls for rboard in my <a href='http://github.com/radar/rboard/tree/radar'>personal branch on GitHub</a> and today I would like to show you how I've done it.

Firstly I have added these two lines to my <i>config/environment.rb</i>:

<b>config/environment.rb</b>
<pre lang='rails'>
I18n.load_path = Dir.glob("#{RAILS_ROOT}/locales/*.rb")
I18n.default_locale = "en-AU"
</pre>

This tells rails to load the translation files (aka locale files) from the locales directory in the root of my rails app, and they are in a ruby format. Alternatively you could load yaml files. this also tells it to set the default locale as "en-AU", which will load <i>locales/en-AU.rb</i> by default.


My (incomplete) translation file looks like this:
<b>locales/en-AU.rb</b>
<pre lang='rails'>
{
  :'en-AU' => {
   :forum_heading => "Forum",
   :topics_heading => "Topics",
   :posts_heading => "Posts",
   :last_post_heading => "Last Post",
   :no_forums => "There are no forums.", 
   :administrator_should_create_forum => "Maybe an administrator should create one.",
   :you_should_create_forum => "Maybe you should create a forum.",
   :forum_statistics => "Forum Statistics",
   :posts_per_topic => "Posts per topic",
   :recent_users => "Users on in the last 15 minutes",
   :registered_users => "Registered Users",
   :home => "Home",
   :edit_profile => "Edit Profile",
   :member_list => "Member List",
   :search => "Search",
   :new_message => "new message",
   :logout => "Logout",
   :time_now => "The time is now",
   :viewing_forum => "Viewing forum",
   :new_topic => "New Topic",
   :moderation_heading => "Moderation",
   :topic_heading => "Topic",
   :replies_heading => "Replies",
   :views_heading => "Views",
   :author_heading => "Author",
   :ago => "ago",
   :by => "by"
  }
}
</pre>

When I have a string I want translated in my app I will simply call stuff like <span class='term'>t(:author_heading)</span> and Rails will look up the correct translation for it, which in this case is just "Author".

Now if I had another translation file, say <i>locales/es.rb</i> and I had Spanish users on rboard they could select a locale from their profile page and that would store it as a string on their user record. To translate this, we can use a before_filter on the application controller:

<b>app/controllers/application.rb</b>
<pre lang='rails'>
class ApplicationController < ActionController::Base
  before_filter :set_locale
  def set_locale
    I18n.locale = current_user.locale if logged_in?
  end
end
</pre>

This will set the locale to whatever the user has set, providing that they are logged in.

<h3>Interpolation</h3>

If you wish to insert a value into a translation you can use interpolation. To do this you can specify the t method call like this:

<b>in a i18n-friendly file somewhere</b>
<pre lang='rails'>
<%= t(:welcome, :user => current_user.login) %>
</pre>

And then in your locales file specify this:

<b>locales/en-AU.rb</b>
<pre lang='rails'>
:welcome => "welcome {{user}}!"
</pre>

And the output of the translation will now be "welcome Ryan!" or whatever the user login was.


<h3>Counting</h3>

If you have a translation such as <span class='term'>:x_new_messages</span> in your translation file and you want the output of this translation to be correctly pluralized you can pass the count option to this:

<b>In any <span class='term'>t</span> method supporting files</b>
<pre lang='rails'>
<%= t(:x_new_messages, :count => current_user.messages.size) %>
</pre>

The <span class='term'>x_</span> prefix to our translation is not important, it's just there to show us that this translation may return different results depending on the count that is passed to it.

Then in your translation file you can do:

<b>locales/en-AU.rb</b>
<pre lang='rails'>
:x_new_messages => {:zero => 'No new messages', :one => 'One new message', :other => '{{count}} new messages'}
</pre>


And depending on the value of count it will return one of those three outcomes.

<h3>Forcing a Locale</h3>

If you want to force a locale on a single translation you can do this by specifying the <span class='term'>:locale</option> to the t method call like so:

<pre lang='rails'>
<%= t(:english, :locale => "en-AU") %>
</pre>

And this will always show the en-AU translation of the english key in the en-AU.rb locale file.

<h3>Alternative Translations</h3>

If one of your translations does not match like:

<pre lang='rails'>
<%= t(:norsk) %>
</pre>

You can have I18n fall back to any number of other translations:

<pre lang='rails'>
<%= t(:norsk, :default => [:norwegian, :up_north, :northwards, "norway"]) %>
</pre>

I18n will attempt to get a default translation from the options specified and will select the first one. If all translations failed then the string version, "norway" will be outputted.

<h3>Retrieving Multiple Translations</h3>

To get multiple translations back at the same time you can specify an array as the first argument to the t method.

<pre lang='rails'>
<%= t(:forums, :topics) %>
</pre>

Assuming you have correct translations for forums and topics you will get the translated versions returned in an array. Assuming you don't have the correct translations for forums OR topics you will get back a string version of whatever translation is missing, possibly wrapped in a <span class='term'>&lt;span class='translation_missing'&gt;&lt;/span&gt;</span>.


Further translation files can be found at <a href='http://github.com/svenfuchs/rails-i18n/tree/master/rails'>Sven Fuch's Github Repository</a>
