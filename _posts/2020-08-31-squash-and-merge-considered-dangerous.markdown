---
wordpress_id: RB-1598848381
layout: post
title: Squash and Merge considered dangerous
---

On the Culture Amp Alumni Slack group today, this was posted:

> Anyone has position on squash-merge when you merge your PR into master?

Here's my (amended, corrected and updated) reply:

I don't like it.

Imagine: you're working on a PR that lasts ~1 week. It's about 60 commits long. Of course your commits are atomic and their commit messages are beautifully written. We're all good developers, and we are perfect all the time.

At about commit #33, you make a critical mistake. However, this mistake is not noticed until the PR gets alllllll the way through to production. Hundreds of users simultaneously experience your fuckup. Alarms start going off.

However, it's your first-of-five days off. You're on some tropical island somewhere. Margarita in hand. That PR was a lot of work and you deserve a break!

So then it's up to Rando Developer #2 to come along and attempt to figure out what went wrong. They git bisect and discover the ONE commit that contains your changes. This ONE commit that represents an entire week (or more's) work. And they have to trawl through two-and-a-half thousand lines written in at least four different languages to find that one, tiny, area, where you put `>` when you should've put `<`.

But you could look at the branch, right? Just check it out! You mean the one that gets automatically deleted after you merged the PR? That branch? The branch that now only exists on this vacationing developer's computer? It's _gone_. Lucky for you, GitHub has a feature that lets you restore a branch after it has been deleted.

Still, it would
