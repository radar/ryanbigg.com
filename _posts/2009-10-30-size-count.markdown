--- 
wordpress_id: 732
layout: post
title: Size != Count
wordpress_url: http://frozenplague.net/?p=732
---
When using a has\_many :through in Rails with a counter\_cache an interesting thing can occur. When you call `size` on the association, it can return a seemingly incorrect number. This is caused by the following code in <em>activerecord/lib/has\_many\_through\_association.rb</em>:

<pre>
def size
  return @owner.send(:read_attribute, cached_counter_attribute_name) if has_cached_counter?
  return @target.size if loaded?
  return count
end
</pre>

It'll reach the counter_cache column which could be incorrect, giving you all the objects returned when you look up the association, but an invalid number. This was only in my tests where data was being created through Machinist. Just watch yourself for this, this is the second time it has caught me, and ideally the last.
