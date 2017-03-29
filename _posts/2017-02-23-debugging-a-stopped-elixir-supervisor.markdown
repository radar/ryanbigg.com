---
wordpress_id: RB-376
layout: post
title: Debugging a stopped Elixir Supervisor
published: false
---

We've been doing a lot of work with Elixir at [Culture Amp](https://www.cultureamp.com/), building out several microservices in it and we're also using event sourcing to pass events from our Rails monolith (called "Murmur") out to these services. In order to pass these events out to the services, we built a microservice called Event Hub.

Event Hub was built to receive events from Murmur and then to provide streams for these events that our other microservices could then read from. Writing the events directly to the microservices would mean that we would need to keep a list of microservices to write to and update that if we added in any new service. By writing the events to the Event Hub instead, we could have multiple microservices consuming the same streams from the Event Hub without issue. It's up to each microservice to keep track of what event it has currently read up to in the stream.

However, we ran into an issue a ways into our implementation when we wanted to take a point-in-time snapshot of our databases. Attempting to take a snapshot of a Mongo database (Murmur) and a PostgreSQL database (Event Hub) at the same point in time proved to be too difficult. So we changed tactics and ended up writing events directly Murmur's Mongo database. This way, we can choose to backup Murmur's Mongo database and the microservices independently from each other. If we restore a microservice from backup and it's behind in its events, we can catch it up by reading those events from a restored Event Hub.

We then needed a way to get events from Murmur's Mongo database into Event Hub, as we wanted Event Hub to be able to work separately from Murmur. If Murmur goes down, we don't want it to affect Event Hub and vice versa. For this transferral of events we built another microservice: Copy Cat.

## Copy Cat

