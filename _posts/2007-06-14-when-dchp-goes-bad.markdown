--- 
wordpress_id: 36
layout: post
title: When DCHP goes bad!
wordpress_url: http://frozenplague.net/?p=36
---
I couldn't find anything similar to this on Google, maybe I just wasn't googling the right things.

So at work they installed some new computers recently which both have one network interface each and both are set to dhcp and both are running Ubuntu 7.04.

At work they have two connections to the outside world, one is a Telstra link (192.168.0.9 -> 192.168.0.82 -> Internet), and the other is an Internode connection (192.168.0.254). 

The first two addresses in both sets of brackets are gateways. 192.168.0.9 is the DHCP server for the whole 192.168.0.* network, as well as the first gateway. 192.168.0.254 is a router which connects to Internode. 192.168.0.82 is another router, which the DHCP server (192.168.0.9) uses as it's default gateway. This means that every computer that 192.168.0.9 assigns an IP address to, it will set it's default gateway to 192.168.0.9 which forwards to 192.168.0.82, which is the wrong connection! Confused yet?

Shortly after realising this we noticed that if we did:
[term]
route del default gw 192.168.0.9
route add default gw 192.168.0.254
[/term]

...it would set the default gateway to 192.168.0.254, the correct one! We figured that if we rebooted it would remember this setting. We were wrong. Upon rebooting it reverts back to 192.168.0.9 and we were back at square one.

Anuj suggested that we make an init.d script and Adam suggested using update-rc.d to get it to run on startup. So that's what we did. (Ours was originally named "route_del", I thought I'd give it a better name here.

[code='/etc/init.d/fix_routes']
#!/bin/bash
route del default gw 192.168.0.9
route add default gw 192.168.0.254
[/code]

And then entered the command:

[code]
sudo update-rc.d fix_routes defaults
[/code]

And rebooted. Upon rebooting the computer the default route was set at 192.168.0.254 and we weren't connected to crappy Telstra any more!

Edit:
Adam, the guy who basically runs [url=http://offbeat-zero.net/pulse]WSI[/url], has informed me that if I add the lines:
[code]
up route del gw 192.168.0.82
up route add gw 192.168.0.254
down route del gw 192.168.0.254
down route add gw 192.168.0.82
[/code]
to /etc/network/interfaces just under the definition of my network interface (eth0) it will do the same thing and is much less of a hack than our solution.


