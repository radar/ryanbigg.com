--- 
wordpress_id: RB-302
layout: post
title: Railscamp NZ
---

This weekend I was on the north island of New Zealand, counting sheep and attending the first Railscamp NZ. I've attended every Railscamp in AU since #2 and I've really enjoyed them and this one was no exception to that. Railscamps are just great all the time.

I'd like to first of all thank the people who attend the camp who make it a *Railscamp*, and most importantly the camp organisers Breccan McLeod-Lundy and Nahum Wild for their work on organising it, despite their workloads and/or natural disasters.

The camp site seems capable of fitting more people in than what we had the camp and I think due to our (hopefully) good standing with the people who ran the camp we should definitely continue to have the camp at this venue, if the organisers choose to run another camp.

This camp, I helped set up the server and network stuff on Friday night and then spent parts of the weekend investigating more of the behind-the-scenes workings of Git, learning how to use an SSH account to authorize pushes and pulls just like GitHub does, as well as post-receive hook logging of events such as branch creation and commit logging. I figured that it's far enough away from what I'd usually be doing which is straight Rails and I really like working out how other people have set that kind of thing up. It's just a great way to learn. If people want to take this and use it as a base for a fake GitHub next Railscamp, I wouldn't be adverse to that idea at all.

I also did some work with Phil Arndt of RefineryCMS (not to be confused with RadiantCMS) fame on making <a href='http://github.com/radar/forem'>forem</a> a Refinery plugin. It'll be cool to see where else this goes.

Finally, I wrote another section of the basic performance enhancements chapter over Saturday and Sunday night when I got time, as well as working with Breccan on patching the Rails scaffold controller to use a controller-level `respond_to` rather than a per-action `respond_to`. It'll be interesting to see if that patch gets accepted into Rails or not. I think generating it with the `respond_to` at all is excessive and a scaffold should generate the most basic thing required to get going. XML doesn't fall into that bracket.
 
Here's a mind dump of other observations about the camp, in no particular sensible order because I'm much too tired to do any serious editorial work.

### Transport

Transport to and from the venue was exceptionally easy. Tim McEwan, Gareth Stokes, Ivan Vanderbyl and I met Phil Arndt and David Jones from Christchurch in Wellington Airport then we got a shuttle directly to the train station which all up cost $40NZ. At Wellington's train station there's a grocery store where we picked up supplies (read: beer and cider) for the camp. Initially stunned by the prices of a 4 pack of cider, I did the conversion to AUD and found out it was actually cheaper. Phew.

The camp organisers had organised a coach to take us to the camp grounds and I'd say that most of the people who attended the camp opted for this option. The trip to the campsite (Kaitoke) was about an hour from the city (due to peak hour traffic) and I spent a lot of it talking to a guy called Arthur Gunn about various things.

A coach from a central transport hub is a brilliant idea. Previously, other camps have used cars to shuttle people around and I think that's just as fine as well, but this camp we needed a coach due to the sheer number of out-of-country-ers.

### The Hall

The derth of powerpoints could have lead to some issues. Perhaps future Railscamps could consider a venue that offers 3-phase power if they wish to have a higher capacity, as I think that we'd be flipping some fuses trying to run more computers than we had off that many powerpoints.

It was nice and toasty inside the hall at night, thanks to the bodies who occupied it as well as the computers which were cranked.

It wasn't as serious a problem as I thought it may have been, but there were only two bins in the main hall (as far as I could see). This has become a problem with other Railscamps where the limited number of bins coupled with the general laziness of the attendees have caused them to overflow. We can increase the number of bins to fix this problem... but a better fix would be that if you see a full bin you take it out.

This camp we had two coffee machines which were, and I quote Tim McEwan, "so appropriate". People were able to brew their coffee in the morning to recouperate from the excessive hangovers generated from the night before. The hangovers were generated courtesy of some kegs provided by Henry Collinridge, as well as the beer / alcohol that the campers themselves bought.

### Network infrastructure

The server wasn't "railscamp ready" when it came to Railscamp, and ended up being one of the organiser's laptops. The same organiser attempted to set up the gem server on a tiny notebook but it didn't have enough RAM, and so had to use his beefier "man-sized" laptop.

I'd recommend that other camps have a dedicated server box with at least 8GB of RAM (the server at this camp had 376kb free, was swapping, but was scaling fine to 40 people). This way, you could run the gem server, Apache (or nginx, depending on your tastes) and a Rails app or two. This time we didn't really have the server serving any serious files like last time as users had figured that out already.

