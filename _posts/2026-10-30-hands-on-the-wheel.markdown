---
wordpress_id: RB-1793331320
layout: post
title: Hands on the wheel
---

(I'm still [looking for my next gig](/real-resume). You can get in touch by emailing job@ryanbigg.com.)

As one of the people in the world not yet infected with the [AI-mindvirus](https://ludic.mataroa.blog/blog/ai-mania-is-eviscerating-global-decision-making/), and also with _infinte spare time_ on my hands, I feel qualified to share my opinion on AI by carving a post out of the raw marble of my keyboard with my _bare hands_.

I wrote this on LinkedIn at the start of this month:

> After interviewing now at a few places these things are simultaneously true:
>
> 1. EVERYONE is on the hype train
> 2. Nobody knows how to REALLY use AI and people are trying to figure that out
> 3. There are a lot of experiments that sound promising on the cover, but nothing past "we're gonna go THATAWAY"
> 4. There is an unlimited budget for this exploration, until there won't be

I've now interviewed at a few more places, and those interviews have only compounded these viewpoints.

Point 1: spurred on by some serious FOMO, C-level executives see others who are using AI and spur their employees onto using it as well. The employees then use it for writing code (Claude Code, etc), un-spice-ifying emails, and hurridley adding a chatbot into their core system that allows prompt injection attacks.

Points 2 & 3: Lots of chat around "we've been told to use AI" and a lot of experiments around what it actually means. Getting AI to build out particular things like custom forms for their applications, or the like. Maybe they've put an aforementioned chat window in to keep the CEO quiet. (It runs AI-crafted SQL queries on prod.)

These are the kinds of things people are leading with when we talk about AI in interviews. It's new enough now that nobody is leading with stuff like: "we added this AI thing and it increased retention by 30%". It's all "we thought it _might work_". It's all experimentation.

Point 4: just like all hype trains that've pulled into the station prior to the AI one, the money is unlimited until it's not. We hear [stories like this one from Accenture](http://techstrong.ai/articles/accenture-reins-in-employee-ai-spending-on-anthropic-as-token-costs-soar/) where they've cut back spending on AI to $29 per employee. At the other end of the scale, you hear of people burning millions upon millions of tokens and dollars for questionable business value. I expect CFOs to see this large outlay on AI tokens and for budgets and limits to be set in 2027 as a part of business process. As we do responsibly with things like infra spend, and head count.

---

Expanding on the above: the companies that I've been talking to no longer want someone who can be an expert in any particular language or framework. Even if that person wrote the books / guides for those frameworks in the Beforetimes! Even if... no, I'll stop tooting my own horn here.

What they're after is a "product-minded" engineer. This is someone who can speak to customers and determine what they want. Who then monitors the use of these features through not just the typical monitoring + observability stuff of "is it up?" / "is it performing?" but also the analytical stuff behind it of "who is using it?" / "did that recent change improve these important metrics?"

This may feel initially like an overloading of the responsibilities of the developer, making them more "fuller stack" than they were before. But what it really boils down to is that AI has now decreased the code authoring part to a slim part of what the status quo is demanding of developers. That then frees up the developer to work on other parts of the application, and many companies have found that a more "product-minded" engineer is what they're after.

The developer then goes further "back" along the process of development, to the collection and synthesis of new ideas. _And_ they go "forward" along the process as well, to reviewing outcomes of feature development and owning that feature completely end to end. To revising it once it has seen the light of day for a time.

Speaking for myself: I don't mind this sort of change. It's something in my tech lead role that I was naturally handling anyway while waiting for Claude to finish spinning on whatever it was doing. And I was handling this sort of work not in conjunction with only robots, but with other humans. That's the part of the job I enjoy. I think this is a reasonable shift of what's to be expected of a developer.

What frightens me about this shift is that some people are taking this a step further. When a feature request comes through the pipe, they throw the robot at it and it builds something. The robot, in some cases, is then shipping that work off to production once it's completed. This is cavalier and I think someone will either get breached, leak something they shouldn't have, or in the worst case: [actually kill someone](https://en.wikipedia.org/wiki/Therac-25).

In my chats with companies I've been comparing this to driving the car without your hands on the wheel. It will get you all the way up until the accident. (We're going to ignore the nascent self-driving technology here for the sake of the analogy).

While I am fine with steering AI towards a particular goal, doing it blindly feels like the kind of risk taking earlier in my career where people would `ssh root@production` with the password `12qwaszx` (true story). Or where they would FTP the files over directly from their computer to the production server (also a true story). Or where they would author code for production without tests (true story). **And that was just one company.**

I would prefer that developers still own the responsibilities of this steering of the work. It feels irresponsible otherwise. Yes, this means owning the whole process of the work, but additionally owning the outcomes as well. It means being responsible for things like:

- Determining if the thing we're doing now is the right / most-useful thing
- Addressing security audits in a timely manner
- Adjusting monitoring / observability metrics + alerts
- Reviewing the metrics to see if we're measuring the right things

There's still a role for developers to play in organisations. It's shifted from majority code-authoring, to now being a steady pair of hands on the wheel of features and systems. These things are what I would like to do as a developer. I've been freed up to do those by the fact that Claude can author code for me.

To finish up, two suggestions for further reading:

First: [Anthropic published a post about how they do code review there](https://claude.dev/blog/solving-code-review-at-anthropic/). These are eminently sensible guidelines around code review. I especially like their different scales of review, where some PRs like docs + copy don't require reviews, whereas changes with broader blast radius need two approvals. This would be a welcome change from my prior experiences of the last 5 years of requiring 3 humans per change, regardless of the purpose of that change.

Second: I think that this article covers a lot of questions that senior and up engineers should be asking: ["Seven Phrases I Stole From Staff Engineers"](https://louisedeason.substack.com/p/seven-phrases-i-stole-from-staff). In my role as a lead, the job was quite often finding out the answer to these questions because those answers would often determine the shape of the work. Those answers were found in human brains, not in AI chatbot prompts.