Copy Cat worked by using the master branch of [mongodb_ecto](https://github.com/michalmuskala/mongodb_ecto) to read events from Murmur's Mongo database, and then it used [Ecto](http://hex.pm/packages/ecto) to write these events to Event Hub's PostgreSQL database.

Copy Cat was setup with a supervision tree which looks like this:

<center>
  ![Supervision tree](/images/copycat/supervision.png)
</center>

Code-wise, here's what it looks like. Let's start with `lib/copy_cat.ex`:

```elixir
def start(_type, _args) do
  import Supervisor.Spec

  children = [
    supervisor(CopyCat.Murmur.Repo, []),
    supervisor(CopyCat.EventHub.Repo, []),
    supervisor(CopyCat.ImportSupervisor, []),
    router,
  ]

  opts = [strategy: :one_for_one, name: CopyCat.Supervisor]
  Supervisor.start_link(children, opts)
end
```

And then `lib/copy_cat/import_supervisor.ex`:

```elixir
defmodule CopyCat.ImportSupervisor do
  use Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, [], name: CopyCat.ImportSupervisor)
  end

  def init([]) do
    child_options
    |> Enum.map(&worker(CopyCat.EventImporter, [&1], id: make_ref))
    |> supervise(strategy: :one_for_one)
  end

  defp child_options do
    [
      [
        source:      CopyCat.Murmur.SurveyEvent,
        destination: CopyCat.EventHub.SurveyEvent,
        name:        CopyCat.SurveyImporter,
      ],
      [
        source:      CopyCat.Murmur.InvitationEvent,
        destination: CopyCat.EventHub.InvitationEvent,
        name:        CopyCat.InvitationImporter,
      ],
      ...
    ]
  end
```

We designed the supervision tree this way so that if one event importer process crashed it wouldn't take down any of the others. We have also designed the events so that they can be imported into this system completely independently from any other event.

Each event importer process works off a unique stream. If that event impoter process crashes, then it will be restarted automatically because of it living underneath `CopyCat.ImportSupervisor`. This supervisor has the default `max_restarts` and `max_seconds` values of 3 and 5 respectively, which means that if there are 3 process restarts within the space of 5 seconds then this will cause the `CopyCat.ImportSupervisor` to be restarted too.

Because `CopyCat.ImportSupervisor` is supervised in turn by `CopyCat.Supervisor`, the same rule applies: if `CopyCat.ImportSupervisor` restarts 3 times within 5 seconds then the application will die.

Shortly after we deployed Copy Cat to our production environment, we observed issues where the importing of events would just stop suddenly. Nothing was output to the log file, which is what we expected to happen if one of the `EventImporter` workers encountered an exception. It was almost as if all the workers were waiting for _something_ to happen, but we didn't have any information on what that might've been. A few days later, this issue happened on several other machines too. It wasn't an isolated issue.

None of us could figure it out at all, with most of us being relatively new to running Elixir in production. This issue continued for almost a month with nobody being able to figure it out.

## Splunk alerting to the rescue (temporarily)

The application was still running and responding to heartbeat checks -- each of our microservices has a health check endpoint -- but it appeared that the workers had stopped running completely. We'd notice the workers stopped working because their status messages -- messages that look like this:

```
13:42:10.155 [info] Fetched 0 CopyCat.Murmur.SurveyEvent from Murmur
```

Would stop being printed to our Splunk logs. We were able to setup an alert in Splunk that would notify us if there were none of these messages after a few minutes, however this was only ever intended as a stop-gap to tracking down the issue.

This alert was posted into our Slack channel whenever it happened, and it typically happened every few days. When we saw the alert, we would just restart the service. Everything would come back up and Copy Cat would keep processing events as if nothing happened.

## The "Baby Monitor"

Jo, our team lead, thought that this issue may be happening because the worker processes were somehow crashing silently. I admit, I thought this idea was silly! Worker processes don't _crash silently_ in Elixir!

She came up with an idea that we should have _another_ endpoint which returned the number of worker processes that were currently running underneath the `CopyCat.ImportSupervisor`. We called this endpoint the "baby monitor". The code for that endpoint is fairly simple:

```elixir
get "/importers" do
  importers = CopyCat.ImportSupervisor |> Supervisor.which_children |> Enum.count
  conn
  |> put_resp_content_type("application/json")
  |> send_resp(:ok, ~s({ "running_importers": #{importers} }))
end
```

This uses `Supervisor.which_children/1` to gather up all the child processes of `CopyCat.ImportSupervisor` and then `Enum.count/1` to count them up. This endpoint should then return the number of event importers that we were expecting: 5. I wrote this code thinking that it wasn't going to be much help in diagnosing the issue and boy was I wrong.

When the importing stopped again, we hit this endpoint to see how many workers were running and we didn't get the kind of number back that we were expecting: We got a "500 Internal Server Error" response instead. We looked at our logs, and saw something like this:

```
15:56:46.523 [error] #PID<0.490.0> running CopyCat.Router terminated
Server: localhost:4600 (http)
Request: GET /importers
** (exit) exited in: GenServer.call(CopyCat.ImportSupervisor, :which_children, :infinity)
    ** (EXIT) no process
```

When you use `Supervisor.which_children/1`, it makes a call using `GenServer.call/3` to the process you've asked for, as we can see by the first `(exit)` line here. The _second, shoutier_ `(EXIT)` line tells us "no process". Huh? How can the `CopyCat.ImportSupervisor` not exist? If that were to happen, then `CopyCat.Supervisor` should've died as well. What was going on?

## Transient Restart

Concurrently to our investigation of this issue, work continued on Copy Cat. One piece of work that was done by Jo involved us making it possible to shut down `CopyCat.ImportSupervisor` for a time, clear out Event Hub's database and then to start up `CopyCat.ImportSupervisor` again. We needed this feature for staging environment testing purposes.

To make this possible, we added the `restart: :transient` option to `CopyCat.ImportSupervisor`:

```elixir
def start(_type, _args) do
  import Supervisor.Spec

  children = [
    supervisor(CopyCat.Murmur.Repo, []),
    supervisor(CopyCat.EventHub.Repo, []),
    supervisor(CopyCat.ImportSupervisor, [restart: :transient]),
    router,
  ]

  opts = [strategy: :one_for_one, name: CopyCat.Supervisor]
  Supervisor.start_link(children, opts)
end
```

This allows us to stop `CopyCat.ImportSupervisor` by calling these functions:

```elixir
Supervisor.stop(CopyCat.ImportSupervisor)
Supervisor.delete_child(CopyCat.Supervisor, CopyCat.ImportSupervisor)
```

The `CopyCat.ImportSupervisor` won't be resurrected by `CopyCat.Supervisor` in this instance because its `restart` option is now set to `:transient`. This means it's up to us to maintain whether `CopyCat.ImportSupervisor` is up or not.

After this work was done, the bug happened again. Initially, we thought it was because our endpoint to stop the `CopyCat.ImportSupervisor` was called, but we didn't see any evidence of that. It was being stopped by something else, but we didn't have any indication as to what to go on.

<aside>
I should also mention at this point that CopyCat.ImportSupervisor certainly exhibited this "silent crashing" behaviour <em>before</em> the transient restart code was added. Attempts to reproduce the bug without having CopyCat.ImportSupervisor in the "transient restart" mode so far have been unsuccessful.
</aside>

I looked up on Elixir's GitHub issues the phrase "supervisor stop" hoping that someone else had come across a similar issue and it turned up [this completely unrelated issue](https://github.com/elixir-lang/elixir/issues/2432) which mentions using [`:dbg`](http://erlang.org/doc/man/dbg.html) to investigate messages being sent through Erlang. This looked like exactly what I wanted: a way to see what was sending a message to the `CopyCat.ImportSupervisor` process telling it to shut down.

## dbg to the rescue

So off I went and added `:dbg` to the application. I did that by changing `CopyCat.ImportSupervisor.start_link` to this:

```elixir
def start_link do
  {:ok, pid} = Supervisor.start_link(__MODULE__, [], name: CopyCat.ImportSupervisor)
  # TEMPORARY! Used to figure out why CopyCat.ImportSupervisor is crashing
  # Starts the dbg tracer
  # Read all about it: http://erlang.org/doc/man/dbg.html
  :dbg.tracer
  # Monitor the pid, and log out all messages that this PID receives
  # If this process is being told to shutdown, this will output
  :dbg.p(pid, [:all])
  {:ok, pid}
end
```

As the comments say, this sets up `dbg` tracer and then monitors all the messages sent or received by the process.

I then got this change code reviewed + deployed to our staging server. Then I had to wait for this bug to happen again. Luckily, it happened again the very next day. This time, we had some logs from dbg:

```
 (<0.404.0>) << {'EXIT',<0.409.0>,
  {timeout,
      {'Elixir.GenServer',call,
          [<0.213.0>,
           {update,<<"comment_topic_events">>,
               [{'_id',
                    #{'__struct__' => 'Elixir.BSON.ObjectId',
                      value => <<88,142,206,90,219,77,8,62,134,0,75,
                        108>>}}],
               [{'$set',[{status,<<"propagated">>}]}],
               [{multi,false}]},
           5000]}}} (Timestamp: {1487,736694,937453})
```

Aha! A timeout in our queries. This seemed to be the cause of our issues. There were a few more timeouts like this for some of the `CopyCat.EventImporter` workers, and because they all crashed so close together, this happened:

```
(<0.404.0>) error_logger ! {notify,
  {error_report,<0.196.0>,
   {<0.404.0>,supervisor_report,
    [{supervisor,
      {local,'Elixir.CopyCat.ImportSupervisor'}},
     {errorContext,shutdown},
     {reason,reached_max_restart_intensity},
     {offender,
      [{pid,<0.466.0>},
       {id,#Ref<0.0.1.110489>},
       {mfargs,
        {'Elixir.CopyCat.EventImporter',start_link,
         [[{source,
            'Elixir.CopyCat.Murmur.ResponseEvent'},
           {destination,
            'Elixir.CopyCat.EventHub.ResponseEvent'},
           {name,
            'Elixir.CopyCat.ResponseImporter'}]]}},
```

This indicates that `CopyCat.ImportSupervisor` has reached its "max restart intensity" and is about to shut down. This also gives us some information that it's the `ResponseImporter` worker which struck the final blow here. A little bit further down then we see the `CopyCat.ImportSupervisor` is unregistered:

```
 (<0.404.0>) unregister 'Elixir.CopyCat.ImportSupervisor' ...
```

Because this supervisor is "transient", it's allowed to go down in a "normal" shutdown without being resurrected by `CopyCat.Supervisor`. If the workers were raising exceptions, then `CopyCat.ImportSupervisor` would restart them until it reached the "max restart intensity", and then `CopyCat.ImportSupervisor` would die. `CopyCat.Supervisor` would then restart `CopyCat.ImportSupervisor`. But the workers _weren't_ raising exceptions, even though a query timing out is something that I'd consider to be _exceptional_.

## SASL

I asked about this issue on the #elixir-lang channel on Freenode and I was told by [micmus](https://github.com/michalmuskala) about the [`:sasl` application](http://erlang.org/doc/man/sasl_app.html).

Just by adding this application to the `applications` list in `mix.exs`, I was told that I'd be able to get information about the processes being started / stopped as well. Here's the change I made:

```elixir
def application do
  [applications: [:logger, :poolboy, :sasl],
   mod: {CopyCat, []}]
end
```

By starting the `:sasl` application, I could then get some info regarding the processes. Here's an example from my [copy_lion](https://github.com/radar/copy_lion) repo which was my attempt to reproduce this timeout issue in a succinct way:

```
=SUPERVISOR REPORT==== 23-Feb-2017::16:35:38 ===
     Supervisor: {local,'Elixir.CopyLion.ImportSupervisor'}
     Context:    child_terminated
     Reason:     {timeout,
                     {'Elixir.GenServer',call,
                         [<0.202.0>,
                          {find,<<"response_events">>,
                              #{<<"$where">> => <<"sleep(5000)">>},
                              nil,
                              [{batch_size,1000}]},
                          5000]}}
     Offender:   [{pid,<0.217.0>},
                  {id,#Ref<0.0.4.272>},
                  {mfargs,
                      {'Elixir.CopyLion.EventImporter',start_link,
                          [[{name,'Elixir.CopyCat.SurveyImporter'}]]}},
                  {restart_type,permanent},
                  {shutdown,5000},
                  {child_type,worker}]
```

The `copy_lion` application will on-purpose cause a query to take longer than 5 seconds, and so we get the same kind of "timeout" exit that's happen here too. When this happens, `CopyLion.ImportSupervisor` restarts `CopyLion.EventImporter` processes. However, when `CopyLion.ImportSupervisor` is changed to use `restart: :transient` then `CopyLion.ImportSupervisor` doesn't get restarted and we see the same kind of behaviour we were seeing only intermittently before.

If the timeouts here were raising exceptions, it would be a different story. The `CopyCat.ImportSupervisor` would receive exceptions from its children and then -- with enough of them -- would restart itself. Since these timeouts are not exceptional, the `CopyCat.ImportSupervisor` is not restarted automatically by `CopyCat.Supervisor`.

The best part about using the `:sasl` application here is that we're now getting valuable logs of what's happening with our supervisors and the processes they monitor, whereas before we didn't have a single line of information to go on.

## The fix

During our investigation of this issue we found out about the [`ecto-2` branch of mongodb_ecto](https://github.com/michalmuskala/mongodb_ecto/tree/ecto-2). This branch upgrades the version of Ecto and, most importantly, the version of the [mongodb package](https://github.com/ericmj/mongodb) that is used.

I used this new version of the `mongodb` package on `copy_lion` (which you can see on [my `mongo-0.2.0` branch](https://github.com/radar/copy_lion/tree/mongo-0.2.0)) and I saw that when the query timed out an exception was actually raised:

````
16:41:58.235 [error] Mongo.Protocol (#PID<0.630.0>) disconnected: ** (DBConnection.ConnectionError) client #PID<0.619.0> timed out because it checked out the connection for longer than 5000ms

16:41:58.237 [error] Process #PID<0.619.0> raised an exception
** (Mongo.Error) tcp recv: unknown POSIX error - :timeout
    (mongodb) lib/mongo/cursor.ex:40: anonymous fn/6 in Enumerable.Mongo.Cursor.start_fun/6
    (elixir) lib/stream.ex:1121: anonymous fn/5 in Stream.resource/3
    (elixir) lib/enum.ex:1627: Enum.reduce/3
    (elixir) lib/enum.ex:2346: Enum.to_list/1
```

This gives me a large amount of confidence that the latest version of the `mongodb` package will no longer cause `CopyCat.ImportSupervisor` to exit normally, but will instead raise exceptions when a timeout is encountered. When this happens, `CopyCat.ImportSupervisor` will exit with an exception too, causing `CopyCat.Supervisor` to restart it.

I've now got a pull request in the works for Copy Cat to use this `ecto-2` branch, but that only means that an exception will now be raised when a timeout is encountered. It doesn't make the timeout go away.

Luckily, Sushma -- who's another developer on our team -- was able to track down one query that was performing slowly and applied a fix for it:

```diff
     source_module
     |> Queries.published_after(published_at(last))
+    |> Queries.propagated
     |> MurmurRepo.update_all(set: [status: "created"])
   end
```

Prior to this change, the query wasn't using the indexes that we had setup for our events tables. I suspect that this first update query taking a long time on the events collection meant that the collection was locked for further writing. Subsequent updates to the collection were blocked until this first query finished, which was the root cause for our timeouts.

## Conclusion

Ultimately, we need to do better work on profiling slow queries within our Mongo database. If we were somehow notified of slow queries before we were notified of Copy Cat's issues, then we may have discovered the root cause of this issue sooner. That's something we'll be looking at doing in the future.

Switching to the `ecto-2` branch, while risky due to its in-progress state, seemingly fixes our issue of having Copy Cat mysteriously stop. What will happen now if a timeout happens is that there'll be an exception raised. This is much easier to handle because with that exception we'll have some information about what queries are slow.

Elixir and Erlang do give you some very powerful tools that you can use to diagnose what your application is doing at any given moment. If you're seeing your Elixir application behaving weirdly, I'd recommend using `:sasl` and `:dbg` to figure out what's going on.
