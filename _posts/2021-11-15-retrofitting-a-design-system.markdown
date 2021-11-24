---
wordpress_id: RB-1636973010
layout: post
title: "Using View Components to clean up your views"
published: false
---

Earlier this year, I wrote a [post on how to use View Components to provide a link between Rails views and React components](https://ryanbigg.com/2021/04/view-components-the-missing-link). Since then, I've had a few opportunities to use view components and I'm enjoying the separation between distinct components and the views they're used in. I want to share a little example of a view component with you today.

```erb
<%= zeal_button "Click me" %>
```
