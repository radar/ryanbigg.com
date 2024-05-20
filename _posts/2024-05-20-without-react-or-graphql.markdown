---
wordpress_id: RB-1716236567
layout: post
title: "Thought Experiment: Without React or GraphQL"
---

I've spent a great deal of my writing time in the past few years arguing for GraphQL in my [GraphQL for Rails Developers](https://pragprog.com/titles/d-rbgql/graphql-for-rails-developers/) and its frontend companion Apollo in the [Apollo Handbook](https://pragprog.com/titles/d-rbgql/graphql-for-rails-developers/). I think these are very good tools for providing a clear separation between an API layer and a frontend layer.

But in saying that, I acknowledge there is no silver bullet for software development. So what would I do if I _couldn't_ use React or GraphQL?

To replace React on the frontend, I would use [View Component](https://viewcomponent.org/) as I have written about [here](https://ryanbigg.com/2024/01/view-components-table-edition) and [here](https://ryanbigg.com/2023/06/rails-7-react-typescript-setup). I could also be convinced to use [Phlex](https://www.phlex.fun/).

I think having a typed layer between your database and view is just something that _makes sense_, and so to that end I would define a _separate_ class for the data types for these components, using `dry-types` and then pass objects of those classes to the view, in a way that if you squint hard enough you could see it as the Presenter Pattern. I proposed something similar to this [two years ago in my "Typed View Components" post](https://ryanbigg.com/2022/03/typed-view-components)

Riffing on the example from that post, I would have this as:

```ruby
class RefundComponent < ViewComponent::Base
  extend Dry::Initializer
  Types = Dry.Types()

  class Refund < Dry::Struct
    schema schema.strict

    attribute :standalone, Types::Bool
    attribute :amount, Types::Float
    attribute :currency, Types::String
  end

  option :refund, Refund
end
```

This allows you to keep together the logic of the component (both its Ruby code and its associated views) and the presenter in one directory.

In the controller, the code would look like this:

```ruby
refund = RefundComponent::Refund.new(
  standalone: @refund.standalone?
  amount: @refund.amount,
  currency: @refund.currency,
)

@refund_component = RefundComponent.new(refund: refund)
```


This would still give us an interface _similar_ to GraphQL, where the connecting layer between the database and the frontend is still typed. I think it's teetering on the edge of being too verbose, but in all things trade-offs.

You then don't end up exposing any way of doing database queries to the view, which would help prevent N+1 queries. And you can test your views in isolation from the database too. The `refund` passed to the component doesn't have to come from the database; it could be a stubbed object, as long as it responds to the right methods.

In the view file itself you might or might not get smart tab-completion like you do within TypeScript-powered GraphQL code, but I think that's a fair trade-off.

This whole approach trades off React's "reactivity" as well, so there's no state management going on here or DOM updating when the state changes. There are probably ways around this (like Hotwire, etc.) but I haven't gone down those paths yet.

Another benefit here is that all the code is in one language, rather than three (Ruby, GraphQL and TypeScript), and that might make it easier for frontend-adverse people to pick it up as well.