Still on the subject of servers, I have to say: omg dnsmasq is awesome. That provided the DNS for the network just fine and is very easy to configure. Thanks to Ben Hoskings for giving the *#protip* on that one.

Having an Ubuntu dep mirror so that people running Ubuntu can install things would be extremely helpful. If there was an equally easy way to get the deps for port / homebrew then it would be beneficial to have those too. The Ubuntu deps would be beneficial for the server as well, as you may miss a package when setting up the server.

Oh, and it'd be good to have all the sources for the different Ruby versions so that people can use RVM successfully at the camp. On the topic of Ruby stuff, thanks to Julian Doherty for providing the files for that. A small caveat was that we didn't get the source index file caching and so whenever somebody went to install a gem or bundle install it wasn't as instant as it should have been, but it wasn't really seriously a problem this camp. For bigger camps, it may be.

This is the second camp that I know of that ran the entire wireless network for the camp on an Airport Extreme. They're great pieces of hardware that can handle the load and damn easy to configure. We also had two Airport Express units that we used to extend the network out to another building. It'll be interesting to see if it can scale to the size of a large camp on the mainland.

### Accommodation

This camp had the accommodation away from the main hall, which is usually beneficial because people stay up until the wee hours coding, talking and generally making noise. This time however, a lot of people went to bed earlier than I thought they would and so the hall was pretty quiet. 

There's bunk rooms behind and in the same building (but away from the hall) with beds for 6 people, and again I think we could have doubled the amount of people attending the camp and not filled them. In each bunk room there's a toilet and a shower which (thankfully) were used by the attendees on a regular basis. 

### Food

The food at this camp was fantastic. I had (and these are just the meatitarian options I can remember) Chicken Stir fry for dinner on Friday, wraps for lunch on Saturday and Sunday, Spaghetti Bolognese for dinner Saturday and a fillet of fish in coconut sauce with mixed vegetables on the side for dinner on Sunday night. The organisers said they had paid a little bit extra to get better food for this camp and I think this is just a requirement now. If there's an option to get better food for a little bit more, do it. It's so worth it.

### Other areas

There was another building with a small room with room for about 40 people that was used for talks during the day and Werewolf at night. It was a shame that this room didn't have a projector like usual, but I think we did just fine with the TV that was in the room. Downstairs from the room was a gymnasium with a full-sized basketball court that (I think) nobody from the camp used.

Further down the hill away from the hall there was a small island which contained a firepit and we had a campfire on Sunday night. What would a Railscamp be without a fire?

### Talks

There were talks in the small room near the gym and they were well-organised up on a whiteboard at the front of the hall. These were on anything from Rails engines (me) to Vim, Coffeescript to how to be web scale. I prefer the talk format of Railscamp to that of a conference, as they're not mandatory attendance. If I wanted to stay in the hall and hack on something, I could. 

### Werewolf

Werewolf was a great success as it is most camps. It's just a great mainstay of the Railscamp "theme", with old friendships being broken and new ones being forged. Lachlan Hardy had it out for a guy called Paul, often citing "FUCK PAUL!" as the reason to nominate Paul as one of the werewolves. Another favourite nominees of the players was the camp organiser Breccan. All in all, it was good to see a lot of people come out and play this.

My secret to learning the names of people at the camp is being the narrator of Werewolf or playing it.

We played it into the wee hours on all nights, with myself being the narrator for most games. We played the Hunter, Cupid and Witch cards to great success. The Witch is bloody interesting, as they can choose to resurrect who the werewolves killed or alternatively, to kill another person. Cupid's less interesting, but the death-acting is Grade-A kind of stuff. I expect Leon to receive his Academy Award nomination any time soon.

The final game we placed an extra Seer card in the deck and then they acted as the <a href='http://www.brenbarn.net/werewolf/rules.html'>Fool</a>. One of the two seers is told possibly a wrong answer when they ask who the werewolves are. The narrator shouldn't lie to the Fool all the time, as if the Fool is told that somebody's a werewolf and then they're killed by the wolves, it's kinda obvious to the Fool that they are the Fool.

### Conclusion

There's quite a lot you can get out of a Railscamp. I met a lot of people who I didn't know or had only known through the intertubes, talked about RubyX, Rails 3 in Action and whatever else came up. It's absolutely worth going to. The next one in the Oceanic region is going to be near Byron Bay in northern New South Wales in Australia at a place called Lake Ainsworth. <a href='http://railscamp9.eventbrite.com/'>You should come along!</a>
