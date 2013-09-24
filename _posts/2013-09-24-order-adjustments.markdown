--- 
wordpress_id: RB-345
layout: post
title: Order adjustments within Spree
---

When buying anything these days, there are a lot of different offers:

* Order more than $100 and get 10% off your order.
* Buy a specific number of products and get free shipping for your entire order.
* Buy 1 product, get 1 of the same product free.
* 10% off t-shirts this week!

And many, many more. While it is easy for people's minds to understand,
modelling these promotion rules and actions within code so that the computer's
"mind" understands too, is somewhat difficult.

Alongside this are other potential order adjustments, both manual and
automatic. On the manual side of things, you may have a requirement to give
10% off to an order because the customer fit some kind of pre-defined
requirement for that to happen; a store credit or whatever. On the automatic
side of things, taxation rears its ugly head(s).

What follows is an in-depth description of how [Spree](http://spreecommerce.com) is organised to deal with these situations.

## The lay of the land

To help us along for this problem within Spree we have a couple of entities: 

* **Orders**: Track a collection of items that a user has added to their cart and is probably going to purchase.
* **Line Items**: A list of the items, attached to the order itself. Worth noting is that these records cache the price of the product at the moment they're added to the order, to protect against price fluctuation.
* **Shipments**: Groups of items that are being shipped, grouped typically by stock location but can also be grouped by availability. For example, a shirt you bought may be available to be shipped today, but the pants you bought also are on backorder and can't be shipped immediately.
* **Adjustments**: Used to track any adjustment to any of the above items. Adjustments have a source which is the entity which triggered this adjustment and a link to the thing being adjusted, called the "adjustable".

These four entities are the foundations of the adjustments system within Spree.

## Calculation of an order's total, without tax

Calculating an order's final total is made complex by the possible adjustments on each line item or shipment within an order, as well as possible adjustments on the order itself. To calculate an order's final total, we take each line item minus its discounts and plus its taxes, each of its shipments minus their discounts and plus their taxes, then minus the order's adjustments and then we have a final total.

A good demonstration of this would be an order such as this:

* Line Item #1: $50 shirt with an adjustment that decreases the price by $10.
* Line Item #2: $150 pants with no adjustment.
* Shipment #1: Containing just the shirt. Would normally be $5, but with a "Free shipping" adjustment applied, is actually $0.
* Shipment #2: Containing just the shirt. Shipping is $10 for this.
* Order adjustment of $20 off, due to gift card usage.

First, we sum the line items and their adjustments, which would be this equation:

    ($50 - $10) + $50 = $90

The order's total so far is $90. Now we add the shipments:

    ($5 - $5) + $10 = $10

We add this number to the line items' total and we get $100. Now we apply the order's adjustments to this subtotal amount:

    $100 - $20 = $80

This results in the order's grand total of $80.

The situation is slightly more complex when you bring in tax to the equation.

## Calculation of an order's total, with tax

Now let's assume the same situation, but now we have tax adjustments to apply to the different parts of the order too. Let's say in this instance that the line items and the shipment also have a 10% tax charge.

With the same scenario as before:

* Line Item #1: $50 shirt with an adjustment that decreases the price by $10.
* Line Item #2: $50 pants with no adjustment.
* Shipment #1: Containing just the shirt. Would normally be $5, but with a "Free shipping" adjustment applied, is actually $0.
* Shipment #2: Containing just the pants. Shipping is $10 for this.
* Order adjustment of $20 off, due to gift card usage.

The first line item's total would be calculated like this:

    ($50 - $10) = $40 + (10% of $40) = $44
    ($40)       =        $40 + $4    = $44

Worth noting here is that the discount is applied first, *then* the tax rate. This is the most sensible option because if someone is purchasing an item with the intention of receiving that $10 off, it is more intuitive that the $10 is off the listing price, rather than the after-tax price. This is also the recommended behavior, as mentioned later in the "Promotions and Tax" section.

The second line item would be calculated in roughly the same way:

    ($50 + (10% of $5) = $55
    ($50 + $5)         = $55

Note that in these situations we are calculating the adjustment amount (if it exists) and then the tax amount. The buyer of a product should only be taxed on the final adjusted price of the line item, rather than its base price. In the instance of the first line item, the base price is $40 rather than $50 due to do the -$10 adjustment. Therefore the tax for this item would be 10% of $40 ($4), rather than 10% of $50 ($5).

Therefore the order's total so far is `$44 + $55`, $99. Now to calculate the shipments, it would be this:

           (Shipment #1)              (Shipment #2)
    ($5 - $5) = $0 + (10% of $0)  +        $10

Because the first shipment has a "free shipping" adjustment, there is no additional tax adjustment to this shipment.

That means that the order's subtotal, with line items of $99 and shipments of $10, would be $109. The order's adjustment of $20 off, means the order's grand total is $89.

## Calculation of an order's total, with tax included in the price

To further complicate matters, tax that is included in an item's price must be backed out in certain circumstances. For example, an item with a 10% VAT tax sold in a European country to a buyer outside of that country must have that 10% tax "refunded". 

Taking again the example a single line item that costs $50, with 10% of that price being this 10% VAT tax. When this item is sold to someone outside the VAT zone, we must apply a negative adjustment to the line item to refund that tax. The calculation for the adjustment is this:

    $50 - ($50 / 110%) = $4.54545...

The adjustment is rounded up to the second decimal point, which will result in an adjustment of $4.55, rather than $4.54.

This means that the adjusted price for the line item will be:

    $50 - $4.55 = $45.45

If this item has a discount adjustment, then that discount is applied before the tax adjustment. Let's say that we have the $50 item with a $10 discount, and a tax rate of 10%. The calculation is then:

    ($50 - $10) - ($40 / 110%) = $3.6363636...

With the adjustment, the sale price of the item would only be $40, therefore the tax subtraction for this item will be $3.63, rather than the original $4.55.

## Tax adjustments within Spree

### The Theory

Tax adjustment calculation within current versions of Spree calculates the sum of all tax amounts for the line items and apply this total as a singular adjustment to the order. Shipments are currently not taxed.

Future versions of Spree will apply adjustments on a per-item basis; both line items and shipments will receive their own tax adjustments. 

Due to there not being one global tax rate, the only logical places to intially calculate the tax necessary for line items and shipments are after a user enters their address information, and then once more directly before they are asked to pay for the order.

The reasons for this are really simple: it's impossible to know what a person's tax rate is going to be before they have told us what their address is. Once we have that information, we can fairly accurately calculate the tax for all items within the order. Recalculating it once again before they pay for the order ensures that the adjustment amounts are correct.

(Aside: for a demonstration about how much exactly tax rates can differ, click around a couple of times on [this map](https://taxcloud.net/find-a-rate/default.aspx) within any one state. This service is what the [Spree Tax Cloud extension](https://github.com/bluehandtalking/spree_tax_cloud) uses.)

With adjustment information stored on a per-line item basis, it is now relatively easy to update a tax adjustment for a line item if that line item changes. Take for example our previous example of the $50 shirt with the 10% tax, but no other adjustment yet. To calculate that line item's tax, the calculation is this:

    $50 + (10% of $50) = $55

Now imagine that instead of 1 shirt, the buyer is actually buying 2. The calculation would only be this:

    ($50 * 2) + (10% of $100) = $110

In previous versions of Spree, having one tax adjustment for the entire order makes things complex, because this tax adjustment would need to be recalculated for *all* line items, rather than just the one that has changed.

By applying adjustments on a per-item basis -- as opposed to one adjustment for the entire order -- we also gain the ability to refund a product's price quickly and efficiently. Refunding a product is now as simple as calculating a line item's product price, plus any of its adjustments.

If an adjustment is applied to the order as a whole, we would need to calculate how much of that adjustment is for that particular item, refund the product's price (minus any adjustments) and then re-save the adjustment total for the order. This process -- just like the process described earlier of altering the quantity of a line item -- is computationally expensive.

### In Practice: Adjustment Creation

Tax adjustments within Spree are not applied until after we have the buyer's address. Once we have their address, then we can go back through the order and apply the tax adjustments to the line items. This event is triggered by a [state machine callback within `Spree::Order::Checkout`](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/order/checkout.rb#L74-L76). The [`create_tax_charge!` method](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/order.rb#L278-L281) calls out to [the `Spree::TaxRate.adjust` method](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/tax_rate.rb#L35-L39).

This method checks which tax rates match the order's tax zone. The tax zone for the order is determined either by the order's [tax_address](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/order.rb#L187-L189) (either its shipping or billing address, depending on the `Spree::Config[:tax_using_ship_address]`). If `Zone.match` does not return `true` in that case, it uses the default tax zone, if there is one. 

If this method does not return a zone, then `Spree::TaxRate.match` returns nothing and no adjustments are applied to the order.

If the method does return a zone, then [`Spree::TaxRate.match`](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/tax_rate.rb#L27-L33) goes through and checks every single tax rate against the order itself. The tax rates returned from this method are then [applied to each item](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/tax_rate.rb#L55-L69) that was passed in to `Spree::TaxRate.adjust` from `Spree::Order#create_tax_charge!`. The tax rates are compared with the items they're adjusting in the [`Spree::Calculator::DefaultTax` calculator](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/calculator/default_tax.rb). If the line item or shipment's tax category (inferred from the product's tax category) matches the tax category of the product, then an adjustment will be applied.

In this particular case of the state machine callback for transitioning out of the `address` state, it is *all* the line items and *all* the shipments which have their tax calculated. This same calculation of the tax rates for all line items and all shipments [also takes place once the order transitions to the payment step](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/order/checkout.rb#L83-L86).

The only additional place where tax adjustments are automatically created is within the `LineItem` model, as an [`after_create` callback](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/line_item.rb#L106-L108). This callback is necessary because if an order is created and has already transitioned past the address state, the tax rate would not be recalcuated until the order reached the payment state. On the delivery screen, the buyer may have seen one tax adjustment total, and on the payment screen another. This callback prevents this situation from occurring.

### In Practice: Updating adjustments

When a line item's quantity changes, its related adjustments must also be recalculated. Take for example the shirt worth $50 with a 10% tax again. To calculate the correct price for a shirt, the calculation is this:

    $50 + (10% of $50) = $55

When there are two shirts however, the calculation is this:

    ($50 * 2) + (10% of ($50 * 2)) = $110

Previous versions of Spree recalculate all the adjustments on the order, whereas this latest work only calculates the adjustments for things that have changed.

#### In the past

In previous versions of Spree, the process of updating a line item triggers an excessive amount of events to take place. Whenever [a line item is changed or destroyed, it calls `update_order`](https://github.com/spree/spree/blob/12c749ed149210cbd89e8b257bb851b931cfa9c3/core/app/models/spree/line_item.rb#L93-L99) which recalculates that line item's tax charge and then calls the "god method", `order.update!`. `order.update!` passes off to [`OrderUpdater#update`](https://github.com/spree/spree/blob/12c749ed149210cbd89e8b257bb851b931cfa9c3/core/app/models/spree/order_updater.rb#L17-L43) which does all of the following things:

* Recalculates payment, item, adjustment and order totals
* Updates order's payment state (but only if it's complete)
* Updates each shipment on the order
* Updates the shipment state for the order
* Updates promotional adjustments
* Updates shipping adjustments
* Recalculates payment, item, adjustment and order totals again, as these may have changed due to adjustments changing.
* Persists the totals to the database

These actions take place for every single line item that has been changed or destroyed. Having the adjustments linked to the order -- rather than adjustments on a per-item basis -- is what probably lead to this complexity.

Similar to this is when a shipment is saved. The [`ensure_correct_adjustment`](https://github.com/spree/spree/blob/12c749ed149210cbd89e8b257bb851b931cfa9c3/core/app/models/spree/shipment.rb#L273-L284) method is called, which could potentially save and update an adjustment. If this happens, then the [adjustment itself calls `order.update!`](https://github.com/spree/spree/blob/12c749ed149210cbd89e8b257bb851b931cfa9c3/core/app/models/spree/adjustment.rb#L117-L119), and for good measure the shipment has [an additional callback to update the order too](https://github.com/spree/spree/blob/12c749ed149210cbd89e8b257bb851b931cfa9c3/core/app/models/spree/shipment.rb#L286-L288).

#### In the future

In the new system, updating a line item [will update only that item's adjustments](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/line_item.rb#L96-L104). The code that does this lives inside [the Spree::ItemAdjustments](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/item_adjustments.rb) class and is simple enough to understand easily.

Worth noting here is that the adjustment total and tax total are stored separately on the records being updated. This is so that a final price -- that is, the original price of the item plus any adjustments -- can be quickly calculated without doing extra database queries. Storing the tax amount separately allows us to easily show how much of that price is a tax adjustment, again without the extra database queries.

Updating adjustments themselves now no longer trigger the `OrderUpdater#update` event to take place. Instead, the amounts [are simply recalculated for the adjustment](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/adjustment.rb#L74-L82), and no additional callbacks take place.

## Promotional adjustments within Spree

On first thought, promotional adjustments are simpler than tax adjustments. This is simply not true, because both systems were conceived of by people. Whereas tax law dictates the correct place to add (or remove) a tax adjustment, promotional adjustment rules are dictated by people.

For example, a promotion that gives a buyer 10% off an order may only be valid
if their order is over $100 *and* the buyer has placed their order within a
certain timeframe *and* they're one of the first 100 people to do so. Or it
may only be valid if the buyer enters a specific coupon code, or visits a
specific page on the store. Applying this type of promotion is easy, as the
rules apply only to the order as a whole, rather than a line item for that
order.

More ridiculous rules are those that make the promotion adjustment eligible
only for some select line items within the cart; only shirts, for example. Any
code that attempts to apply these promotions needs to check each line item
within the order for its eligibility. If the rule qualifies the line item for
the promotional adjustment, then an adjustment should be applied. Similar
rules may exist for shipments.

In cases like these, promotional adjustments need to be applied on a per-line-
item basis, as opposed to one big adjustment on the entire order. Applying
them on a per-line-item basis also has the added benefit of easing a refund
process, just as mentioned previously with regards to tax adjustments. Where
possible, per-item adjustments should be applied from promotions, rather than
whole-order adjustments. This is due to the difficulty involved with potentially refunding a whole-order adjustment.

For cases where a rule applies to either a line item or a shipment, each line item and shipment must be checked against that particular rule. If the line item or shipment is found to be eligible for that rule, then the actions for that promotion should be taken *only* on those items. Items that are ineligible for the rule should be ignored.

### Eligible promotions

To add some more complexity to the mix, some stores do not like it when two promotions are used at the same time. Let's say that the store has a promotion for 10% off all shirts this week, but they've also given some of their customers a $10 off coupon.

Let's keep going with the $50 shirt example. If the user purchases the shirt during the 10% off promotion week *and* they use the $10 off coupon then two adjustments will be applied to the item. The first adjustment will be one of 10% of $50, which is $5. The second adjustment will be $10. These two adjustments combined, result in a $15 discount to a $50 item, rather than either $5 or $10.

To counteract this in Spree, we have a method called `choose_best_promotion_adjustment`. Once the adjustments to an item have been applied, the [`ItemAdjustments#choose_best_promotion_adjustment`](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/item_adjustments.rb#L40-L49) method finds out which promotion is the best value for money, and marks all the *other* promotions as ineligible for that item. 

This code means that in the case of our 10% and $10 off promotions, the $10
off promotion "wins" because it gives the best value for money. However, if
there are 3 shirts, each worth $50, on the same line item, the tables turn.

When the line item's quantity changes, it updates the total price of the line item to be $150. The [`ItemAdjustments#update_adjustments`](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/item_adjustments.rb#L19) method updates each of the adjustments for that item. The adjustment for 10% off now subtracts $15 from the total, whereas the $10 adjustment still only subtracts $10. The 10% off adjustment now "wins" and is made eligible, and the previously eligible $10 adjustment is made ineligible.

### Promotions and Tax

It's worth noting also that tax adjustments for an item are calculated based on the discounted price, rather than the full price. This is done for two reasons:

1. So that customers are not charged more tax than they should be.
1. To be compliant with the law.

(Aside: This is clearly shown in [`ItemAdjustments#update_adjustments`](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/item_adjustments.rb#L19), where promotional adjustments are recalculated first, followed by tax adjustments.)

For point #1, take the example of the $50 shirt again. If this shirt has a $10 off discount applied to it, its purchase price will be $40. A tax rate of 10% means therefore that a tax amount of $4 would be applied to this item, rather than $5 if we assumed the base price, as we have done in the past.

The best place to see this happening is within the [`DefaultTax` calculator](https://github.com/radar/spree/blob/28cd74adaa88232ceec269a33783f1a79cd470a2/core/app/models/spree/calculator/default_tax.rb#L29-L39). The tax amounts for line items are calculated on the discounted amount -- the base amount minus any discounts -- rather than the base amount.

For point #2, there's two pages on the internet which show that this must be done. The first is [HM Revenue & Customs](http://www.hmrc.gov.uk/vat/managing/charging/discounts-etc.htm#1) which states:

> If any of your goods or services are discounted, you charge VAT on the discounted price rather than the full price.

The second is [California State Board of Equalization](http://www.boe.ca.gov/formspubs/pub113/), which states under the header "Nontaxable discounts and coupons":

> A sale is made for $100 plus $8.25 sales tax. Upon prompt payment for the item the purchaser is allowed a discount of two percent of the sales price of $100. Since you are deducting the amount of the discount, $2, from taxable gross receipts, you are charging tax of $8.09 (8.25 percent of $98) to your customer.

> When a discount of two percent is offered for prompt payment and an error is made and the discount of two percent is excluded from the computation, excess tax reimbursement of $0.16 will be collected from your customer ($8.25 - $8.09 = $0.16). The excess tax reimbursement should be returned to your customer or must be paid to the state.

While these are only two examples in the greater scheme of things, we believe that these are most likely the type of tax situations which apply the world over.

By no longer collection this excess tax, the customer for a Spree store will now end up paying marginally less tax than they may have done in the past.

## Store credits

The final area of adjustments to be discussed are store credits. These are typically manually applied to an order after the order has been completed by the buyer. The buyer may receive the store credit due to any number of reasons.

These credits are applied to the order as a whole and are the only time that a whole-order adjustment should be applied. In other situations, such as tax and promotional discounts, adjustments need to be potentially refunded along with the item.

Store credits, on the other hand, are manually applied adjustments. For an order with a store credit applied to it, care must be taken to ensure the correct refund is issued.

As an example, take the order that has been used as an example previously:

    Line Item #1 (LI1): $50 shirt, $10 off. 10% tax.
    Line Item #2 (LI2): $50 pants. 10% tax.
    Shipment #1   (S1): Just the shirt. $5. 10% tax.
    Shipment #2   (S2): Just the pants. $5. 10% tax.

The order's sub total is calculated like this:

    LI1        = ($50 - $10) + 10% of ($50 - 10) = $44
     +                                              +
    LI2        = $50 + 10% of $50                = $55
                                                    =
    Subtotal   = $44 + 55                        = $99
                                                    +
    S1         = $5 + 10% of $5                  = $5
     +                                              +
    S2         = $5 + 10% of $5                  = $5
                                                    =
    Total      = $99 + $10                       = $109

The order's total at this point is $109. Applying a store credit for $20 would cause the order's total to become $89. The line items' and shipments' amounts stay the same; it is only the order's total which has this modification applied. 

If both items are returned to the store, the refund amount for each item will still be the original cost ($44 and $55 respectively). Care must be taken here to ensure that the buyer does not receive a greater refund than the amount that they paid. If both items were refunded to their full amount, they would receive a refund of $99, even though the order's total is $89 due to the store credit application. Spree does not protect against this, nor should it.

## Comments or corrections

If you have any comments or corrections to offer, please email me at ryan@spreecommerce.com.

Last revision: 24th September, 2013.

