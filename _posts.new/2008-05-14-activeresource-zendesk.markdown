--- 
wordpress_id: 179
layout: post
title: ActiveResource & ZenDesk
wordpress_url: http://frozenplague.net/?p=179
---
With many, many thanks to Frederick Cheung, who without this would've been way more painful and time-consuming. My original question and our discussion can be found <a href="http://groups.google.ca/group/rubyonrails-talk/browse_thread/thread/49616be220fb8d1d">here</a>.

At my new job we signed up with <a href="http://zendesk.com">ZenDesk</a>, which acts as our helpdesk/ticketing system for our clients who sign up to our site and buy our product. Because ZenDesk uses emails instead of plain ol' usernames for authentication, Ruby chucked a fit when we tried doing stuff like:
<pre lang="rails">class User &lt; ActiveResource::Base
self.site = "http://ouremail@ourwebsite.com:ourpassword@ourplace.zendesk.com"
end</pre>
Ruby's URI class just didn't like that first @ sign in there! So Fred originally recommended we try to encode it, %40. That didn't work. Then the next morning Fred suggests doing this:
<pre lang="rails">class User &lt; ActiveResource::Base
self.site = "http://ourplace.zendesk.com"

def (self.site).user
"ouremail@ourwebsite.com"
end

def (self.site).password
"ourpassword"
end

end</pre>
And 'lo and behold the thing worked!

So for all you savvy kids using Rails' ActiveResource and trying to make it play nice with ZenDesk, that's how we did it.

Then I went a little further with the refactoring and just made a ZenDesk model:
<pre lang="rails">class ZenDesk &lt; ActiveResource::Base

self.site = "http://ourplace.zendesk.com"

def (self.site).user
"ouremail@ourwebsite.com"
end

def (self.site).password
"ourpassword"
end

end
end</pre>
And then got the models I wanted to inherit from that.
<pre lang="rails">class User &lt; ZenDesk
end</pre>
Brilliant!

Also one more note. If you're going through and testing out creating Organisations/Users in ZenDesk through ActiveResource, don't forget to delete them as you go! It's time-consuming clicking edit, and then the delete button for 50 odd objects... but of course you could do this:
<pre lang="ruby">for i in original_object_id..last_object_id
User.find(i).destroy
end</pre>
Which, if you did it, say, all in the same day like I did, should delete all the users within that range.
