--- 
wordpress_id: 76
layout: post
title: How to Work Out if a Date is a Leap Year in Ruby
wordpress_url: http://frozenplague.net/?p=76
---
Angus asked me today to code him a method in Ruby to work out if a date is a leap year. He gave his example:

[code="Angus's Example"]
if not (year % 4) and ((year % 100) or not ((year % 100) or (year % 400)))
[/code]

*tut tuts Angus, use ! instead of not, && instead of and, and || instead of or!*

Ruby has this built in method called [term]leap?[/term] and its source looks like this:

[code="Ruby's Source"]
def leap?
self.class.jd_to_civil(self.class.civil_to_jd(year, 3, 1, ns?) - 1,
ns?)[-1] == 29
end
[/code]

Now I'm sure there's a reason they're doing all that, but I have a shorter way:

[code="My Code"]
class Date
def leap?
yday != 60
end
end
[/code]

[term]yday[/term] returns 60 on all years that are not leap years, so why not just check that value?
