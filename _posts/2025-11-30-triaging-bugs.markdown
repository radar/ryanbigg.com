---
wordpress_id: RB-1764538759
layout: post
title: Triaging bugs
---

At Fat Zebra, one of my duties as a team lead is managing the workloads of those I work with and falling into that ambit is bug triaging. We have a dedicated support channel where people can tag all leads and then the responsible leads can triage those issues. All leads get tagged as it's sometimes unclear who is responsible for an issue, and it helps with the "pinball effect" that can go on for tickets in their early stages.

Another rule of thumb is that when I can see a ticket is about my team's work is that I'll assign it to the on-call person for the team to investigate. This helps spread the load away from myself, and trains up the rest of the team on how to investigate all sorts of issues. Other people may be roped into help investigate if the issues lies in their area of expertise.

My team came up with this list of triage questions to ask and posted about it in our internal wiki. We train people who interact with our team on this triaging method.

1. **Which merchant is having this issue?** Who is the issue affecting? Are they are one of our larger merchants or a smaller merchant? Or is it more than one merchant reporting this issue?
2. **What is the scope of the issue?** At a rough guess, what % of this merchant’s functionality is degraded? For example if it’s a transactional issue, is it an issue with one type of transaction (such as Apple Pay) or is it across the board?
3. **Where can we see the issue happening?** A URL to the site of the issue is incredibly useful here.
4. **Can you demonstrate the issue?** Can you send us a video of the issue and walk us through your thinking on this. Use Loom. Post the video in the team channel.
5. **If you can’t send a link or demonstrate, can you describe the issue in a few sentences?** Using your words to explain an issue over saying something like “purchases aren’t working” really helps us get to the root cause of an issue sooner. The more words the better.
6. **From your perspective, how urgent is this issue?** Do we need to be waking people up about this if it’s occurring at night, or can it wait until the morning? Could it even wait until the next Sprint?

We then provide a template for them to use when creating a ticket for our board:


> ```
> **Merchant Affected:** [Merchant name]
> **Scope:** [% of functionality impacted, or specific features impacted]
> **Steps to Reproduce:** [Link to URL of the affected page or video walkthrough]
> **Urgency:** [Low, Medium, High - based on business impact]
> ```

We then go on to say:

> Tickets without enough information will be re-assigned back to the reporter.
>
> When you’ve created the ticket with this information, post it in the #cxteam channel on Slack.
>
> Do not @here in #cxteam, as there are usually upwards of 20 people who will receive your message.
>
> In an urgent situation, escalate through Slack with to the person currently on call with:
>
> [on call alerting instructions go here]

This has really helped reduce the noise that goes on when a ticket rolls in. It can be a bit frantic to start out with; a very "my hair is on fire" moment. This happens because the downstream merchant has been upset about an issue, and then that escalates up through the chain until it reaches the triage point. At that point, we determine the answers to the questions above and act accordingly. We haven't yet gone onto classify these based on something like a [RICE](https://www.productplan.com/glossary/rice-scoring-model/) score, but I think it would be helpful, at least the Reach + Impact parts of that.

The response between each ticket varies tremendously. Sometimes they don't get past the first couple of people, and sometimes they involve multiple teams worth of effort over a couple of days. It's important to figure out the scope of these issues at the very start, so that we can be sure that we're addressing the important or urgent issues first and we don't get overwhelmed by the noise.
