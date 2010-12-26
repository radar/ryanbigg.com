--- 
wordpress_id: 193
layout: post
title: I am so freaking awesome
wordpress_url: http://frozenplague.net/?p=193
---
<pre lang='rails'>
  (Dir.entries("#{RAILS_ROOT}/app/models") - [".","..",".svn"]).each do |model|
    has_many model.split(".").first.pluralize.to_sym, :foreign_key => "owner_id"
  end
</pre>

I tried adding:

<pre lang='rails'>
 if model.classify.is_a?(ActiveRecord::Base)
      <<-EVAL
      class #{model.classify}
        belongs_to :owner
      end
      EVAL
    end
</pre>
too, but Rails didn't like that.
