--- 
wordpress_id: RB-347
layout: post
title: Ecommerce is hard
---

In this post I hope to cover some of the complexities found in building <a href='https://spreecommerce.com'>Spree Commerce</a>, an extremely flexible ecommerce engine. There will be a bit of technical talk and lots of fun. 

----

When you first think about ecommerce, you consider the typical flow of basically every single ecommerce site out there. You find the product you want. You add it to your cart. You go through the cart process, and at some point you probably complete your purchase. 

## Product viewing

If you bought a physical product, it will probably be shipped to you through one of several means. 

<aside>
  I personally find it pretty amazing that even though I live in the remotest country on Earth, I can still go shop on an American store and then have that product drop shipped from a factory at any point on the earth to a location of my choosing. 

  I once ordered a new iPhone from a couch in Germany to my house in Australia. That's when I knew this ecommerce thing was really going to take off.
</aside>

If it's a digital product, then you'll be able to download it there and then. You might even be subscribed to access this digital product on a monthly or yearly basis. 

If you didn't complete your process, then that's ok too.

Quite a lot of people spend a lot of their time making this process as easy as possible. I know this first hand with all my work on <a href='http://spreecommerce.com'>Spree Commerce</a>. What people see when they use a default Spree store is a very simple interface:

<div align='center'>
  <img src='/images/ecommerce-is-hard/spree_home.png'>
</div>

Front and center are all the things you can buy on this default store. On the left, there's a list of product categories. Up the top, a search box and a way to login to the store. These are the very basic elements to any store.

This is a really, really basic run down of what's happening on this store. Products in Spree can have an availability date which hides them from the general public until that date. So that means that the home page is not going to be displaying *all* products *all the time*, but needs to limit it to at least this. This part isn't so hard. It's just a limiting query on the results returned from the database.

Then you've got the search box at the top which can limit these products to a different collection based on arbitrary things: names, colours, sizes, whatever. Implementing decent searching on an ecommerce site is *super hard* and there's companies that spend a huge amount of time and money trying to get this right. Spree's built-in search is definitely not perfect, but it's a start. 

Honestly, you're better off implementing something like <a href='http://www.elasticsearch.org/'>elasticsearch</a>. Different stores are going to want different ways of querying for results, so it's pretty hard for Spree to offer a solid solution to make everyone happy in this department.

----

When you want to find out more about a product, you click (or tap!) on a product:

<div align='center'>
  <img src='/images/ecommerce-is-hard/product_show.png'>
</div>

It's on this page that you can see more images for the product. This is where the store is going to sell the product to you. *This is the exact Ruby on Rails Baseball Jersey you have been looking for*.

## All the product parts

Let's stop here and consider all the different things that have had to come together at this point to make the process work. On the homepage, there was a list of products. Therefore we can safely assume that there's at least a `Product` model involved, and that's correct. There's also some way of categorizing products, and in Spree we call that a `Taxon`, although you might like to call it a `Category`.

When we click to go through to a specific product's page, we can see even more information about that product. We can see a huge image on the left, with even more images underneath. Therefore a `Product` has many `Image` objects. 

Underneath the images, there's "Properties" which list the different attributes of this particular item. While it *looks* like a key-value pair, it's actually three different models coming together: `Property`, `ProductProperty` and `Product`. `Property` stores the name of a property so that it can be shared across many different products. `ProductProperty` is where the value of that property is stored for a particular `Product`. 

To the right of the images, there's "Variants" which list the different variations of this product. In this case, there's different sizes and different colours. In Spree, we refer to things like "Size" as an `OptionType`, and the values for these `OptionTypes` as `OptionValues`. A unique combination of a `Product`, `OptionType` and `OptionValue` can result in a new `Variant`. While there can only one be value of a `Property` for a `Product`, there can be multiple `OptionValues` for the same `OptionType` for the variants.

Underneath the variant list is a prompt that invites us to "Look for similar items". This is that `Taxon` model coming into play again. This prompt is displaying the taxons that this item is a part of. 

<aside>
  Short tangent: If you click on "T-Shirts", it will show you all the other T-Shirts from the store. Spree allows you to sort the products within a taxon so that you can show some items more prominently than others. Remember earlier when I talked about the complexities of searching? Yeah, well that sorting of products is also going to play into that complexity. That's when you get into the deep mystical arts of weighting products based on special criteria like popularity or stock levels. 
</aside>

On the far-right of the page is the most important element: the 'Add to Cart' button which begins the checkout process. 

----

## Checkout

Just like JavaScript frameworks, everyone has an opinion about the best way to design an ecommerce checkout. My personal favourite checkout system of all time is Amazon's. Allow me to gush about Amazon's checkout and why it's beautiful for a moment. 

When I'm signed into Amazon, I can view any old product and see a screen that looks like this:

<div align='center'>
  <img src='/images/ecommerce-is-hard/amazon_r4ia.png'>
</div>

The elements on the page are similar to Spree or vice versa. Big product image on the left, more images underneath that, price to the right of that, checkout button over on the far right. The big thing about this page is that they're offering me a cheaper price than what <a href='http://manning.com/bigg2'>the publisher offers</a>; a full 30% off. You can be sure Amazon's going to get their cut for selling this item, then the publisher's going to get something and the author might get a buck or two at the end of the quarter if he's been a good boy.

Immediately after the item has been added to the cart it shows me this:

<div align='center'>
  <img src='/images/ecommerce-is-hard/amazon_cart.png'>
</div>

I can choose to either "Edit my cart" or "Proceed to checkout". Or I could do other things outside of the focus of this box. This box really influences me to do one or the other. It's really pushing me to complete the checkout and pay for it, and so I click "Proceed to checkout" that which lands me on the screen:

<div align='center'>
  <img src='/images/ecommerce-is-hard/amazon_checkout.png'>
</div>

This is not the first time I've checked out with Amazon and so Amazon has remembered my shipping and billing addresses and my all-important payment information. Amazon has this *down*. All the information that is relevant to this order is displayed on one single page and I can very easily check it over. There is very little on this page distracting me from actually completing the checkout, which is just perfect. I can add a coupon code, apply for their credit card (which pops up in a new window), or place my order.

Amazon's design is just excellent.

Now, to Spree. Spree has the following checkout process:

1. Cart
1. Registration (maybe)
1. Address
1. Delivery
1. Payment
1. Confirm (maybe)

This fits a lot of cases and appeases a lot of our userbase.

