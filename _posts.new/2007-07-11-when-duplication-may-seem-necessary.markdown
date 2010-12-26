--- 
wordpress_id: 46
layout: post
title: When Duplication May Seem Necessary
wordpress_url: http://frozenplague.net/?p=46
---
At work we're making a management system for Ferries, Accommodation, Rental Cars, Coach Tours and some other things. I've been assigned to work on the bookings section, which has proven to be quite difficult.

We have a table called Services, which keeps track of bookable items for the various items. The bookings table is linked to passengers and vehicles via has_many associations, and whenever we create a new booking we need to assign brand new passengers every time, so say if I travelled to Kangaroo Island every week, they would enter my name 52 times in a year. I know, not everyone travels 52 times a year, but over time this builds up.

 Eventually the passengers table is going to have duplications where it seems that it is necessary because there is no way to uniquely identify one "John Smith" from another "John Smith" other than extra redundant data like an address field. Then what if there's two John Smiths (Father & Son) living at the same address, how do we know which one is which? This is why we need duplication in our table, we simply have no convenient way of being able to choose which passenger is which. The system will eventually also need a way to keep track of "frequent flyers", people who travel frequently, and I don't know how they're going to implement that.

It didn't feel right. It still doesn't feel right. There's an easier way, unfortunately I don't know of it. Maybe some of my readers might know.


------------------

I've also booked out *another* weekend. If anyone's planning on inviting me out to anything (hahaha, I should become a comedian), don't. 

Friday night I'm apparently going "out" (read: across to the boardroom) to have drinks with Marketing.

Saturday Morning I am moving to my Mum's house. It'll be unusual to see this room semi-empty.

Saturday Afternoon-Night I'm going out to 24-hour motorbike thing where it's a huge 250km cross-country course motorbikes ride aorund and every six hours they pass nearby. It's interesting to  see how much they know about their bike when they're in the pits. They know that if it's making a certain noise that a spoke may be loose. The only shame is that you sleep in six hour blocks. Last time I slept on a "slight" slope, and kept sliding to the other end of my tent. This time I hope to find flat ground.

Sunday afternoon, my time to relax.

Every weekend I go "I have nothing planned for next weekend" and usually by Wednesday it's all booked out. Eventually I'll find one.

