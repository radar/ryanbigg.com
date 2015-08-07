--- 
wordpress_id: RB-364
layout: post
title: My self-publishing success story
---

Everyone loves a good success story. Here's mine. I'll cover my experience
going through a traditional publisher with Rails 3 in Action and have that
fail, and then discovering joy and happiness through the path of self-
publishing my own books through Leanpub.

### Rails 3 in Action

I was approached in 2010 to write a book called [Rails 3 in
Action](https://manning.com/katz). I was so very excited to join that project
and write a book. Excited because up until that point, the longest thing that
I had written was a few of the Rails guides. A book would be an excellent way
to share my knowledge about Rails with the worldwide Rails community. So I
signed up.

Then it didn't go so well. I wrote about that in a couple of other blog posts, mainly ["Don't Print Hard Copies"](http://ryanbigg.com/2011/11/don-t-print-hard-copies), ["The Writing Process"](http://ryanbigg.com/2010/12/the-writing-process), ["No more writing for Manning"](http://ryanbigg.com/2012/11/no-more-writing-for-manning/) and more recently, ["Rails 4 in Action Status"](http://ryanbigg.com/2014-10-26-rails-4-in-action-status). The long and short of it is that I found Manning incredibly hard to work with due to their tooling and my tendency to want to control everything from how the book looks to when I push updates to its content.

So I quit that project because it was causing me a lot of stress to have to
deal with the tooling and to not be in control of things.

Then I rejoined it again in November last year because Steve Klabnik burned
out from the tooling and writing process, and also because I wanted to not
have Steve's work go to waste. I brought on Rebecca Skinner as a co-author at
that time too. We set about updating the content for Rails 4.2.

Then I quit again in April of this year due to the same reasons I quit the
first time and let Rebecca finish off the book. It's currently going through
proofing through Manning's processes. And by "currently" I mean it's been in
there since April. 3 months to proof and print a book seems a bit long in my
opinion, but what can you do about it?

### Multitenancy with Rails

After I quit Rails 3 in Action I was burned out quite heavily. I took time off
from writing and moved from Sydney to Melbourne. Then when I got to Melbourne,
I had the itch to write something again: [a book about building a multitenanted Rails application](https://leanpub.com/multi-tenancy-rails). I talked with my friends Phil Arndt, Josh Adams and Rob Yurkowski about this project, and somehow [Leanpub](https://leanpub.com) came up.

Leanpub lets you write books in Markdown and upload that Markdown to a Dropbox
folder. To push new updates, you go into your account's dashboard and hit the
"Publish" button. This was a welcome change from writing in XML and uploading
books to an SVN server and then using a website built in the late-90s or early '00s! 

(Alternatively, you can generate your own files and upload them to Leanpub too if you don't want to write in Markdown. This is what I've been doing for [Deep Dive Rails](https://leanpub.com/ddr) and it's working wonders.)

The change to Leanpub was... it was life-changing. Publishing a book didn't
have to be hard! I could just push a button whenever I felt like it and the
readers could be reading what I wrote in a matter of minutes. Leanpub made
everything so much easier compared with manning.

I wrote Multitenancy with Rails over about a year and all the while during
that time, something interesting was happening: people were buying the book
and I was getting money for it each month. I originally sold the book for $10
and then raised the price $5 for every chapter that I completed. This way, it
gave people the incentive to get on board (Rails pun!) with reading the book
before it was complete.

This had two awesome effects:

1. I would get money each month as more people bought it.
2. I would get feedback on the early drafts from readers.

### Royalties

Here's the royalties chart for all of my income from Leanpub:

![Leanpub Royalties](/images/success-story/leanpub-royalties.png)

Contrast it with the royalties I get from Manning:

![Manning Royalties](/images/success-story/manning-royalties.png)

The monthly income is a great motivator to the writing process because it's a
monthly reminder that people think it's worthwhile buying and (probably)
reading the books that I publish on Leanpub.

Secondly, the royalty split between Leanpub is much nicer: they take a 10%
slice of the royalties, + 50 cents. This means that when I sell a book for
$20, I make $17.50 from that, and Leanpub makes $2.50. Roughly 35% of that
$17.50 ($6.125) goes to tax, but the rest ($11.35) is mine to keep.

Here's a pie chart:

![Leanpub Royalties split](/images/success-story/leanpub-royalty-split.png)

For Manning, it's harder to break this down because the royalty rates vary
between 12.5% for print books, and 50% for ebooks. I get a royalty statement
from Manning every quarter which has the numbers so I can break it down.

Rails 3 in Action has sold 2,003 print books and 2,371 ebooks. The price has
been the same forever: $50 for the print book with a free ebook (counted as a
print book sale) or $40 for just the ebook. So with those numbers in mind, the
total made for Rails 3 in Action over all time has been $100,150 for the print
books and $94,480 for the ebooks.

Using the royalty split above, we can work that out that the authors get 12.5%
of $100,150, which is $12,518.75 for print books and 50% of $94,480 which is
$47,240. A grand total of $59,758.75.

The rest of the money, 87.5% of $100,150 ($87,631.25) and 50% of $94,480
($47,240) goes to Manning. A grand total of $134,871.25.

This is what the split between publisher + authors looks like for Rails 3 in Action:

![Manning Royalties split](/images/success-story/manning-royalty-split.png)

(Tax isn't shown on this chart because the "Authors" royalties are split
between Yehuda and myself and we pay different tax rates. While I know my tax
rate, I don't know Yehuda's!)

Manning receives over two-thirds of the money earned for Rails 3 in Action and
will earn the same split for Rails 4 in Action. This is a personal sore point
for me, because I'm a greedy bastard and for plenty of other reasons... but
let's not dwell on that point for too long.

Let's move onto something way more interesting: the feedback cycle!

### Feedback cycle

When publishing a book, you kinda want to know immediately if anyone's reading
it. A good indicator for this is the feedback that comes through in the form
of, mostly, errata reporting. Errata reporting means that people found errors
in the book, and that means that they read the book! That's great!

Fixing those errata reports quickly is essential to producing a high-quality
book. The faster you can kick out a new edition of the book and solve the
error, the sooner it'll be that nobody will ever come across _that_ particular
error again.

With Manning, the process was this:

1. Find mistake in book and fix it.
2. Commit the fix to SVN.
3. Get rejected for the commit because some other author has pushed their book to SVN since the last time you did.
4. Checkout from SVN.
5. Commit the fix to SVN for real.
6. Go to Manning's author-only site and login.
7. Find your book in the list of books.
8. Click the gear icon.
9. Find the chapter that you updated.
10. Scroll down the list of revisions for that chapter.
11. Click the radio button to select "Latest" (which uses the latest version of that chapter) and then click "Update". This flags this particular revision to be ready for Manning's system. 
12. Wait for someone from Manning to publish a new MEAP copy, which can take weeks.

12 steps and it takes a couple of weeks (usually) until the book is updated.

With Leanpub, the process is this:

1. Find mistake in book and fix it.
2. Commit change to GitHub.
3. Copy file to Dropbox folder. (can be optional if you get Leanpub to read from GitHub!)
4. Go to Leanpub's author-only area for the book.
5. Click "Publish", "Publish New Version"
6. Hit the big blue button "Publish new version".

6 steps and the book is available instantly for readers! During the publishing
process you can enter release notes as well. On Leanpub, the choice to release
a new version of a book is in the hands of the author, and not the publishing
company. This is the way it should be: the author typically has one book on
the go, whereas a publishing company has many. This 6-step process is the kind
of process I could only dream about when writing Rails 3 in Action.

For readers to send feedback to a Manning book they have to submit new topics
to a forum. This makes it really hard to track which topics have been
addressed and which haven't. For the update of Rails 4 in Action, we created a
repository on GitHub at
[rubysherpas/r4ia](https://github.com/rubysherpas/r4ia) and asked readers to
file issues there. That way, when we fixed an issue on the book properly, we
could close it with a simple commit message like "Fixes rubysherpas/r4ia#10".

If I was collaborating on a book again, I would definitely go down the GitHub
repo-for-errata path again because it makes that aspect of the writing process
so much simpler.

For Multitenancy with Rails, I've gone with more of a personal approach: I've
included my email in the foreword to the book and asked if people encounter
errors that they email me directly. This system works really well as I use the
unarchived emails as an indication of what book bugs haven't been fixed yet.

### Conclusion

Ultimately, writing a technical book for a publisher is not in anyone's best
interests except the publisher. The same is probably true for other types of
books.

The lack of control and the unfair royalty split are the two major issues that
anyone writing for a publisher will face. 

Regarding the control aspect: the publisher will decide things like how your
book should look, when updates get released, who can review it, who the tech
proofers are and when it gets published.

The royalty split is definitely a major sore point. Does a publisher deserve
(almost) 70% of your book's earnings? One way to answer the question would be
to ask another question: "Did they do 70% of the work?". You could then argue
that the act of writing a book takes longer than any effort involved to print
or market that book and therefore it should be the author, and not the
publisher, who gets the 70% of the split. You can argue the other way too:
print books cost money and everyone along that particular supply chain needs
to get a cut of the money somehow.

You could, of course, not print a physical. That's been my suggestion since
late 2011, mainly because it's much easier to update the electronic copies
than the physical ones. I've gone e-book only since then, and not a single
person has asked me for a printed copy of Multitenancy with Rails, Debugging
Ruby or Deep Dive Rails.

So my advice to you, if you've read this far is: don't go with a publisher. If
you've got a great book idea, self-publish it on a platform like Leanpub and
market it yourself. If it's great, people will share it with others and it'll
gain popularity. Whenever the question of a publisher comes up, just think to yourself this:

Is it truly worth getting involved with a publisher? Will my life be better
off for this? If I get involved, do I still own the rights to the content that
I worked so hard on?

If the answer is yes, then great. You've found a unicorn and you should
embrace it and never let it go. If not, then no harm, no foul. 

Just keep self- publishing.











