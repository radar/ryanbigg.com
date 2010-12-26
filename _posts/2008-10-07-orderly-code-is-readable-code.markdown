--- 
wordpress_id: 298
layout: post
title: Orderly Code is Readable Code
wordpress_url: http://frozenplague.net/?p=298
---
We were talking in #offrails today about coding standards and a few points came up on how to lay out "good" rails code. They were:
<ul>
	<li>Controllers laid out in this order: index, show, new, create, edit, update, destroy, custom actions</li>
	<li>Models laid out in this order:  Associations, Validations, Callbacks, Class Methods, Instance Methods</li>
</ul>
<div>For controllers I would put filters first, then the 7 restful actions (index, show, new, create, edit, update and destroy) and then the custom actions and then if I needed to find a parent resource (for example /forums/1/topics) I would call private and then put a find_forum method there.</div>
