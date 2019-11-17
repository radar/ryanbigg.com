---
wordpress_id: RB-1574028459
layout: post
title: Rough Edges
---

Our job as software developers is to make functional software.

A user should be able to use our software to accomplish tasks that might otherwise take a long time if they were doing it without computers. This has a wide-and-varied range, of course. But the main thing is that we need to make software _that works_.

If we didn't do that, we would find ourselves out of a job very quickly.

However, functional software shouldn't just be the only thing we strive for.

We should also strive to eliminiate rough edges in our software. We can do this through a process of quality assurance testing, introspection and by plain old taking feedback from our users _and acting on it_.

We need to listen to real user feedback, discover what the rough edges are in our software and work to eliminate the roughness.

For users of our software this can look like:

* A page that takes 10 seconds to load _is a rough edge_. Could we make it load in 5 seconds, or under a second? Why are our users waiting so long?
* A process that takes a user several clicks through tricky menus _is a rough edge_. Can we make a shortcut for common user flows instead?
* A part of our application that works on browsers, but not on mobile _is a rough edge_. Can we make that page responsive and useable on devices smaller than a 30" desktop or 13" laptop?
* A feature that works in one part of our application, but not in another _is a rough edge_. A feature should work in predictable ways, everywhere. For instance: `/collapse` works in the main Slack window, but not in threads. Why not?

Rough edges in software are human-software interaction problems. They should be treated at the same level as a bug or as an exception. A rough edge _is an exceptional thing_.

We must work to make functional, smooth software that is pleasing to use. Software that is as free as rough edges as we can make it.
