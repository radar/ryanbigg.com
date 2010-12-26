--- 
wordpress_id: 230
layout: post
title: Ubuntu, Rails, Apache, Passenger, Capistrano & You
wordpress_url: http://frozenplague.net/?p=230
---
<h2>Now What?</h2>

So you've got a freshly installed copy of Ubuntu Server, you've logged into the server with your intent being to create a Rails server... only you don't know how or you're not entirely sure. Good thing this guide's here to guide you through that.</h2>
Right now you should have a prompt like this: <span class="term">you@server:~$ _</span>. If you don't, I can recommend one of three things:
<ol>
	<li>Turn on your screen.</li>
	<li>Log into the server (if it's remote)</li>
	<li>Install the operating system first.</li>
</ol>
Other than that, you're on your own.

I would recommend running <span class="term">sudo apt-get dist-upgrade</span> right now. This should only take a few seconds as it downloads and installs all the packages.

Firstly you'll want to update the sources for your system by running <span class='term'>sudo apt-get update</span>, this is so Ubuntu knows where to find the packages. (<a href='http://frozenplague.net/2008/09/ubuntu-rails-apache-passenger-capistrano-you/comment-page-1/#comment-8522'>Props to Ryan G for his comment)</a>

The next thing we want to install is build-essential, which can be done by typing: <span class="term">sudo apt-get install build-essential</span> and this will install all the essential packages you need in order to compile stuff on your machine.

We'll now want to add a user that we can deploy to. We'll call this user deploy and we'll add it using <span class="term">useradd deploy -m</span> with the -m option creating the /home/deploy directory for us.
<h2>MySQL users</h2>
You'll need to install MySQL by issuing <span class="term">sudo apt-get install mysql-server</span>
<h2>PostgreSQL users</h2>
You'll need to install PostgreSQL (unless you selected that option when installing Ubuntu Server) by issuing <span class="term">sudo apt-get install postgresql</span>
<h2>Ruby, Ruby, Ruby, Ruby!</h2>
Now you'll need to install ruby and all the associated packages, using the command that resembles this: <span class="term">sudo apt-get install ruby-full ruby1.8-dev</span> and will install the following packages:

<strong>irb1.8</strong>: Interactive Ruby Console, letting you type Ruby code and see the output immediately. Useful because it stops you from creating files like <em>test.rb</em>, and then running them once using <span class="term">ruby test.rb</span> and then forgetting about them.
<strong>libopenssl-ruby1.8</strong>: Enables Ruby to use SSL.
<strong>libreadline-ruby1.8</strong>: Enables Ruby to use the readline library, for line editing and whatnot.
<strong>libruby-1.8 &amp; ruby1.8 &amp; ruby 1.8-dev</strong>: Collection of libraries to run Ruby and development headers.
<strong>rdoc1.8 &amp; rdoc</strong>: Ruby Document Generator, necessary for generating document down the road.
<strong>ri1.8 &amp; ri </strong>: Plain-text based version of the Ruby docs. Example <span class="term">ri Integer</span> will show useful information about the Integer class.

Ruby is now installed as ruby1.8. Now, if you're like me and don't like typing any more than you have to, you can symbolically link this ruby1.8 file to just /usr/bin/ruby. To do this, just type <span class="term">sudo ln -s /usr/bin/ruby1.8 /usr/bin/ruby</span> and it's all done. This way, you can type ruby AND ruby1.8 and it'll do the same thing.

After that's all done, head over to the <a href="http://rubyforge.org/frs/?group_id=126">the rubygems download page</a> and get Rubygems 1.3.1, unpack it and install it yourself. Alternatively, you could use this command and it'll download it, unpack and install it for you and do some clean up after:

    wget http://rubyforge.org/frs/download.php/38646/rubygems-1.3.1.tgz &&
    gunzip rubygems-1.3.1.tgz &&
    tar xf rubygems-1.3.1.tar &&
    cd rubygems-1.3.1 &&
    sudo ruby setup.rb &&
    cd .. &&
    rm -r rubygems-1.3.1*
    
Rubygems installs an executable called gem1.8, which again is more typing than what we need. We'll just symbolically link this one too: <span class="term">sudo ln -s /usr/bin/gem1.8 /usr/bin/gem</span>

Now we can install Rails and Passenger by typing <span class="term">sudo gem install rails passenger</span>. This will install Rails and Passenger, along with all the required dependencies.

<h2>Apache &amp; Passenger</h2>
The next step is to install apache: <span class="term">sudo apt-get install apache2-mpm-prefork apache2-prefork-dev</span> which will install a whole slew of packages including an apache2 server and the development headers for it, too many in fact that I shall not list them here! Just trust me on this one.

After this is done, run <span class="term">sudo passenger-install-apache2-module</span> and follow the instructions there. After it's done pay attention to the last three lines it tells you to put into your apache configuration file:

    LoadModule passenger_module /usr/lib/ruby/gems/1.8/gems/passenger-2.0.6/ext/apache2/mod_passenger.so
    PassengerRoot /usr/lib/ruby/gems/1.8/gems/passenger-2.0.6
    PassengerRuby /usr/bin/ruby1.8
    
For that last line, you can use either /usr/bin/ruby1.8 or /usr/bin/ruby, since we symbolically linked them all that time ago. We're going to put these lines into /etc/apache2/sites-enabled/000-default at the top of the file and change a few things in the file and our end result should look like this:

    LoadModule passenger_module /usr/lib/ruby/gems/1.8/gems/passenger-2.0.6/ext/apache2/mod_passenger.so
    PassengerRoot /usr/lib/ruby/gems/1.8/gems/passenger-2.0.6
    PassengerRuby /usr/bin/ruby1.8

    NameVirtualHost *

    ServerAdmin you@somewhere.com
    DocumentRoot /home/deploy/app/current/public
    ErrorLog /var/log/apache2/error.log
    LogLevel warn
    CustomLog /var/log/apache2/access.log combined
    ServerSignature On
    
After editing this file you'll need to restart Apache by typing: <span class="term">sudo /etc/init.d/apache2 restart</span>. Also, you may want to remove the index.html file currently residing in /var/www by tpying <span class="term">sudo rm /var/www/index.html</span>
<h2>Capistrano</h2>
Now you want to deploy your uber-mega-ultra-hyper application to the server! To do this we can use Capistrano. If you haven't already, on your development machine install Capistrano by typing <span class="term">sudo gem install capistrano</span>. When Capistrano is installed go into your uber-mega-ultra-hyper application's root directory and type <span class="term">capify  .</span>. This will capify (say it out loud in an announcer-style voice, oh yeah) your application by creating a <em>Capfile</em> in the root path and a <em>deploy.rb</em> file in the <em>config</em> folder. What we're really interested in here is the <em>config/deploy.rb</em> file which now looks kind of sparse:

    set :application, "set your application name here"
    set :repository,  "set your repository location here"

    # If you aren't deploying to /u/apps/#{application} on the target
    # servers (which is the default), you can specify the actual location
    # via the :deploy_to variable:
    # set :deploy_to, "/var/www/#{application}"

    # If you aren't using Subversion to manage your source code, specify
    # your SCM below:
    # set :scm, :subversion

    role :app, "your app-server here"
    role :web, "your web-server here"
    role :db,  "your db-server here", :primary => true
    
But we'll give it some lovin':

    set :application, "uber-mega-ultra-hyper"
    set :repository, "git://github.com/you/uber-mega-ultra-hyper"

    set :deploy_to, "/home/deploy/app"
    set :scm, :git

    role :app, "uber-mega-ultra-hyper.com"
    role :web, "uber-mega-ultra-hyper.com"
    role :db, "uber-mega-ultra-hyper.com", :primary =&gt; true

    namespace :passenger do
      task :restart do
        run "touch #{current_path}/tmp/restart.txt"
      end
    end

    # For deploying a database.yml file.
    namespace :deploy do
     task :after_update_code, :roles => :app do
       run "ln -nfs #{deploy_to}/shared/system/database.yml #{release_path}/config/database.yml"
     end

    after :deploy, "passenger:restart"
    
<br><br>
<div>
<div class="note"><strong>Git Users:</strong> You'll need to run <span class="term">apt-get install git-core</span> if you want to use git with Capistrano. Also, if you're wanting to deploy a branch it's best to specify a <span class="term">set :branch, "your-branch"</span> in the <em>config/deploy.rb</em> file, otherwise Capistrano will checkout HEAD.

<strong>Subversion Users:</strong> You'll need to run <span class="term">apt-get install subversion</span> if you want to use svn with Capistrano.</div>
</div>
We've just changed all the default values to stuff that's relevant to us, and removed all the comments from the file. The default scm for capistrano is SVN, but in this example we use git (shown as the repository URL and scm), so we have to set the scm to be git. Right at the end of the file we put in a small snippet of code that will restart passenger after we deploy. Simple really!

If you're like me and you've ignored your config/database.yml file from your repository, you may want to create one. The great thing about Capistrano is that you can put files like this in a shared directory. I've put a database.yml file for my application in <em>/home/deploy/app/shared/system</em>. Right now, you wouldn't have a /home/deploy/app/shared directory unless you created it so go right ahead now and create it using (while logged in as deploy): <span class="term">~/app/shared/log ~/app/shared/system</span>. This command will also create the config, log and shared directories. Two of these directories, log and shared are symbollically linked from <em>current/log</em> to <em>shared/log</em> and <em>current/public/system</em> to <em>shared/system</em> respectively. Go ahead now and create your <em>shared/system/database.yml</em> file.

In your Rails application's root directory, type <span class="term">cap deploy</span> to put your application on the remote server. You may be prompted for a password. When that's done, go have a look at your application and make sure everything is functioning correctly.

That's all from the guide, I hoped you enjoyed it and learned something.
