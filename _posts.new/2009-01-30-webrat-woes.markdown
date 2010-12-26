--- 
wordpress_id: 427
layout: post
title: Webrat Woes
wordpress_url: http://frozenplague.net/?p=427
---
Yesterday I wrote a feature for one of the apps at work that was fairly simple it contained this line:

<pre>
  clicks_link("I am done")
</pre>

The page contained a link with the text exactly as "I am done" and in all dimensions of this universe you would expect this to pass without fault. It didn't. 

So when this feature failed I brought Bo over and got him to look at it. We couldn't figure it out yesterday and it took a few hours this morning to figure out what it was. The site was fairly basic, consisting of a layout that contained:

<pre lang='html'>
<%= link_to "Things", thing_path %>
<%= yield %>
</pre>

And the page itself consisted of a form and ended in the link:

<pre lang='html'>
<%= link_to "I am done", do_something_path %>
</pre>

But the bloody feature failed! So we sanity check'd it, output the response's body and definitely saw the a tag in there. It was there! So we further checked it and tried the URL from the layout and that worked! Major WTF moment there. It took us an hour or so of further WTF before Bo said "Humour me" and gave the layout valid HTML, you know, something like this:

<pre lang='html'>
&lt;!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd"&gt;

&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta http-equiv="Content-Type" content="text/html; charset=utf-8"&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;%= link_to "Things", things_path %&gt;
  &lt;%= yield %&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>

And the feature passed! So remember kids, do not be lazy! If you're testing with webrat remember to always have a valid HTML layout on your site!
