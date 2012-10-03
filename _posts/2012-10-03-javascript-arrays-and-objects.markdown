--- 
wordpress_id: RB-334
layout: post
title: JavaScript Arrays and Objects
---

[These three little lovely lines](https://github.com/spree/spree/blob/bf0b85472e477f20f84d030c575382b9c0922903/core/app/views/spree/admin/return_authorizations/_form.html.erb#L54-56) of very-much obtrusive JavaScript caused a little bit of frustration this afternoon.

What was happening was that in Google Chrome, the page was giving an "aw snap!" error. So I went to Firefox, where the page didn't "aw snap", but instead hung for a moment then asked if I wanted to stop the script.

What could that JavaScript be doing? Well, it's not that hard to understand *now*, but it didn't click the first couple of times I read it.

The script initializes a new JavaScript array, like this:

    var variant_prices = new Array();

Fairly innocuous. We would've also accepted `var variant_prices = [];`.

Next, it uses some ERB to go through all the inventory units for an order and then assigns each variant to the array, using the variant's id *as an index in the array*. If a variant has an `id` of say, 1, this is not a problem. Why? Because JavaScript is smart enough to know that it should create a two element with `variant_prices[0]` being undefined, and `variant_prices[1]` being whatever value is assigned.

*However*, if the variant's `id` is something a little higher, like 1,013,589,413, then you start to run into problems. In that case, JavaScript would create a **one billion, thirteen million, five hundred and eighty-nine thousand, four hundred and fourteen element** array. All to store *one* value in, right at the end.

Obviously, this is not very efficient and would lead to some performance degredations. Smart browsers would detect this early on and show a vague warning screen and dumber browsers would ask politely if you'd like to stop the script. Which script? Well, they won't tell you that. You have to play guessing games, like most of the time with the beautiful language that is JavaScript.

---

The *now obvious* solution to this problem is to *not* use a JavaScript Array for creating what is obviously a key-value store. Instead, the variable should be initialised like this:

    var variant_prices = {};

Then you would be assigning keys to the JS object, rather than values at specific indexes in an Array which could have a billion elements.


