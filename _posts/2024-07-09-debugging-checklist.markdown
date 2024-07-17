---
wordpress_id: RB-1720501808
layout: post
title: Debugging Checklist
---

Above my screen, I have simple reminder: "IT IS ALWAYS TIMEZONES." It used to be a simple black-and-white sign until my daughter decided it needed to be turned into a brilliant rainbow of a warning.

The sign was put up after experiencing not one _but two_ timezone-related bugs within a relatively close proximity. Periodically, I'll see something similar crop up like a test failing before 10am, but not after, thanks to the differences between what day of the week it is in UTC vs my local computer (in +1000 or +1100, depending on the day).

In a work discussion yesterday we talked about debugging checklists and I wrote up one with what I could think of. I'm sharing it here as it might be useful to others. Maybe there'll be more signs that come out of it.

**First: have you eaten or drunk anything recently? Do you need to take a break?**

**Then:**

1. Are you in the right app?
2. Right file?
3. Right function?
4. Is the function spelled correctly?
5. If you're running locally:
   1. Is the server up?
   2. Is the server running on the port you expect?
6. Is there information in the logs?
   1. Can you add more logs to provide more useful information? (Usually, yes.)
   2. Can you reduce other logging to focus on just what you need?
7. Are you sure you’re in the right environment (local / staging, etc) for this?
8. Can you inspect this function to determine if it is what you expect?
   1. Is the input what you expect?
   2. Is the output what you expect?
   3. Are there intermediary steps where the input is transformed into a new form?
9.  Is it a string issue?
    1.  Does casing matter in this situation?
    2.  Are you comparing this string to another? Inspect both to see any differences.
    3.  Does pluralization or non-pluralization of the string matter?
    4.  Are there extra characters blank spaces?
    5.  Null-byte prefix? (check with #codepoints)
10. If the behaviour is new:
    1. Do you see this behaviour on the main branch, or just your own?
    2. If you see it on the main branch, can you use `git bisect` to find out when this issue was introduced?
    3. Were there packages updated recently that may have introduced this bug?
11. Is an exception happening, and then being rescued too quickly by something like `rescue` or `rescue StandardError`?
    1.  Can you narrow down the exception class to something more specific?
12. If it is a time bug:
    1. Is it a different day in UTC compared to your local time?
    2. Do you need to freeze time for this test?
    3. Are you certain the time zone your code is running in is the right time zone?
13. If it’s an integer / float bug:
    1. Are there numbers being rounded?
    2. Can you push the rounding “down” the stack, so it is one of the final operations to simplify?
14. If it’s a browser issue:
    1. Can you reproduce this issue in a different browser?
    2. Are you trying to use a browser API that is not currently supported in this browser?
    3. Are there any errors displayed in the console?
    4. Were there any network requests that failed, or contain errors?
15. If this code depends on environment variables:
    1. Is the environment variable spelled correctly?
    2. Is the value of that variable what you expect?
16. If this code depends on a configuration file:
    1. Is the configuration file in the right place?
    2. Is the configuration key set up where you expect it?
    3. Does that key have the right value?
