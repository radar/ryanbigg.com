---
wordpress_id: RB-1739216342
layout: post
title: Ghosts 'n' Stuff
---

Being a lead developer is an interesting time. I’d write a lot more blog posts if I wasn’t so busy, sure, but mostly I’d write them if I was _allowed to write them_. So many times I think “this’d make an interesting blog post” right before the thought of “imagine how much shit you’d be in if you told a soul”. There's a lot about being a lead that's _interesting_ but also _highly confidential_. I’d love to share those stories one day, perhaps a long way down the track.

But today I want to talk about ghosts.

The apps I’m working on have the lucky advantage of being around a decade and a half old. They also have the unlucky disadvantage of being a decade and a half old. Ruby and to a larger extent JavaScript tastes have rapidly evolved in this time. Both have since slowed to a much more agreeable-to-this-dad pace, and I am thankful for that.

Not only do the languages change over time, but the applications do as well. Features get added, seldom removed. Bugs get removed and (hopefully) seldom added. Developers move on — Peopleware claims the average staying power of a dev was in the range of 15-36 months (I would be interested to hear how this has changed after the pandemic) — and new developers come in and claim their way is superior and this situation repeats three to five fold before the current day. The old developers then become “ghosts” of our history.

The application gets into this liminal state of being “complete” (actually a well-known and appreciated fallacy in dev circles, but bear with me), owned by nobody (as those people have left and newer priorities meant the new people haven’t seen this app yet) and yet somehow business critical. I’m talking “people don’t get paid if this doesn’t run”, business critical. The app logs nothing to nowhere, and yet people rely on it intensely and would tell you quite quickly in all-caps if it wasn't working.

Perhaps this application is deployed to some sort of cloud compute environment and runs as its own function or suite of functions. Can’t have it running in a monolith as a worker because that’s boring and doesn’t add any keywords to your resume for potential recruiters to find -- aka Resume Driven Development. How those functions tie together is a corkboard-and-red-string job for the lucky person who finds this app later.

Time comes along and does its thing and the people who run the cloud compute environment say “we’re not going to support that version of that language any more because it’s _old_”. This announcement is made so far ahead of that deadline that nobody within the business seems to mind.

The future arrives the next day, or it feels that way.

By then, the security auditors come along and say “we require you to keep your systems up to date as possible, and yes, we mean even down to your packages.” And they make the very strong implication that if this isn’t done, that you may as well all go on a big company-wide holiday until it is. On a budget, of course, because if the company isn’t running then nobody’s getting paid a whole lot of anything.

Then the serious discussions about how to approach these upgrades happen. Lots of stern faces. Me remaining mum about my borderline-obsession of banging the drum of “upgrade your apps or you’ll regret it” aka “pay the piper”. People really don’t like to hear “we’re spending time upgrading apps” when instead they could be hearing “we’re spending time delivering business and/or stakeholder value", aka earning the dollars to keep things afloat. The dollars are nice, sure, but we can’t earn dollars if we’re not compliant with what our auditors require. So the audit wins the priority battle when a deadline is issued.

(Anecdata: on the time split: 70% Value vs 30% maintenance is a good balance that works for my team, we’ve found. We track this mostly by doing what a lot of teams do:
wetting a finger and sticking it in the air. On a good day we might even try to get the data out of our ticketing system.)

That particular box of radioactive applications gets handballed around until it lands onto someone’s lap and then they get to have a “learning and development journey” of upgrading multiple applications of all sorts of flavours and varieties (think: gourmet ice cream shop, but apps), because from about 2013-2018 people decided microservices were the go. It becomes evident very quickly that someone or someone’s were practicing the aforementioned resume driven development.

The task of auditing these applications and upgrading them should fall to a whole team, but more than likely it’ll land in one person's lap. They can recruit others to help, and they’d be pretty silly not to. It’s always a huge task.

---

The upgrade begins. The mind initially turns to questions like “How bad could it possibly be?”, then “What were these developers on?” and finally arriving at “Why, oh God why?” -- a milder version of the Five Stages of Grief -- as app after app reveals gradually the eldritch horrors of past coding styles, methodologies and arcane deployment strategies filled with reams of equally dubious and artisanal YAML. (Were these developers being paid by the line?)

