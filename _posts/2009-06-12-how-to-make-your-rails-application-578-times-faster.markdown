--- 
wordpress_id: 606
layout: post
title: How to make your Rails application 1,235 times faster*
wordpress_url: http://frozenplague.net/?p=606
---
Today at work our iPhone developer asked:

<blockquote>"How many requests per second do you think the server could handle?"</blockquote>

This was for a given action, getting the scores of some games for a given sport in a given league in the current week of the current season. We'll call it "scores". This action sends back JSON data containing information about the games. The data is populated from an external source via an endlessly looping rake task that sleeps for a couple of seconds before re-querying the data source.

So I set about finding how many requests it did at the time.


<h3>Enter, the Bench</h3>

To do this I used something that comes with Apache called Apache Bench (`ab` on the command-line). This lets you bench how well a webserver responds to a number of requests and you can set, among other things, the concurrency of these requests. 

So I did `ab -n 100 http://127.0.0.1:3000/sports/sport_name/leagues/league_name/games/scores` and got in the results this like:

    Requests per second:    5.52 [#/sec] (mean)

Only 5 and a half requests a second! That's nothing! So what'd I do?

<h3>Queries</h3>

First stop was queries. We retrieved records from one model, and then based on that find we retrieved records from another model and based on <strong>that find</strong> more records, and even on <strong><em>that find</em> more records!</strong>

We used something like this example:

    @sport = Sport.find(params[:sport_id])
    @league = @sport.leagues.find(params[:league_id])
    @season = @league.current_season
    @week = @season.current_week
    @competitions = @week.competitions 

In our app, sports are always going to have leagues and leagues are going to have seasons which are going to have weeks and weeks are going to have games, so we can use a `joins` option in our initial sport find in order to get it to cut down on the number of queries.

    @sport = Sport.find(params[:sport_id], :joins => { :leagues => { :seasons => { :weeks => :competitions } } })
    @league = @sport.leagues.find(params[:league_id])
    @season = @league.current_season
    @week = @season.current_week
    @competitions = @week.competitions 

At this stage we see a <strong>triple-fold</strong> increase plus a little bit more with our app now doing 17 requests per second! Woah!

    Requests per second:    17.43 [#/sec] (mean)

<h3>Caching</h3>

Since our action is most likely going to be hammered by a lot of users frantically refreshing to see the latest scores, caching is definitely the way to go here. Caching will store the page on disk and serve that file rather than going through the Rails stack which is, as we've seen, only serving 17 requests a second. How do we cache? Well, for development mode we're going to have to turn on caching in <em>development.rb</em>:

    config.action_controller.perform_caching = true

And we're going to have to put in our controller a method call to tell Rails to cache the page:

    caches_page :scores

After this we'll restart the Rails server (Mongrel) and access our scores action. For the first request we'll see in our <em>log/development.log</em> that it says: `Cached page: /sports/sport_name/leagues/league_name/games/scores.json (1.6ms)` indicating that this page has been cached. Future requests to this page will not be logged in <em>development.log</em> because Rails is serving the file <em>sports/sport_name/leagues/league_name/games/score.json</em> directly from the <em>public</em> folder.

Running Apache Bench again and we get:

`Requests per second:    921.93 [#/sec] (mean)`

That's a 54 times increase! Now we're talking! So if we have a single mongrel serving 921, almost 922, requests a second, surely we can only go so much faster, right?

<h3>Enter, the Passenger</h3>

So I hooked up my app to run on Passenger using the ever-awesome <a href='http://www.fngtps.com/passenger-preference-pane'>Passenger Preference Pane</a> which makes it a cinch to get your app running on passenger on your dev machine. 

So now we'll change our `ab` call to point to our passenger app: `ab -n 1000 http://games.local/sports/sport_name/leagues/league_name/games/scores`. I snuck in the number 1000 just to really emphasise what you're going to see next:

`Requests per second:    3184.45 [#/sec] (mean)`

This 578 times faster than our initial single-mongrel server! 

What's also interesting in this output is right at the bottom:

    Percentage of the requests served within a certain time (ms)
      50%      3
      66%      3
      75%      3
      80%      4
      90%      5
      95%      5
      98%      7
      99%      8
     100%     24 (longest request)

99% of our requests were served in less than 10 milliseconds and the longest only took just over double that. And this is on a Macbook Pro! Imagine what kind of speeds you can get on a super-server!

<h3>Nginx</h3>

So I installed nginx using `passenger-install-nginx-module` which'll install nginx too if you don't already have which is handy! It inserted some default config and I set it up to listen on port 81 so it wouldn't conflict with Apache and let her rip. Running the same apache bench (with a different port for nginx) I get:

`Requests per second:    6461.48 [#/sec] (mean)`

This is a massive <strong><em>twice as fast</em></strong> improvement over Apache. Word on the street is that it uses less RAM too! That's 1,235 times faster than what our original app was serving at.

* Note: YMMV. Also note that these tests are done locally. Latency will play a large part in making your remote connections slower, but overall your app will be faster by using proper queries and caching.
