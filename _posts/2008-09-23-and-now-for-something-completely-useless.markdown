--- 
wordpress_id: 254
layout: post
title: And Now For Something Completely Useless
wordpress_url: http://frozenplague.net/?p=254
---
<pre lang='rails'>class Model < ActiveRecord::Base
  has_many (Dir.entries("#{RAILS_ROOT}/app/models")-['.','..',"#{self.to_s.downcase}.rb"]).delete_if{|a|
File.directory?("#{RAILS_ROOT/app/models/#{a}")}.rand.gsub(".rb","").pluralize.to_sym
end</pre>
