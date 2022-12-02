---
wordpress_id: RB-1669940406
layout: post
title: "CSS :has selector for selects that have options"
---

Based on a question on the Ruby AU Slack, someone wanted to know how they could make a 2nd select box appear after an option in an original select box was selected.

I worked out today that thanks to the new `:has` selector in CSS, you can achieve this:

<div class="mb-4">
<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="bGKmaRz" data-user="ryanbigg" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/ryanbigg/pen/bGKmaRz">
  Untitled</a> by Ryan Bigg (<a href="https://codepen.io/ryanbigg">@ryanbigg</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
</div>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

**This demo will work in most modern browsers, with the exception of Internet Explorer 11 and Firefox.** Selecting from the 1st select box will make the 2nd one appear, then selecting from that makes the 3rd box appear.

Given that this feature is _currently_ not supported in either IE11 (at all) or Firefox (without enabling a configuration flag), I would be hesitant to use it in production.

Nevertheless, it's pretty cool to see that CSS can do this and we do not have to reach for JavaScript.
