--- 
wordpress_id: RB-305
layout: post
title: "Whodunit: Devise, OmniAuth, OAuth or GitHub?"
---

(If it wasn't obvious enough: my previous blog post about Rails 3.1 in Action is an April Fools joke. If Rails 3.1 is released before Rails 3 in Action goes to print, Rails 3 in Action will most likely contain the 3.1 updates necessary)

I'm currently writing what is the final chapter in Rails 3 in Action and I'm pretty excited about it. It's the "Alternative Authentication" chapter, Chapter 14. It's not to say there are 14 chapters in the book... there aren't. There's seventeen chapters two, maybe three appendicies. This happens to be the last chapter I have to work on and its number is 14.

When I begun writing the book back near the end of April last year I sketched out the idea of this chapter thinking it would be a good thing to show people because a lot of people seem to struggle (myself included) in setting up alternative means of authentication using OAuth (and OpenID, etc.) providers. I personally had no idea what I was going to do write in it at that point in time, but that's how I've been writing the book thus far and it's turned out pretty alright I hear.

Then a couple of months ago, <a href='http://github.com/intridea/omniauth'>OmniAuth</a> came onto the scene. My god, it was like Christmas came early. It claimed to simplify the authentication process of alternative services down to its most basic forms. I distinctly remembering trying it out almost immediately and staring in starry-eyed wonder at the process as it worked seamlessly with Twitter and GitHub. That was back in November and I had other chapters I was working on then, like Chapter 11.

With the final chapters of the book I've adopted a "work on whatever you feel like" stance with them, as they aren't required to be done in any particular order. For example, I did the "Engines" chapter (16) before I did the chapter on "Basic performance enhancements" (15) and "Rack applications" (17). It just so happened that Chapter 14 got left to last.

So I worked on it beginning the middle of last week, implementing basic Twitter authentication and writing a pretty decent first draft of it over the next two days. Then on Friday I accidentally deleted my work for the chapter up to about the 20th line in the document (from somewhere around the 350 range) when I ran one of my publishing scripts over it. I had no backups, and it wasn't version controlled. I felt like an idiot.

Over this past weekend I've re-written all of what I did with Twitter on the Friday night and Saturday (which was a poor day of writing, was too distractable). Sunday morning I revised the section and Sunday afternoon I begun in my attempt to use GitHub. That's when things stopped flowing.

When I write the book I attempt things in the ticketee application first and then just copy over the working code samples from that into the book. It's a little bit of a laborious process, but it's worked so far (I know there's better ways, I just don't have the time to do them). When I attempted GitHub authentication using Devise 1.2.1's OmniAuth (0.2.1) authentication support it told me "Invalid credentials".

I was incredulous. How could I stuff up something so basic when it worked so well with Twitter? I spent the afternoon calling Devise nasty names both out loud and on Twitter and went to bed early, defeated. I could not for the life of me figure this out.

I awoke after a terrible night's sleep (the kind you have when the problem is right there and you know the solution is there, but isn't). I dreamed mostly of code. I awoke feeling strangely refreshed at 6am and did the usual morning things before attempting the problem again.

I made sure I had the absolute latest version of Devise and OmniAuth. I did. 

I made sure I was able to create a new GitHub application and duplicate these conditions, both on Ticketee and on a brand new Rails application. I was able to do that too.

I was still utterly convinced it was something Devise was doing. I had pointed my finger squarely at it for the past 9 awake hours and why should I question my opinion then? I wanted to make extra sure, so I tried *another* brand new Rails 3 application but didn't use Devise. I used straight OmniAuth (thanks to <a href='http://railscasts.com/episodes/241-simple-omniauth'>Ryan Bates' superb Railscast on it</a>) and it still didn't work.

Blast! My prime suspect was no longer prime, nor a suspect! So it was something to do with OmniAuth then, perhaps. I found an application called <a href='http://github.com/markusproske/omniauth_pure'>`omniauth_pure`</a> which claimed to offer a basic example of OmniAuth authentication. I tried this and...

It worked! The damn thing worked. So what was different? Well, I noticed that they were using an older version of the oa-oauth gem (v0.2.0) where I was using v0.3.0. I suspected a problem had been generated between these two versions, and my finger was then pointed at OmniAuth as being the source of all my trouble.

I cloned `git://github.com/intridea/omniauth` into the `vendor/gems/omniauth` folder of my application, update the `Gemfile` accordingly, and tried it again and it was still broken. Ok, it still looked like an omniauth problem. So I did a <a href='https://gist.github.com/912916'>git bisect</a> (saviour!) and came up with a commit by none other than Michael Bleigh himself: `72b9b619bbc2a41b61ee4ec108bdfa4dc16838f9`.

Aha! This commit bumped the oauth2 dependency and, according to `git bisect`, that commit is to blame for my source of woe. But it's not, because it's innocently bumping a gem version up, it's actually oauth2.

So my finger now switches for a second time to the oauth2 gem. I clone this into the `vendor/gems/oauth2` directory, update the `Gemfile` and do a git bisect on it. The <a href='https://gist.github.com/912926'>results</a> indicated a commit that I could blame for all my troubles.

<a href='https://github.com/intridea/oauth2/commit/1dbfe18af997c45a69fdea29192f599f20d80879'>This commit.</a>

It dutifully changes a small detail, the `@token_param` to be the <a href='http://tools.ietf.org/html/draft-ietf-oauth-v2-10#section-5.1.2'>OAuth2 draft 10 specified (in section 5.1.2)</a> "oauth\_token" rather than "access_token". This means that all providers who have updated to this draft specification are now supported by the oauth2 gem but those who have not, *like GitHub*, are left behind.

Ladies and gentleman, after my long story, let me present to you Exhibit A, direct from <a href='http://develop.github.com/p/oauth.html'>GitHub's OAuth documentation</a>:

<img src='https://img.skitch.com/20110411-qn2ps6uckm4deq851ubydjtf71.png' />

A keen eye, keener than my own, would notice here that the parameter is not called "oauth\_token" as is being supplied by the oauth2 gem now as of the afore-mentioned commit, but rather it's still called "access_token".

I submit to you that GitHub's OAuth 2 specification is broken, but the <a href='http://support.github.com/discussions/site/3398-your-oauth-implementation-is-broken-but-heres-a-fix'>fix is extremely easy</a> and only GitHub (or a hack to oauth2) can fix it.

That was quite a lot of frustration caused by that one small little detail. This was very fun to track down and the high I got from solving it was well worth it. It's one of the things I enjoy most as a programmer is solving a difficult bug.

<strong>Update:</strong> It was later <a href='https://github.com/intridea/oauth2/issues/44#issuecomment-993151'>found out</a> that <a href='http://tools.ietf.org/id/draft-ietf-oauth-v2-15.txt'>Draft 15 of the OAuth2 Specification</a> actually reverts that change, making it back to `access_token`, meaning that the `oauth2` gem is technically wrong in this case.

The problem itself won't be fixed until the OAuth2 specification solidifies or `oauth2` hacks around it to support different services calling this parameter by different names.
