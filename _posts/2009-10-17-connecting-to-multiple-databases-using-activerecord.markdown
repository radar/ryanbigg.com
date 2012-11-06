--- 
wordpress_id: 726
layout: post
title: Connecting to Multiple Databases Using ActiveRecord
wordpress_url: http://frozenplague.net/?p=726
---
You can call `establish_connection` with the key that points to another database config in your `config/database.yml`

    class Person < ActiveRecord::Base
      establish_connection(:hr)
    end

    class Ticket < ActiveRecord::Base
      establish_connection(:bug_tracker)
    end

If you have a whole bunch of models that need to connect to another database:


    class HR < ActiveRecord::Base
      establish_connection(:hr)
    end

    class People < HR
      # ...
    end

    class Resource < HR
      # ...
    end
