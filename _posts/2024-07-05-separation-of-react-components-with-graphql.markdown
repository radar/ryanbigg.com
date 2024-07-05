---
wordpress_id: RB-1720136421
layout: post
title: Separation of data and view layers in React components
---

In my [Apollo Handbook](https://leanpub.com/apollo-handbook) I cover how to use React + Apollo to interact with a GraphQL API. I thought I'd share a pattern from that book that is making working with this library easier, in particular the pattern where we separate the _data layer_ from the _view layer_ of a component.

With Apollo and [GraphQL code generator](https://the-guild.dev/graphql/codegen), we get React hooks that we can use in our component. It can be tempting to combine both these layers together in a single component:

```tsx
const Product = (id: string) => {
  const { data, loading, error } = usePurchaseQuery({ variables: { id } });

  // handle loading + error states...

  const { product } = data;

  return (
    <div>
      <h1>{product.name}</h1>

      {product.description}
    </div>
  );
};
```

But then this component is tied too closely to where it gets its data from, and if you want to test (such as in React Testing Library) how your components behave when they receive certain props, you must then stub the data layer.

An alternative approach that I like is separating the data and view layers into two distinct functions. The first function is the data function:

```tsx
const WrappedProduct = (id: string) => {
  const { data, loading, error } = usePurchaseQuery({ variables: { id } });

  // handle loading + error states...

  const { product } = data;

  return (
    <Product {...product} />
  );
}
```

Its responsibility is to grab the data and pass it to the view component. The `loading` and `error` states can also be handled by this component, or something such as a higher-order `ErrorBoundary` component.

When the `Product` component receives the props, we can use the type from the query itself to inform the view component of the correct types:

```tsx

import ProductQuery from "@graphql/types"

type ProductType = ProductQuery["product"]
const Product = ({ name, description }: ProductType) => {
   return (
    <div>
      <h1>{product.name}</h1>

      {product.description}
    </div>
  );
}
```

This is a small contrived example, but for a more complicated component this would make it easier to use this component in React Testing Library to run assertions on its behaviour, or to render it in Storybook to see how it looks.

Rather than stubbing the GraphQL request / response cycle, we can instead pass typed props along to the component.

Here's what our test file might look like:

```tsx
type ProductType = ProductQuery["product"]

const product: ProductType = {
  name: "Rolo Tomassi - Where Myth Becomes Memory",
  description: "2022 Album"
}

it("displays a product name", () => {
  render(<Product {...product}>)

  expect(screen).toHaveContent("Rolo Tomassi - Where Myth Becomes Memory")
})
```

If we're concerned with how the GraphQL layer is handling its response, then we still have the option to test that layer with something like [Mock Service Worker's GraphQL API](https://mswjs.io/docs/api/graphql/).
