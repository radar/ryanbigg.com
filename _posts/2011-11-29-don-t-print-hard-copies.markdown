---
wordpress_id: RB-318
layout: post
title: Don't print hard-copies
---

<a href='http://www.manning-sandbox.com/thread.jspa?threadID=47354&tstart=0'>What a fan-fucking-tastic way to end the day</a>. This honestly *really* upsets me, because I alone am powerless to do anything to fix this guy's problem.

You may know that I <a href='http://manning.com/katz'>wrote a book</a>. I may have written during the process
about the difficulties faced and also about how much *it fucking rocks* to have a book published. I've never felt
so damn good for so long.

That's a topic for another day. Today's a rant kind of day. Tonight, I feel like shit.

Let the rant begin.

### Authoring tools

Let's start with the authoring tools that Manning provides.

To author a book, you use Manning's DocBook format, which isn't actually all that bad once you get used to it. Alternatively you could write in Microsoft Word, but I honestly hate it. The documents just feel... unstructured to me. DocBook appealed to me because I *obsess* about ordering and structure.

I created all kinds of macros in TextMate for DocBook and was fucking awesome at it towards the end of it. If there were world championships in DocBook, I would place high. Mum would be proud.

Once I had a chapter ready, I had to upload it to Manning's system. This is done through an SVN repository. I
hate (and I mean, **truly hate**) very few things in this world. Microsoft Word's one of them, and SVN is another. Years of abuse have me close to suffering post-traumatic stress disorder attacks every time it so much as conflicts on a damned file.

Anyway, once the file's uploaded to Manning's system through the version control system from Hell, you get to use
the authoring tool also from the same locale. I shit you not, this thing takes *4* clicks to update a single
chapter. You need to click on the gear icon, click on a chapter, scroll down to the god-damned bottom of the page
listing all the revisions EVER for the chapter (for God knows what reason) (p.s. there's 80+ for some of the
earlier chapters, with each revision taking 4 lines of 12pt text) and then click on the radio button for
"Latest" (the text next to this field doesn't trigger it, of course) and then click "Update".

I got majorly annoyed with this process in about June of last year and created my own system in *twelve hours*. It's goal was to a) allow me to publish updates to *all the chapters* with one command and b) to provide *other people* with a super-easy way to review the book, and it did both of those things, but it looked like shit. I fixed that with version
two, with the help of a friend.

In total, I received ~1,600 notes on the review systems that *I built* and they contributed back in *major* ways to the
book. Want to know why the book's so damned good? Not me. I was just the dude who typed things and put in terrible jokesas footnotes. It's the reviewers. They did all the hard work. Honestly. They read the same chapter again and again and hhounded me about problems. One guy and I even used to chat regularly on Skype.

Those guys rock. Over 30 people contributed *something* to the book. Could've been "missed a comma", could've been "Prototype sucks!". I love them all.

Manning's counterpart to this review system also looks like shit, but only allows for the author and Manning staff
to have access to the book. On one hand, this is great because it stops the inevitable piracy (which, as far as I
know, never happened on my review system), but on the other hand it really sucks because you don't get reviews of the book as you go along from people outside your little circle.

So yeah, authoring tools are... depressing to use. I don't think that any publisher has this nailed yet, although I suspect PragProg has gotten the closest to it.

### The One True Format (But not really)

When I started writing the book, I was given a choice. You know this already, but let me refresh your memory just
in case you dont: it was DocBook or Microsoft Word. I chose DocBook because it's a lovely structured format.

I also thought "Sure, these guys probably have the tools to convert this into PDF and ePub and Mobi and monetary
notes that I can give to people to buy things".

Man, I can be naïve sometimes.

When we went to review, they went through the XML document with this tool I can't remember the name of and it seriously messed with my *obsessive* formatting. I was non-plussed. I asked them to fix it, and they did, which was nice of them. Still, this tool basically crapped all over the XML document.

My review system did not. Notes were kept separate from the content and not stored as fucking metadata inside the document itself. Why did I do it this way? *Because it's sensible*. Down the other path lies madness. I know, because I had to live with that.

That was nothing compared with what happened next. To typeset the book they converted the text into a Word
document. I don't know how exactly they did this (but I suspect it involved the C & V keys on the keyboard, along
with a bit of Control). Seriously.

So now what we have is Word document copies of each of the chapters. Word's review system is very lol-worthy
itself also. As an author, I only really care about one note at a time, not the gazillion that the editor has left
on the page and Word loves to display.

This means that to *update* a chapter, I need to ask Manning for a copy of the chapter *as a Word document*, which
they'll *email* to me, make the fix myself and then *email it back to them*. Or I use their document
management software which was, I'm sure, designed by people who hate their jobs.

Eventually, enough of these changes will be made and there will be the next for a second printing. When that is, not even I know.

So that lovely little DocBook format I got used to, created all the macros and muscle memory for is now toast. My
future is Word documents.

### Why printing technical books is just a bad idea

See, with printed books, it's really hard to update them. You may have noticed this if you have a copy of Rails
3 in Action on your shelf and open to any page <a href='http://manning.com/katz/errata.html'>listed in the
Errata</a>. Has yours been updated? No? Neither have the three sitting on my bench right now.

There's also the problem of this book becoming quickly outdated due to how quickly Rails moves. We actually
upgraded the book to Rails 3.1 in May (the book was printed in September), which was practically "danger close" to
the printing time. I'm so happy that we got this change in, but I fear for the future.

If the book was kept in a proper, structured electronic format and never printed on dead trees, then we wouldn't have this problem. We wouldn't have "Sydney" misspelt as "Syndey" on the back cover because someone could have fixed it and everyone would be happy. Actually, we wouldn't have had that if someone didn't do a rush-job on the cover, but people make mistakes. It's an OK thing to do.

We wouldn't run into issues like when Cucumber decides it wants to divorce `web_steps.rb` and it *breaks the whole
book*. You know why? *Because we could update the damn thing*. We could release a new update *every week* if we
needed to and people would be happy that it's a constantly improving, amazing book.

But instead, we print to dead trees, disabling us from updating it efficiently and easily and it stagnates within
6 months.

Now that we *finally* (just this week) have the ePub and mobi formats available for the book. I suspected they
had to use the afore-mentioned C+V keys to do these too. Updating these is easy in comparison: alter the source, compile a new version, put it on a server and let people know. Done.

And hey, it would be super easy if the source was DocBook and there was a tool to read that XML and convert it
into ePub friendly HTML. But there's not one in this process.

That's how tech publishing should be: electronic only. If you want a dead-tree copy, well, I'm sorry, but you're going to have to print it yourself.

### There will be more

Yeah, we probably did fail at creating The Best Book Ever. But that was never the goal. The goal was to create a
book that was easy for noobs to read and learn Rails (and to be the best at *that*).

I think we succeeded, but I also have a ginormous ego.

Yes, there are mistakes but we will fix them. I will do everything in my power to address any and all (reasonable) concerns you have with the book. I want it to be perfect for you.

There will be updates. Even though Manning's tools are not that great, the people who work there are some of my
favourite people in the world. I will work with these wonderful people and we will release a wonderful Version
Two.

Promise.

