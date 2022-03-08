---
wordpress_id: RB-1646714849
layout: post
title: Typed View Components with dry-types
---

This post was originally inspired by [Konnor Rogers](https://twitter.com/RogersKonnor), and [this gist from him](https://gist.github.com/ParamagicDev/5dc17dea9e8ab414d227461ae521f011).

---

Last year, I wrote about [View Components](https://ryanbigg.com/2021/04/view-components-the-missing-link) for the first time. That post demonstrated how you could use View Components to bridge the gap between Ruby and React by using a View Component to build up the props for a React component.

Since then, I've joined [Fat Zebra](https://fatzebra.com) and we're doing a lot of work involving Rails, React and View Components.

One thing we've discovered that helps with using View Components is adding types by using the `dry-initializer` and `dry-types` to those View Components. While we have the protection of types in TypeScript, we do not have the same level of protection in Ruby. And since TypeScript only does compile-time checking, it means that we could pass a property from these Ruby View Components down to our React components where that property's type is incorrect.

Take for (contrived) example, this simple component that takes in a `standalone` property.

```ruby
class RefundComponent < ViewComponent::Base
  attr_reader :standalone

  def initialize(standalone:)
    @standalone = standalone
  end

  def props
    {
      standalone: standalone,
      # ...
    }
  end
end
```

There's nothing in this component that dictates the type for `standalone`. It should be a boolean. It _could be_ a string, or a number, or literally any valid object in Ruby. So when this component is used in this way:

```ruby
render RefundComponent.new(standalone: params[:standalone])
```

What's going to happen here?

Well, if we _think_ standalone is a boolean, we can expect `params[:standalone]` is going to be either `"true"` or `"false"` ,given that Rails parameters are stringified.

Inside our React component, we might have code like this.

```tsx
{standalone ? "Standalone" : "Not Standalone"}
```

The string `"true"` does the same as the boolean `true`. The string `"false"` does not do the same as the boolean `"false"`.

This is completely innocent code, and the kind that we might write any old day. Nothing stopped us from writing it. In fact, TypeScript gave us _two_ thumbs up when we compiled our React code. Ruby doesn't care. Ruby's fine as long as the syntax is correct.

---

To prevent a mistake like this, we can use the `dry-initializer` and `dry-types` gems like this:

```ruby
class RefundComponent < ViewComponent::Base
  extend Dry::Initializer
  Types = Dry.Types()

  option :standalone, Types::Bool

  def props
    {
      standalone: standalone,
      # ...
    }
  end
end
```

The `Types` constant here is usually defined on a more "global" level. For example, you might define it at `lib/types.rb` for your entire application. I've just included it in the class here for brevity.


The `option` method here defines a keyword argument initializer for `RefundComponent`, so this means our component will still be able to be rendered in the same way:

```ruby
render RefundComponent.new(standalone: params[:standalone])
```

But this time, if we pass it a stringly-typed `standalone` here, it will show us an error:

```
"false" violates constraints (type?(FalseClass, "false") failed) (Dry::Types::ConstraintError)
```

The error message is wordy, but with enough practice (just like TypeScript!) we can learn to read these. The error message here says that the type of `FalseClass`, is not the same type as `"false"`.

We cannot pass the stringly-typed `params[:standalone]` here anymore.

Instead, we would have to convert this parameter to a boolean so that our code would work:

```
render RefundComponent.new(standalone: params[:standalone] == 'true')
```

### But wait, there's more...

We can also use `dry-types` to define the types for our properties too, in case we had some complicated logic there.  Perhaps we have an amount that is returned, and we want to guarantee it's a float by the time it gets to our React library. To spice things up, for legacy reasons the `amount` arrives at our component as a string, not a float. With this amount also comes a currency property, which is also a string.

Here's how we would handle that by using another `dry-rb` library, `dry-struct`:

```ruby
class RefundComponent < ViewComponent::Base
  extend Dry::Initializer
  Types = Dry.Types()

  option :standalone, Types::Bool
  option :amount, Types::String
  option :currency, Types::String

  class Props < Dry::Struct
    schema schema.strict

    attribute :standalone, Types::Bool
    attribute :amount, Types::Float
    attribute :currency, Types::String
  end

  def props
    Props.new(
      standalone: standalone,
      amount: amount.to_money(currency).to_f,
      currency: currency,
      # ...
    ).to_h
  end
end
```

This way, we can call `RefundComponent` with a stringified `amount`, and have `props` be the correct type:

```
>> component = RefundComponent.new(standalone: params[:standalone] == 'true', amount: "1234", currency: "AUD")
=> #<RefundComponent:0x000000013e6a76a8 @amount="1234", @currency="AUD", @standalone=true>
>> component.props
=> {:standalone=>true, :amount=>1234.0, :currency=>"AUD"}
```

If the type of `Props#amount` (once it has been coerced) wasn't a float and instead was an integer, like this:

```ruby
amount: amount.to_money(currency).to_i,
```

This code would cause this error:

```
1234 (Integer) has invalid type for :amount violates constraints (type?(Float, 1234) failed) (Dry::Types::SchemaError)
```

This helps alert us to a typing issue earlier on in our code, before it even reaches our React code.
