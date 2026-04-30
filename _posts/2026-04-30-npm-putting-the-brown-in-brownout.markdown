---
wordpress_id: RB-1777589835
layout: post
title: "NPM: putting the brown in brownout"
---

Two weeks ago, the NPM endpoint that `yarn audit` from Yarn v1 uses, [decided to stop working](https://github.com/yarnpkg/yarn/issues/9234):

<blockquote>
I imagine this won't be fixed (unfortunately), but it looks like npm has silently deprecated the security audit API that Yarn 1 uses:

<pre>
yarn audit v1.22.22
error Error: https://registry.yarnpkg.com/-/npm/v1/security/audits: Request "https://registry.yarnpkg.com/-/npm/v1/security/audits" returned a 410
    at params.callback [as _callback] (/usr/share/yarn/lib/cli.js:66689:18)
    at self.callback (/usr/share/yarn/lib/cli.js:141410:22)
    at Request.emit (node:events:517:28)
    at Request.&lt;anonymous&gt; (/usr/share/yarn/lib/cli.js:142382:10)
    at Request.emit (node:events:517:28)
    at IncomingMessage.&lt;anonymous&gt; (/usr/share/yarn/lib/cli.js:142304:12)
    at Object.onceWrapper (node:events:631:28)
    at IncomingMessage.emit (node:events:529:35)
    at endReadableNT (node:internal/streams/readable:1400:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)


info Visit https://yarnpkg.com/en/docs/cli/audit for documentation about this command.
</pre>

Unless a third-party package can work around this, I expect it'll no longer be possible to audit Yarn 1 packages for security issues.

</blockquote>

We use Yarn v1, as it's been reliably stable for installing NPM packages. Yes, there are newer versions out there. Upgrade attempts have been made, but we've ran into issues each time.

There's also [this discussion thread](https://github.com/orgs/community/discussions/192768) on the GitHub community forum with a great list of questions:

> 1. What is the reason for retiring the Quick Audit / legacy audit endpoints?
> 2. When was this deprecation planned internally?
> 3. Was there any prior public notice? If so, where was it communicated?
> 4. Did npm evaluate whether third-party package managers such as pnpm and Yarn were still relying on these endpoints before returning 410?
> 5. Was there any coordination with pnpm or Yarn maintainers ahead of this change?
> 6. Were the security implications considered for users whose audit workflows stopped working as a result?
> 7. Is the expectation that all non-npm clients should migrate to the Bulk Advisory endpoint immediately?
> 8. Is there a documented migration path or compatibility guidance for third-party clients?
> 9. Is there any plan to temporarily restore the legacy endpoint, or otherwise provide a grace period, until the ecosystem has a stable working solution?

None of these questions were answered by GitHub or NPM support as at the time of writing this 15 days later.

I understand the need for cost reductions and deprecations in software: I am a software developer so _of course_ I understand these.

**What I don't understand is how this could not be communicated plainly in [GitHub's changelog](https://github.blog/changelog/).**

It took me contacting NPM support to get an answer. Here's what I wrote:

<blockquote>
<p>The NPM endpoint that 'yarn audit' from Yarn V1.22.2 uses was reporting as "410 Gone" a few weeks ago.</p>

<p>This was raised in a number of GitHub issue threads, including this one: https://github.com/npm/api-documentation/issues/46</p>

<p>It would be helpful to get an NPM maintainer's perspective here. Is the endpoint being shutdown? How much longer do we have with it? Where/how was this brownout communicated?</p>

<p>Thank you</p>
<p>A concerned tech lead who had to manage a team of people freaking out</p>
</blockquote>

And their response:

<blockquote>
<p>Thanks for reaching out.</p>

<p>I can confirm that the 410s you saw line up with a scheduled brownout for the legacy npm audit endpoints that Yarn v1 calls.</p>

<p>The /-/npm/v1/security/audits and /-/npm/v1/security/audits/quick endpoints are currently in a scheduled brownout. During the brownout window you can see errors like 410, and after July 15, 2026 the old endpoints will be fully retired. We are not able to bring the old endpoint back up temporarily.</p>

<p>The recommended fix is to move your tooling to the newer Bulk Advisory endpoint. You can find the Bulk Advisory API docs here: https://api-docs.npmjs.com/#tag/Audit</p>

<p>Please feel free to submit feedback via GitHub Community, which is reviewed by our Product Managers.</p>
</blockquote>

The phrasing "scheduled brownout" here indicates it was communicated in advance somewhere. I assumed I missed the memo, so wrote back:

<blockquote>
<p>
Thank you for your reply here. You've said "scheduled brownout" but I am not sure what this schedule _is_. Is this documented somewhere? I would require a definitive source for changes to my code require something more than "because FE from GitHub support said so".
</p>
</blockquote>

And they replied:

<blockquote>
I'm looking into this with our team, so I'll follow up once we have an update.
</blockquote>

And a few hours later, again from them:

<blockquote>
I heard back from our Product team, and we don't have an announcement yet. In the meantime, the recommendation is to follow our Changelog releases for updates.
</blockquote>

The changelog feed (https://github.blog/changelog/feed/) has no results for the phrase "npm" "audit" or "endpoint".

They closed the thread and send the generic NPS email of "please let us know how we went".

I wrote back two days ago:

<blockquote>
Nah man, this isn’t it.

You guys have a duty to communicate publicly the timeline of deprecating an endpoint like this. it’s not on your changelog, but it should be.

</blockquote>

They wrote back this morning:

<blockquote>
I understand your frustration. I've passed along your feedback to our Product team internally. If you haven't done so already, you can do the following as well (another link to the GitHub community page)
</blockquote>

---

I don't mind that endpoints that I'm relying on are being turned off. Deprecations are par for the course when it comes to software! What I do mind is that it comes as a complete surprise, and has not been communicated anywhere except in a support thread between myself and this support person.

We have a now-known deprecation date of July 15th of this year. That's motivation enough for us to move our tooling over to `npm audit`, which now has a very good reason for being prioritised into the work for our teams.

I would think that GitHub, being itself a serious company AND a subsidary of Microsoft, would do a much better job at communicating that an endpoint that people rely on is being turned off. They could fix this very easily by putting up a notice on their Changelog, but so far they haven't. There's under 11 weeks to go until this endpoint turns off forever.
