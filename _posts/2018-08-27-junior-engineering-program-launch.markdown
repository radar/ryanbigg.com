---
wordpress_id: RB-1535325290
layout: post
title: "Junior Engineering Program: Launch"
---

Over the last year, a lot of my time has gone into developing and running a Junior Engineering Program at Culture Amp. This program ran for a total of 6 months, but the preparation took a bit longer.

Within this program, we taught 10 junior developers the fundamentals of programming. The juniors learned how to work effectively in teams and amongst themselves, as well as learning about Ruby, PostgreSQL, Mongo, Rails, JavaScript, Flow, React, JSON APIs and GraphQL, all within 6 months time. Our target was for the juniors to become "confident and capable engineers" and we have succeeded in that target. They're now super-powered juniors!

In this post, I'm going to cover how we launched the Junior Engineering Program at Culture Amp.

In subsequent posts, I'll go into more detail about the onboarding process, as well as the resources and techniques that we used to teach the juniors.

## Getting Started

I've been mentoring junior developers for close to a decade. I do it because I have always got a thrill out of the “lightbulb moments” that happen when I’m doing that mentoring.

In April of 2017, Culture Amp had an internal "Hackathon" and one of the ideas to come out of that was a "Graduate Developer Program". This ignited the interest in the company of running a structured program where we would hire more junior developers and provide structured training to the juniors that we already had, as well as providing the same training to the new juniors.

The idea was not immediately implemented after the Hackathon, but nevertheless the conversation continued for a couple of months and it picked up steam. I talked with a lot of people at Culture Amp about running a program, and a few months later it was decided that we would hire somewhere between 2-4 junior developers and launch this program.

