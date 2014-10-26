--- 
wordpress_id: RB-359
layout: post
title: Rails 4 in Action Status
---

In (I think) April of 2012, I signed a contract with Manning to write a "second edition" of Rails 3 in Action, which almost immediately changed its name to "Rails 4 in Action". The goal was to update the code for the book to Rails 4 as that was going to be released soon (it ended up being released in June 2013 -- a year and a bit later -- but still!). A short period of time later, I quit the project because of [my frustrations with Manning's tooling](http://ryanbigg.com/2012/11/no-more-writing-for-manning/). The same tooling which I've offered to help them fix over the years, only to be told that they're already working on something. I have seen emails on the internal "Agile Author" mailing list showing that they've been working on this tool since *at least* the beginning of 2012. Nothing has eventuated from that in over 4 years.

Anyway, about the book: Nothing happened for a while on the book after I quit the project (for about a year), so I emailed Manning asking about it in January '13 and I asked about getting the rights to the book:

> I've noticed that there hasn't been a lot of activity on the Rails 4 in Action book recently. I am curious if Manning is still interested in publishing the book, or if you are too tied up in the other numerous books you have to care about this one. I know this book was never a bestseller, right up there with the books like jQuery in Action. But I still deeply, deeply care about it because it was a part of my life for so long.
>
> I'd like to propose something. I want to take the rights for the Rails 4 in Action book and self-publish it, with a different name and a different cover. I understand that this is an unusual request, given that we've signed contracts and what not.
>
> My main reason for doing this is two fold. 1) I want a decent reference for the Rails community that I can put my faith in and 2) I still care a ton about this book, but frankly not enough to come back to Manning to finish writing it.
>
> I understand that there'd probably be some messy legal issues around doing this from your end, but I'm genuinely interested in taking the entire project off Manning's hands completely. 

My main contact at Manning, Mike Stephens, wrote back to me: 

> Ryan,
>
> Sorry ‘bout the delay. Another Manning editor has been responsible for moving the revision forward, and it took me a couple days to get an accurate status. I didn’t want to reply until I had all the data. Short version is that we have someone solid lined up to do the R4 revision in a timeframe that I’m happy with.
>
> Let’s talk later this week is we can find a workable time and I’ll fill you in.
 
> Mike

I can't find the conversations that we had past that email (I'm guessing they were on Skype), but the outcome was that Manning was not interested in giving away the rights to the book, no matter how much I asked for it and explained how much it was something I deeply cared about it. I was, and still am to this day, very upset by this.

Then Steve Klabnik joined the project. He was the "someone solid" that Mike talked about. "Solid" doesn't even *begin* to cover the work that Steve did on Rails 4 in Action. Steve did an amazing job upgrading the book to where it is today: with Rails 4 support. Steve has lost interest in the project and moved on to other things, helping out the Rust community and all the other stuff he's doing. I don't blame him for it because writing is (inherently) boring. During writing, nothing much happens for quite a long time and then BOOM at the end of it you have a book and (most) people like it. To have stayed the course as long as he did is a spectactular feat in and of itself.

I have been wanting to write a more up-to-date version of Rails 4 in Action covering the construction of the [book review tool called Twist](https://github.com/radar/twist) that I wrote specifically as a way for readers of the Rails 3 in Action book to read it and leave notes in a super-easy fashion. I don't want to work on updating Rails 4 in Action because Manning's tooling drives me to tears and that's more than a metaphor. I thought a book covering this would be a fantastic addition to the current collection of intro-to-Rails books out there. More example applications and books can only make things better. I've got about 8,000 words for this book already.

In order to cover my legal bases, I found the initial Manning contract that I signed back in 2010 and it states in Section 5:

> For a period of three years following the publication of any edition of the Work, the Author agrees not to, without the prior written consent of the Publisher, write for publication or post on the Internet any  other book-length work which covers the same subject as the Work and which is directly competitive with the Work.

It may seem like I'm in the legal clear here because Rails 3 in Action was published in September 2011, which is more than 3 years ago and therefore that means I'm allowed to publish my new book. This would be wrong, because it *could* be argued that Rails 4 in Action is published, because its content is available online. If this is the case, then the next time that I can publish a new Rails book would be 3 years after the last edition of Rails 4 in Action has been published.

That same clause states that I can ask for permission to publish a new book, and I have asked Mike Stephens for that permission last Tuesday (Oct 21), but have received no response back.

There's a clause later on which states that if the book is declared out of print by Manning, then the rights revert to the authors. Manning has declined my offer to declare the book "out-of-print".

I am effectively legally "trapped" by Manning's contract and my options are 1) forget about Rails 4 in Action, write the new book, get sued 2) put aside differences with Manning's tooling, update Rails 4 in Action 3) disappear into obscurity. 

I'm going to choose #2 because #1 and #3 are not exactly my definition of a good time.

Since I've chosen to help out on Rails 4 in Action, I contacted Steve Klabnik on Tuesday (Oct 21) asking if he would like my help with the book. I learned that another author called "Steven" has been asked to perform a technical update on the book, but hasn't done much at all. Steve Klabnik put me in touch with his development editor, Susan, and Mike Stephens and we're going to talk about future work on Rails 4 in Action.

The things that I want to talk about during that conversation are:

1. A possible transfer of rights to Rails 4 in Action to myself (again). I think Manning will again decline the offer, but I still really really wish for this. If I don't get the rights then I will be really heartbroken again.
3. If getting the rights isn't possible, then I'll ask about what I can do to help out on Rails 4 in Action and get that across the line to publication. It's not fair on the wider community to have a book that *they've paid for* to sit there stagnant for much longer. The Rails community deserves a great, up-to-date Rails book and so I would put aside my differences with Manning's tooling and publish it with them. Much to my own personal chagrin. I know, I'm *such* a martyr. 

This weekend I've gone through the first three chapters of Rails 4 in Action book and have taken notes of things that need upgrading. There are a lot of things. So far, I've found 70 things within the first 91 pages that I want/need to change. So there's definitely work to be done, I just need to know if Manning's interested in continuing this work or if they're willing to give me the rights and I continue it on myself and perhaps with other member's of the community's help.

The work Steve Klabnik did on the book brought it up to scratch with Rails 4 and the new RSpec expect syntax, but not RSpec 3. There is a large chunk of work still to be done upgrading it for Rails 4.2 and RSpec 3. There will probably be other parts that will need upgrading as well. The upgrade is going to take another couple of months from what I can tell, and given that we're getting to the tail-end of the year I wouldn't expect this book to be published any time before March next year.

Thanks for being patient with us all. We will get this damn thing published.

