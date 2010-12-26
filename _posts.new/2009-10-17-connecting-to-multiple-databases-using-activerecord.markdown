--- 
wordpress_id: 726
layout: post
title: Connecting to Multiple Databases Using ActiveRecord
wordpress_url: http://frozenplague.net/?p=726
---
You can call <span class='term'>establish_connection</span> with the key that points to another database config in your <em>config/database.yml file</em>

<pre>
class Person < ActiveRecord::Base
  establish_connection(:hr)
end
</pre>

<pre>
class Ticket < ActiveRecord::Base
  establish_connection(:bug_tracker)
end
</pre>

If you have a whole bunch of models that need to connect to another database:

<pre>
class HR < ActiveRecord::Base
  establish_connection(:hr)
end

class People < HR
  # ...
end

class Resource < HR
  # ...
end
</pre>