(Of course, the way we code _today_ would **never** be viewed with that particular lens. Us being absolute beacons of
perfection having learned so much over our long and storied careers, unpressured by deadlines and unbiased by our current obsessions.)

The archaeological layers of these applications are sometimes stone, and at other times more… biological. You start to learn the quirks and styles of developers and can sight-identify code-strata where _this_ block of code was written by Dev A, but _that_ block of code was Dev B.  And this block of code was disputed territory. Both devs haven’t worked at the company in nearly half a decade. Their names aren’t recognised by most people who are current employees. A search online for them turns up only the fact that they probably existed.

Both devs write good code in parts. You’d tick it in a PR review, or perhaps leave a pedantic comment about nested ternaries being unsightly. You imagine in-person meetings, perhaps at a meetup or a conference, between yourself and these devs, and deciding if during those meetings you want to shake their hand to say “well done” or your head in dismay to say the opposite, depending on what’s in view at the minute.

Dev C, the most recent author in the `git log` history with a commit measuring in the tens of lines, who happens to still work at the company denies all knowledge of having ever worked on or near this system. Yet the proof is right there in black and white, or other colours depending on your terminal theme du jour.

Any attempt to run these apps is met with things like arcane compilation issues because that one particular gem doesn’t work with the CPU architecture of the machine you’re now using. The newer version of the gem will install just fine… just right after you switch to the minimum language version that it now supports. Occasionally, the gem hasn’t received an update since many years ago.

I initially bristled at this thing in particular: (Sass should be a gem, god damn it! It’s always been a gem!) but in the 3-point-something years of my FE-lead tenure I’ve come around to being a zealot of “CSS and JS are tools for the frontend, and the frontend stack is compiled with _these_ tools” where the tools are usually written in one of the holy trinity of Go, Rust or (to a lesser extent) JavaScript. Or I guess in the case of Sass, Dart. The `dartsass-rails` gem looks promising, however.

The gems gets upgraded, and you take extra special glee in removing `sassc` which has a compilation time measured in eons. Rubocop gets told to shove it a few new extra times and some quirks of the code’s setup (such as deprecation warnings) are addressed. Perfection is never achieved not only because it’s extremely subjective but also because time is relentless.

---

These ghosts of the past were doing what they thought was the right thing that was acceptable under the circumstances and conditions that they were working in. Looking at the code now, is it still the right thing? That depends on who you’re asking. Code is subjective. There are arguably the “best” way to do certain things (hello, sorting algorithms) and then there are multitudinous ways of saying “put this JavaScript code on a server somewhere and make it wait for things to happen, so it can tell other things to happen”. That is where things get murky: the points of differences between how they, the ghosts, would do it and how I, the lead developer living in this current time and being tasked with working with this app in the _here and now_, would do it.

Tastes change. The right way to write and deploy an application is akin to shifting sands. Even this week, the release of Docker’s “bake” command will change how I personally build apps. What was in style five years ago can be, considered a taboo in modern times. The blessed becomes the unspeakable. Developers are a finnicky bunch.

I’ve left unintentional sins in systems I’ve worked on in the past, I’m sure of it. There’s stuff I’ve written that I’m certain of being a net-negative outcome of the apps I work in right now. Unintentional booby traps waiting to catch the next developer who happens across them. There’s other stuff I’m more on the fence about (such as when I introduced and encouraged the use of GraphQL and integrating it with TypeScript — let’s call it 65%/35% love/hate today). And then there’s stuff I’d use as exemplary things during an interview (while sweeping things in Category 1 waaaayyy under the rug).

I think we need to be kind to the ghosts that have left their fingerprints on the systems we work in and on. They, overall, were doing their best. And I also think that we, being the ghosts of the future, need to strive to do our best to leave the _best_ kind of fingerprints we can now. And to be kind to _ourselves_ when the circumstances and conditions mean that we have to be flexible on what “right” means today.
