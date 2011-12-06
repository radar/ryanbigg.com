---
wordpress_id: RB-319
layout: post
title: Deciding what tests to write
---

More people who are new to Ruby are getting into TDD and BDD thanks to the wonderful tools like RSpec and
Cucumber that make it easy for them to do so. There's no real public information on exactly *what* you should be testing, though.

### Testing Validations

RSpec supports the shoulda-matchers gem and I see a lot of people using this to test validations on their models,
and this is the *first* test that they're writing. I personally think that this is the wrong way of doing things.

The first test should be one that follows the exact steps that the user would need to do in order to approve this
functionality.

In the example test (written in Capybara's syntax) below, the user fills in the form (ignoring one of the required fields) and then should see that there's an error on the page.

    visit root_path
    click_link "Posts"
    click_link "New Post"

    fill_in "Title", :with => "Deciding what tests to write"
    click_button "Create Post"

    within("#flash_alert") do
      page.should have_content("Post could not be created.")
    end

    within("#post_form .errors") do
      page.should have_content("Body cannot be blank")
    end

Or if you prefer Cucumber:

    Given a user is creating a new post
    And the user leaves the post text blank
    When the user clicks "Create Post"
    Then they should see a validation error:
      """
        Body cannot be blank
      """

You can imagine the steps that Cucumber would use, they'd use the Capybara methods just like the original example.

The point is, this test is testing the user's interaction with the page, which I think is the most *critical* part
of the application. If the user cannot see this error message, why does it matter if the model validates the
presence of this field? *It doesn't.*

Testing that the model contains the validation is a secondary thing, and is generally something I skip doing. The
test for at least one of the form's validations goes into the request spec. If I'm feeling pedantic I'll write
another for the other validations, but I can *assume* that dynamic_form (the thing that provides
`error_messages_for` is doing the right thing when it comes to its own methods. If one error message is showing
up, good chance the others are.

In the case where validation error messages *don't* show up then I write a specific test for that inside the
request spec before going on to fix it wherever I need to.

### Testing Complex Logic

In <a href='http://spreecommerce.com'>Spree</a>, there's complex logic involved around orders and tracking
inventory. This is something I *could* test with a request spec, but how the system works is made up of so many
little parts it makes it slow to test the whole thing:

* A product exists in the system, has a "count on hand" of 1.
* A user wants to buy this product, so clicks "Add to cart"
* A new order is created in the system, with this item
* User is prompted to sign in
* User is prompted for billing + shipping details.
* User is prompted for credit card details
* User clicks "Confirm" on order page
* Order goes through, deducting 1 from "count on hand" total, bringing it to 0.

A huge portion of these steps aren't even required to test the count on hand decreasing. What we care about is
that when an order is placed in the system that the count on hand decreases by one. And so this is where a unit
test would be better.

This unit test would check that when an order is created, a method such as `unstock_items!` is called. There would then be another unit test for the actual function of the `unstock_items!`
call, ensuring that it goes through the line items for the order and depletes the stock on the products as necessary.

The unit test is going to be much lighter (and quicker to run!) than the request spec, which is just a massive win.

### Conclusion

At the final retrospective at the CodeRetreat event on Saturday in Sydney, it was brought up that there's no "right" way to test. Some people thought that testing from the "bottom-up" (unit test first, request specs or similar later) was better, but then they saw the merits of testing "top-down" (request specs or similar first, then unit tests for the fiddly bits) as well.

I think liberal applications of both of these methodologies is *one* "right" way to test. The more I test, the more I find myself getting better at knowing what to test and how to test it. I
can see the merits of both ways. I'm preferring top-down though, as that's, in my opinion, testing what the client is going to be seeing, and that's what matters most. If there's a bit of
gnarly code in there, like the order inventory tracking, then that's when I'd dive down into unit testing.

What are your thoughts on this?
