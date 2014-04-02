--- 
wordpress_id: RB-347
layout: post
title: Community Management
---

I've been the "Community Manager" for Spree for a couple of years now. It's a
job where I answer user support requests wherever they happen: IM, email, IRC,
Stack Overflow. I've been splitting this up with some development on Spree,
building features like the new adjustments system whilst getting some great
feedback about them from the community.

Over time, it's been getting busier and busier and I've ended up doing more
"community management" and less programming and it's been burning me out. When
I'm programming, I know that I'm working towards a goal. When I'm answering
emails, there's always more emails to answer the next day. It just doesn't
feel like progress is happening at all.

We've just passed our busiest time of the year. People have found Spree and
want to either start using it, or port over from their existing ecommerce
platform. These people generally start asking questions at the end of January
and it quietens down around about now, picking up slightly in June (I don't
know why, it just does) and the later months of the year due to Black Friday /
Christmas / people wanting things done "Right Now Or Else" by the end of the
year.

During this extremely busy phase, I've really dialed back on the programming
part of my job and I've been dedicating most of my time to answering user
support requests, mainly in the form of trying to keep my email inbox at an
amount as close to zero as possible. The community benefits from this work
because those people asking the questions get the support they need and they
can continue on doing their own things. That's a great thing. When people are
using something that I helped build *and they like using it*; that is one of
the best feelings in the world. It's part of the reason why I've stayed here
in this job longer than any other job I've had. It's also a pretty awesome
team to work with.

After SpreeConf (26-27th Feb), I did an email inbox cull and still had 500+
emails to read through and reply to. This is part of my job, and it seemed
overwhelming. I was occassionally grumpy and short with my words. It's only
last week -- *a whole month later* -- that I was able to get this inbox number
down to less than 50. As I write this now, it sits at almost 200.

But there's a legitimate reason for that. For the past two days I've been
doing exclusively programming work. I closed Airmail and worked for two days
in Sublime Text, iTerm and Chrome. It felt *glorious*. It felt like *progress*.

Last Friday at approximately 4:40pm my time and ridiculous o' clock (1:40am) in DC,
Sean passed on a message from one of our clients who said something to the
effect that Magento's order interface in the admin backend was better than
Spree's order interface. Now, there's not many things Magento is better at
than Spree, but this is (supposedly) one of them. I agreed whole-heartedly with the
message, but it was 4:40pm on a Friday and I was thinking/dreaming of the
weekend.

I've personally been wanting to change the admin backend for quite a while. It
doesn't adjust itself depending on the order's checkout steps, which is a
feature that we implemented about 6 major Spree releases. It just hasn't been
that important to work on as other things have been.

This little comment ate at me all weekend. How could we be *worse* than
Magento at something? Was that even possible? Yes, it was. The order interface
reloaded the entire page after every single change and it was infuriating. It
felt sluggish. Creating an order in Spree's admin backend shouldn't be
tedious, it should be *fast*.

<a href='http://ryanbigg.com/videos/old_admin.mov'>Here's a video of the admin order interface</a>

So on Monday I worked on improving this. I rewrote templates from ERB to
Underscore templates. I converted some JavaScript code that was defining top-
level functions into some CoffeeScript+Backbone code that defined those
functions as proper events within Backbone views.

I made it fast. <a href='http://ryanbigg.com/videos/new_admin.mov'>Here's a video of the new admin order interface</a>

This felt like progress, because it is progress. I'm improving something
within Spree rather than answering emails, and I feel really good about it.

So what I'm going to be doing now is devoting at least a day a week to purely
coding on Spree. All the emails can wait an extra day. Hopefully those emails
will be answered by someone else.

You can see the code for these recent changes over on <a href='https://github.com/radar/spree/tree/new-order-interface'>my new-order-interface branch</a>.