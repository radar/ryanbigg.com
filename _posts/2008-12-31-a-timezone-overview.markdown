--- 
wordpress_id: 411
layout: post
title: "How Rails Works #1: A Timezone Overview"
wordpress_url: http://frozenplague.net/?p=411
---
Today fowlduck and I were talking in the #rubyonrails channel and we both wondered about timezones and why they were so (apparently) screwy. It turns out all I (and he possibly also) forgot to do was to put <span class='term'>config.time_zone</span> in the <i>config/environment.rb</i>. So what does this mysterious method do? Well:
<h2>In Rails 2.2...</h2>
<ul>
  <li>1. <b>The <span class='term'>Configuration</span> Class</b><br />
This class begins all the way down on <a href='http://github.com/rails/rails/blob/2-2-stable/railties/lib/initializer.rb#L578'>line #578 of <i>railties/lib/initializer.rb</i></a> in the Rails source. This just simply defines a class in the <i>Rails</i> module called <i>Configuration</i>. What we can get really excited about is on <a href='http://github.com/rails/rails/blob/2-2-stable/railties/lib/initializer.rb#L748'>line #748</a> it defines an <span class='term'><a href='http://www.ruby-doc.org/core/classes/Module.html#M001704'>attr_accessor</a></span> for <span class='term'>:time_zone</span>. This, as you probably already know defines two methods a setter (<span class='term'>time_zone=</span>) and a getter (<span class='term'>time_zone</span>) in which we can store values.
  </li>

  <li>2. <b>Your <i>config/environment.rb</i> file</b><br />
By default this <span class='term'>time_zone</span> method will be set to nil. It's up to you to set it in your <i>config/environment.rb</i> file which you do by doing something along these lines:
<pre lang='rails'>
Rails::Initializer.run do |config|
  config.time_zone = "Adelaide"
end
</pre>

This will set the <span class='term'>time_zone</span> value to be the Adelaide Time zone, something like: <span class='term'>#&lt;ActiveSupport::TimeZone:0x30f4f8 @tzinfo=nil, @name="Adelaide", @utc_offset=34200&gt;</span>. You don't have to set it to Adelaide, just try your nearest major city and it Should Just Work &trade;. <u>If you <b>don't</b> set this in your <i>config/environment.rb</i> date and time values returned from the database will not be set to whatever time zone you specify.</u>
</li>

<li> 3. <b>Back to you, Jeff.</b>
When your application loads it processes the config/environment.rb file and runs the <span class='term'><a href='http://github.com/rails/rails/blob/2-2-stable/railties/lib/initializer.rb#L151'>initialize_time_zone</a></span> method which is defined <a href='http://github.com/rails/rails/blob/2-2-stable/railties/lib/initializer.rb#L496-508'>further down</a>.
This does all kinds of magic! Look at all the pretty sparkles! It firstly checks if you've set a time_zone in your <i>config/environment.rb</i> file and then if you have it sets the default time zone to be what you've specified. Additionally to this, it sets <span class='term'>time_zone_aware_attributes</span> to true so that when you do stuff like <span class='term'>Topic.last.created_at</span> it'll actually return the time zoned version of that time. It does this by calling into play <span class='term'><a href='http://github.com/rails/rails/blob/2-2-stable/activerecord/lib/active_record/attribute_methods.rb#L167-177'>define_read_method_for_time_zone_conversion(attr_name)</a></span> (click for juicy details) which either just returns the time or calls <span class='term'>in_time_zone</span> on the time returned which converts it into the time zone stored in <span class='term'>Time.zone</span> (which is <a href='http://github.com/rails/rails/blob/2-2-stable/activesupport/lib/active_support/core_ext/time/zones.rb#L15'>actually <span class='term'>Thread.current[:time_zone]</span></a> if there is one stored there or otherwise the <span class='term'>zone_default</span> which was originally set when we called <span class='term'>config.time_zone</span>! What a mouthful!

By default, ActiveRecord will store timestamps as UTC as shown by <span class='term'>ActiveRecord::Base.default_timezone = :utc</span>. If you don't specify a time zone in your <i>config/environment.rb</i> this value defaults to :local, so all times will be stored as the local time in your database.
</li>

<li> 4. <b> And then... </b> 
So, assuming you did as the above when you go into your script/console and type: <span class='term'>Topic.last.created_at</span> you'll get back the time when the topic was created relative to Adelaide. To change this, just redefine <span class='term'>Time.zone</span> by doing <span class='term'>Time.zone= "Paris"</span> and then doing <span class='term'>Topic.last.created_at</span> will give you time when the topic was created relative to Paris.
</li>
  
</ul>

<h3>Changelog</h3>

<strong>Updated on April 23rd, 2009</strong>
1. Fixed line number linkings, linking directly to 2-2-stable branch which, ideally, should now never change.
