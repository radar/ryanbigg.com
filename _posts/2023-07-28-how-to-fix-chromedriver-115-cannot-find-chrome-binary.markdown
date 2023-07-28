---
wordpress_id: RB-1690503663
layout: post
title: "How to fix: Chromedriver 115, cannot find chrome binary"
---

Chromedriver v115 was released recently and causes this issue to appear on Macs that use Chromedriver for automated testing.

```
unknown error: cannot find Chrome binary

Traceback (most recent call last):
       16: from 15  chromedriver                        0x0000000100df056c chromedriver + 4179308
       15: from 14  chromedriver                        0x0000000100df0414 chromedriver + 4178964
       14: from 13  chromedriver                        0x0000000100dacd1c chromedriver + 3902748
```

This is due to Chromedriver looking for a new binary called "Chrome for Testing", which was [recently released from the Chrome team](https://developer.chrome.com/blog/chrome-for-testing/).

To fix this bug, you need to [download Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/#stable), unzip it and move it into your `/Applications` directory.

Mac's Gatekeeper program will not let you open this executable by default, as it came from a `.zip` file. To work around that problem, run:

```
sudo xattr -cr '/Applications/Google Chrome for Testing.app'
```

This will remove the security restriction that is blocking this application from opening.

Run your test suite again, and it will now work.