---
wordpress_id: RB-1781572768
layout: post
title: Verify faster
---

We've been working to a pretty tight deadline as a team recently. We had a period of relative stability with a few concurrent projects on the go, and then we had this new elephant-sized project dropped on us. The entire team has rallied around it and everyone's contributing exceedingly well to their own parts.

During the last few months of this project, I've been taking a look at how we can get to the point of verifying our changes faster after reading [Accelerate](https://www.amazon.com.au/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339) for the second time. Trying to find answers for how we from "push" to knowing something works, and then shipping that with less time passing between all of those points.

A few things that our team has worked on to fix this has been:

- Improving Docker build caching so that our tests start running sooner (8min -> 2min startup)
- Addressing flaky specs as they're detected, rather than backlogging them as a fix for "later". Specs are split into groups, and each group would take 10 mins per retry, retrying up to 3 times.
- Adding a `/pick-reviewers` skill, so that pairs of developers are assigned to a PR to avoid the bystander effect.
- Creating "unique staging" environments, rather than having one shared between all developers
- Removing `bullet` from the majority of our specs, which garnered a 12% across-the-board speedup.
- Adding a way of checking which branch & commit our app is running in any environment, without having to check the New Relic logs.
- Swapping from `yarn` to `pnpm`, as the `yarn` audit endpoint is [browning out](https://ryanbigg.com/2026/04/npm-putting-the-brown-in-brownout).

Each of these is a good improvement on its own, but collectively it's meant that our timeline for getting changes through CI and out to users has been reduced. We chose to prioritise this work during a really busy time so that we could move faster. If we weren't working on being faster _now_, then when would we otherwise?