Around about the same time, [Hooroo](https://hooroo.com) was working on launching their own Graduate Developer Program. I had a couple of great chats with Elle Meredith and Stu Liston from that program which influenced parts of what I did with Culture Amp's program. I'm grateful to them for those talks.

## Advertising
We didn't exactly have a pool of junior developers who we could call up and ask if they wanted to apply for a job opening, and so we had to advertise these new positions.

We created a small landing page for this purpose:

[image:4A778C9D-7B59-42FA-BBD4-413E31DF4B92-482-000018CF2A352014/3974D99A-9425-4A53-B50A-95C43796445B.png]

We advertised this page through out social networks, and by word of mouth. Within the first week we received 50 applications. By the cut-off date of August 25th, 3 weeks later, we had received 129 applications. Quite a few of those were on the very last day!

We quickly realised that we had a _mountain_ of work to do. We had to filter down all these candidates to just a small handful.

## Resume Screening
We read every single resume that was submitted to us, which took an extremely long time, but was well worth the investment.

What we were looking for was an interest in programming, and perhaps some examples of some development work that had been done. Even toy projects were good to see! It didn't have to be Ruby. We liked seeing anything in Ruby, JavaScript or even some HTML + CSS work.

Outside of the tech sphere, any work done within a team setting at another workplace was also seen as a big plus.

## The Initial Interview
While the applications were open, we started our initial interview process. This was a quick 30 minute chat over Zoom with all the candidates who applied, just to see who they were and what their interests were. 104 candidates got through to this stage.

We tried to call as many of the candidates as possible to speak to them for this initial interview.  We ran into some problems getting in touch with some candidates after they applied: we couldn't contact them via email, or phone. This meant that some of the candidates missed out!

This initial interview went well: the best candidates felt like the ones we could talk to for much longer than half an hour!

This whole process took about two work weeks for two of us (Thang Ngo and myself) in our booths calling candidates. It was exhausting work, but when a great candidate came along it really sparked me back up.

Some candidates did not pass this initial interview. They did not have any prior experience with programming -- and we were definitely looking for this. We also liked hearing about those who had done some Ruby, but that wasn't as strict a requirement as programming in general. But this was a pretty low bar. We could've improved this part of the process by being stricter about our requirements.

Candidates that "passed" the initial interview were sent a coding test.

## Coding Test
We purpose-built a new coding test for juniors that applied through this program after realising our existing coding test would be too hard for juniors. This test required juniors to demonstrate an understanding of working with fundamental features of Ruby. I'm going to leave that description intentionally vague, as I'm probably going to re-use some ideas from that test in the next version.

The test was split into 6 different "sections", which had an increasing grade of difficulty per section, with the final section being just that little bit harder than the previous 5. This last section contained problems that we'd expect most juniors to struggle with, but it was put in the coding test to be that little bit of an extra challenge.

Out of the candidates that received this coding test, 69 of them sent it back to us within two weeks for a review, meaning only half of the candidates made it this far.

## Coding Test Feedback
I gave a talk at [Melbourne Ruby in October on "Designing the Perfect Coding Test"](https://www.youtube.com/watch?v=DiYjDHKSH-Q))  where I cover more about this coding test, but here's a quick summary.

When building the coding test, we also built a rubric with information on what a "good" submission would look like, the kinds of things we cared about and what we'd forgive.

In this coding test, we cared _a lot_ about the cleanliness of the Ruby code submitted and ran [Rubocop](https://github.com/bbatsov/rubocop/) with a custom configuration -- as Rubocop's default rules are a little _too_ pedantic. We ran Rubocop over the code to determine if the code complied with Ruby style guide best practices.

As an example of something we didn't care too much about: if someone used `collect` instead of `map`, we didn't mind. The same goes for `find` instead of `detect`. These methods function the same, and it's OK if a junior only knew one and not the other.

We had a team of reviewers to review these tests, to ensure there was no bias in the reviewing process. These reviewers built feedback by reading the coding test and checking it against our rubric.

Reviewing a single coding test took me about 30 minutes on average, and I reviewed about 50 of the coding tests. This required about 30 hours split between two work weeks and a lot of patience.

We decided that we would send the feedback to the candidates after we reviewed the coding test. We wanted to give juniors Actionable, Specific and Kind (A.S.K.) feedback on their coding test so that they could know how to improve for the future. We consider this an investment in the future potential of the juniors.

This feedback included suggested ways of writing code, similar to the sort of comments we might leave on a GitHub Pull Request. It also included recommended reading if we thought there could be something out there that might help the juniors learn.

The juniors were incredibly grateful for the feedback that they received. Here's some of the feedback on the feedback we received:

* The feedback provided is very valuable information which will help me improve for future interviews.
* I wanted to say thank you for the detailed feedback that was supplied for the coding challenge.
* Thank you for the feedback. I feel like I've already learned a lot from it.

This was really heartwarming meta-feedback to receive from the juniors and we will definitely be doing this again next time.

## The Social and Tech Interviews
I would say that more than 50% of the juniors that submitted the coding test "passed" the coding test; roughly 35 candidates by this stage were, according to what we were looking for, suitable for the junior position. But we only still had 3 positions to fill!

The next stage of the process was to be a two-interview process where we would bring the candidates into the office. We closely reviewed the best coding tests again and chose the group that would proceed through to the next stage. It ended up that just 16 of our candidates reached the 3rd stage of our interview process, or about 12.5% of our initial applicant pool.

This stage comprised of two interviews: a social interview and a technical interview.

### The Social Interview

The first interview was an hour-long "social" interview, where we got to know the candidate a bit more. We endeavoured to have a diverse group of interviewers, with a mix of genders and people from different teams doing the interviewing.

In this social interview, We asked harder questions than the "initial interview" to gauge how enthusiastic the candidates were, talked about examples of their teamwork in the past, and asked them how they'd like to grow. This was a great opportunity to get to know our candidates a lot better.

We had this interview as a part of our process as we wanted to hire _socially_ brilliant juniors, not just _technically_ brilliant ones.

The people who were successful in this interview were those who were the most outgoing, excited and eager people. They could hold a friendly chat with our interviewers for half an hour with ease and enthusiasm.

### The Tech Interview

The second interview was another hour-long interview, this time focussing on the candidate's tech skills. This was also done by two people of mixed genders from the engineering team.  We started with a gentle introduction containing a couple of tech questions to gauge how well the candidate could speak about their knowledge.

In the 2nd part of this interview, we asked the candidates to expand on their own coding submissions, using their own tests and code.

We emphasised at this point that the candidate didn't need to complete this part of the coding test. In fact, the task we set in this coding test was designed to be unable to be accomplished in the 30 minutes we allowed for it. Or so we thought! There were a small handful of juniors who did manage to get through it, and that was impressive.

As I said before: we didn't care about completion though. We cared more about these things:

* Could the candidate explain their thought process well?
* Could they ask for help when they got stuck?
* Would they approach the problem by writing tests first, and then the code?

The first two things here are critically important skills for a junior developer to have, and not just because they're well-aligned with Culture Amp's value of "have the courage to be vulnerable".

It's because a junior developer who can explain their thought process well gets practice explaining their technical thinking to other people, which is an excellent skill to have as a developer. Asking for help when stuck shows that the junior can easily reach a point of being comfortable to ask others for help. As a junior, there's going to be _a lot_ of times where you don't know something. Asking questions to get answers to figure stuff out is a lot of what a great junior will do.

The final one was not as cared for as the first two, but more of an interesting artefact: has the junior practiced TDD / BDD before? We check for this at Culture Amp because all the work our developers do is tested in this way. We didn't really care about the _style_ or framework of the tests, just more if they would write them or not. Writing tests is a great habit to be in. It makes you think more about the code you're writing and allows you to check your assumptions in an automated fashion.

## Picking the final candidates
By the end of the interview process we had more candidates that we loved than we had open roles. We went back to the teams and had some intense conversations, and ended up finding two more teams willing to take on a junior, bringing it up to 5 juniors that we could hire.

We hired our top 5 candidates, from the 16 that we brought in for interviews, and out of the 129 that initially applied. These were the "top 4%" of all candidates that applied. Another interesting tidbit is this: Out of these top 5, 4 were women. Women tended to grade higher on _both_ the social and technical tests than the men.

## Founder interview

For every candidate that goes through any Culture Amp interview process, they go through one final stage at the end: the Founder Interview. This isn't a "pass or fail" type of interview. It's more of a chat with one of our founders where the founders get to meet the candidates that the rest of us have decided are good enough to hire.

After this founder interview, contracts were issued and signed. We had 5 new juniors about to start!

## Lessons learned

No process of hiring is ever perfect and what works for one person or company will not work for all.

We had 104 people pass our initial resume screening, which meant that they went through to the "initial phone interview" phase. This is a lot of people to call!

To speed this up next time, we're going to try something different at the start of the hiring funnel: we'll send the junior developers the coding test directly after the resume screening point. In place of the initial chat, we'll be running a few "open house" events so that the juniors can come in and tour our office.

We will also be altering the coding test to provide some more room at the top-end of skill. Grading the _really good_ coding tests was difficult because there wasn't much to differentiate them on. After now mentoring a group of juniors, we now have a better idea of what where we'd expect their skill level to be at from the outset and we'll adjust our coding test accordingly. This isn't to say we'll make it _drastically harder_ -- that would just be mean! -- more like we'll just test for slightly different things.

_Thanks to Rebecca Skinner, Kim Dowling, David Carlin and Jo Cranford for reviewing this post._

---

In the next post, I'll cover how we brought these juniors into Culture Amp through our onboarding process.



