--- 
wordpress_id: 718
layout: post
title: Banning Users Using Middleware
wordpress_url: http://frozenplague.net/?p=718
---
<a href='http://bjeanes.com'>Bo Jeanes</a>, a coworker at Mocra, recently implemented a way to ban people on one of his side projects <a href='http://dearqut.com'>DearQUT</a> because somebody was posting nasty messages. We were talking earlier today about it and the topic of using a middleware came up since we "don't want to waste resources on that asshole". So I thought I'd investigate to to see how easy it is to make a middleware in Rails, turns out it's <strong>very easy!</strong>. If you don't like reading blog posts, I have <a href='http://github.com/radar/hammer'>sample Rails application</a> containing the very same source code I used for this blog post. This contains also the "Special Github" extras like an admin section for adding/editing/deleting banned IPs! I also "cheated" by stealing elements from the <a href='http://railscasts.com/episodes/151-rack-middleware'>Railscast on Rack Middleware</a>. 

<h3>The Ban Hammer</h3>
First off I generated a model called <span class='term'>BannedIP</span> by running <span class='term'>script/generate model BannedIP ip:string</span> and ran <span class='term'>rake db:migrate</span> to create the database and the <em>banned_ips</em> table.

After that, I made a file called <em>lib/hammer.rb</em> and it goes a little like:

<pre lang='rails'>
class Hammer
  def initialize(app)
    @app = app
  end
  
  def call(env)
    if BannedIP.find_by_ip(env["REMOTE_ADDR"])
      file = "#{RAILS_ROOT}/public/banned.html"
      [403, {"Content-Type" => "text/html" }, [File.read(file)]]
    else
      @status, @headers, @response = @app.call(env)
      [@status, @headers, self]
    end
  end
  
  def each(&block)
    @response.each(&block)
  end
end
</pre>

Eagle-eyes will see that this is almost a blatant rip-off of Ryan Bates' code. Ignore that part. Admire that I call <span class='term'>BannedIP.find_by_ip(env["REMOTE_ADDR"])</span> which will return an <span class='term'>BannedIP</span> object if one exists, otherwise it'll return <span class='term'>nil</span>. in the case that someone's banned then it'll show them a very lightweight page with "You have been banned from this site." and they'll feel guilty and stuff <small>(this feature actually coming in v2)</small>.

Now to use this middleware you have to add <span class='term'>config.middleware.use 'Hammer'</span> to your <em>config/environment.rb</em> file and (of course) restart the server. Every request will of course query the database once more which, if you're running a <s>large</s> <s>big</s> HUGE site can lead to performance issues.

Of course you could just use <a href='http://www.netfilter.org/'>iptables</a> and do something like <span class='term'>iptables -I INPUT -s 25.55.55.55 -j DROP</span>, but then they won't be told *why* they're banned.


