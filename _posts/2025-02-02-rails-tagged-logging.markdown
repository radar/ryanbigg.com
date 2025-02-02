---
wordpress_id: RB-1738475023
layout: post
title: Rails tagged logging
---

A feature within Rails is that it allows us to add data to our application's log lines for tagging those lines. We can then use these tags for aggregating them together into a bunch. I'll show you how to do this here. I used this in a Rails app that acts purely as an API, so there is only ever one request at a time I care about, in this case.

We can configure this in `config/environments/development.rb`:

```
config.log_tags = [lambda {|r| Time.now.iso8601(4) }, :request_id]
```

This sets up two tags, one of a timestamp with millisecond precision, and another with the request ID. The symbol `:request_id` maps to a method on `ActionDispatch::Request`, and we can use any methods from that class in these tags if we wish.

This log line configuration as it stands now will output this prefix to all log lines:

```
[2025-02-02T16:32:35.6772+11:00] [56937855b121fede4013141a6cf4ca46] A log message goes here.
```

We can eyeball our log file then to see the logs grouped together. Or, we could build a set of little shell commands to do that for us:

```

reqs() {
  req_id=$(tail -n 1000 log/development.log |
    awk -F'[][]' '{print $2, "|", $4}' | sort -u -r | fzf | awk '{print $NF}')

  reqlogs "$req_id"
}

reqlogs() {
  awk -v req_id="$1" '
  $0 ~ "\\[" req_id "\\]" {
    sub(/\[[0-9a-f]+\]/, "", $0)
    print
  }
  ' log/development.log
}
```


The `reqs` command here uses `awk` and [fzf](https://github.com/junegunn/fzf) to find the last 1,000 log lines, and outputs the timestamps and request IDs for them, with the most recent request selected by default:

```
2025-02-02T16:32:35.6772+11:00 | 56937855b121fede4013141a6cf4ca46
> 2025-02-02T16:34:36.1173+11:00 | 3a87e274ee9f81c898d9d85abb0a8dd2
```


Once one is selected, it then uses the `reqlogs` function to display just the log messages that match that ID. Given we already know what the ID is, there's no need to display it so `reqlogs` snips that bit out as that'll save 32 characters each time.

What we'll end up with here is a set of log lines that match only _one_ request at a time:

```
[2025-02-02T16:32:35.6772+11:00] A log message goes here.
```

This is much nicer than trawling through a giant log file or scrolling back through my console to find the particular lines I'm after!
