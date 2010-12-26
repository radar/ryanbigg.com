--- 
wordpress_id: 47
layout: post
title: Traveling Salesman
wordpress_url: http://frozenplague.net/?p=47
---
At work we have been discussing the Traveling Salesman Problem. This is classified as "NP-Hard", according to the Wikipedia article for it, and there's a few good reasons why. First of all, I'll explain what it is.

We have a traveling salesman, let's call him Bob. Bob starts in Adelaide and can go to one of many destinations around the world, and for each destination there are many routes. Say Bob has 10 destinations to choose from (he's a very exclusive salesman) now each of these 10 destinations link to the other 9 destinations, creating 90 links in total. Bob starts at destination #1 (Adelaide) and can travel to any of the other 9 points. The problem with this is: we cannot read Bob's mind. We don't know if Bob wants to go from Adelaide to Perth (and in some cases he will need to go to Sydney first... I'll explain later), Adelaide to Los Angeles, Adelaide to New York, you get the idea.

Now expand the number of points to around 100. That's 100 x 99 routes, or 9,900 routes. That may not seem a lot but you see that the problem is getting exponentially out of hand.

Now imagine that Bob is not a person, but a packet in your computer. Bob can go to many different websites, like Google, Youtube or this site. Bob must pass through many routers (points) before he reaches his final point. To do this, Bob first goes to the home router, the home router connects one of the Internet Service Provider's routers. This pattern continues until the link is established to the final point.

We know what the start destination is, and we know what the end destination is and we pass that information on to the router. The router then looks in it's routing table and finds one of the many routes that lead to that final point, and pass it on to the next router. Each router knows of it's neighbours and nothing more.

Point 1 knows that it can get to point 3 through 2, 2 knows that it can get to 4 through 3, and 3 knows that it can get directly to 4. It's a beautiful part-solution to the Traveling Salesman Problem.

* About the Adelaide to Perth through Sydney. For those of you who don't live in Australia I'll first explain that Adelaide is in the bottom-middle of Australia, Perth is on the West coast and Sydney on the East coast. Sometimes when flying to Perth you need to catch a flight to Sydney and then to Perth, which is incredibly stupid. What happened to direct flights?
