--- 
wordpress_id: RB-347
layout: post
title: Spree Tax Engine
---

In more recent versions of Spree, we've been doing a [lot of work around adjustments](http://ryanbigg.com/2013/09/order-adjustments/) and part of this work has been making the application of tax adjustments more consistent. Previously, we had three different scenarios where in two of those scenarios adjustments would be applied to the line items. In the third scenario, one big mega adjustment would be applied to the order as a whole.

That part is now fixed in Spree 2.2 and beyond. Thankfully.

What's difficult is that we have all these stores that need to configure their own tax rates and whatnot, even though the tax rates for two stores in the same country are going to be (or at least *should* be) identical! This leads to a lot of confusion regarding store configuration. What tax categories do I need for my store? What tax rates? What zones do I configure?

I've been doing some work around this recently with taxes in Australia, Canada, the US, England, Spain and Finland. All six of those countries have different methods of applying tax. 

For Australia we have a "boolean" GST tax. 10% included GST across everything unless it's [something that's exempt](http://www.ato.gov.au/General/Aboriginal-and-Torres-Strait-Islander-people/In-detail/GST---Helping-you-understand-your-GST-obligations/?page=3). An item that's worth $100 has $9.09 GST, with a base price of $90.91. This is *by far* the simplest tax system that I have encountered. GST is great. For the lawyers out there, [this is the document you want to peruse](http://www.comlaw.gov.au/Details/C2013C00117).

A little interesting tidbit/sidebar: Australia has not one but *two* Income Tax Acts. It has the [Income Tax Assessment Act of 1936](http://www.austlii.edu.au/au/legis/cth/consol_act/itaa1936240/) and the [Income Tax Assessment Act of 1997](http://www.comlaw.gov.au/Details/C2013C00082). Both are beastly. The 1997 one was an attempt at rewriting the 1936 and that attempt failed spectactularly, and so now we have two. Luckily we're computing sales tax and not income tax!

In England and EU countries, there is a similar tax levied called the VAT. VAT rates vary from country to country. For example: England has a standard VAT rate of 20%, and a reduced VAT rate of 5%, while France also has a standard VAT at 20%, but several reduced rates at 10%, 5.5% and 2.1% respectively. Germany, on the other hand, has a standard rate of 19%, and a single reduced VAT rate at 7%.


