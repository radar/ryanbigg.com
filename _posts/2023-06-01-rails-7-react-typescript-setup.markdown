---
wordpress_id: RB-1682370662
layout: post
title: Rails 7, React, TypeScript, ESBuild and View Components
---

Here's a short guide to setting up an existing Rails 7 application with React, TypeScript, ESBuild. One approach here would be to use the `react-rails` gem, but I would like to show you the individual steps to setting it up here instead.

### Installing ESBuild

First you'll want to install the `jsbundling-rails` gem:

```
bundle add jsbundling-rails
```

Next, you'll run the generator for this gem to setup ESBuild:

```
bin/rails javascript:install:esbuild
```

This will create an `app/javascript/application.js` file that we will not need -- so delete this file.

ESBuild will be setup to build assets in `app/javascript`, and put them into `app/assets/builds`. From there, Rails will be able to serve those assets.

This install script has added a new `build` script to `package.json`:

```json
"scripts": {
  "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets"
}
```

Once we've setup our React code we will be able to run this command to take that code and compile it into some JavaScript browsers can run.

I like to change this script to point at an `entrypoints` subdirectory:

```json
"scripts": {
  "build": "esbuild app/javascript/entrypoints/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets"
}
```

This is so that I can put other directories inside `app/javascript`, such as directories including little helper functions, or bigger component structures like `app/javascript/Purchases/Table.tsx`.

It also means that ESBuild will not build _everything_ in that directory -- just the files we declare as entrypoints.

### Installing React & TypeScript


To install React and TypeScript we'll run this `yarn` command:

```
yarn add react@^18.2 @react-dom@^18.2 @types/react @types/react-dom typescript
```

To configure TypeScript so that it supports React's JSX templating, we'll create a `tsconfig.json` file at the root of our Rails application with this content in it:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "jsx": "react",
  }
}
```

To see some React code in action and to check out setup, we can create a new file at `app/javascript/entrypoints/application.tsx` and put this code into it:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => <h1>Hello from React!</h1>;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);
```

After this, we can build our application's assets by running:

```
yarn build
```

This will show us that it has built these assets:

```
yarn run v1.22.19
warning package.json: No license field
$ esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets

  app/assets/builds/application.js      1.0mb ⚠️
  app/assets/builds/application.js.map  1.5mb
```

To test that it's all working, we can generate a simple view:

```
rails g controller home index
```

And into `app/views/home/index.html.erb` we can put a simple div with the ID of `root`. This is the element that our `ReactDOM.createRoot` code was targeting earlier:

```html
<div id='root'></div>
```

When we start our Rails app with `bundle exec rails s` and go to http://localhost:3000/home/index, we'll see our "Hello from React!" message.

![Hello from React](/images/css-bundling/react/hello.png)

This works "out of the box" because our application layout already brings in this compiled asset:

```erb
<%= javascript_include_tag "application", "data-turbo-track": "reload", defer: true %>
```

### Multiple mount points

If you're running a single-page app, you can probably stop reading here and continue throwing things into `<App>`.

If you're wanting to go down a different route, then keep reading. That different route is multiple individual components, where you may wish to mount a component on a per-page basis, than one component for the whole app.

To do this, we can create a file at `app/javascript/mount.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

type Components = Record<string, React.ElementType>;

export default function mount(components: Components): void {
  document.addEventListener("DOMContentLoaded", () => {
    const mountPoints = document.querySelectorAll("[data-react-component]");
    mountPoints.forEach((mountPoint) => {
      const { dataset } = mountPoint as HTMLElement;
      const componentName = dataset.reactComponent;
      if (componentName) {
        const Component = components[componentName];
        if (Component) {
          const props = JSON.parse(dataset.props as string);
          const root = ReactDOM.createRoot(mountPoint);
          root.render(<Component {...props} />);
        } else {
          console.warn(
            "WARNING: No component found for: ",
            dataset.reactComponent,
            components
          );
        }
      }
    });
  });
}
```

This code attempts to find all elements that contain a `data-react-component` attribute, and then to mount components matching that name onto the page in those locations. This code also parses any props contained in a `data-props` attribute and passes those along to the component too.

In practical terms, a page containing:

```html
<div data-react-component='App' data-props="{}"></div>
```

Would have a component called `App` mounted into the location of that div tag. This then allows us to intermix React components with our Rails application, which can be particularly helpful if we have an older Rails app that we're enhancing with some newer React components.

To see this in action, let's use this new `mount` function over in `application.tsx` by replacing the code in that file with this code:

```
import React from "react";
import mount from "./mount";

const App = () => <h1>Hello from React!</h1>;

mount({
  App,
});
```

And also the code in `app/views/home/index.html.erb` with this code:

```html
<div data-react-component='App' data-props="{}"></div>
```

We can then run `yarn build` to rebuild our assets, and then refresh our browser to see the same message as before.

### View Components

Writing this lengthy HTML into our views every time we want to render a React component will get tiresome quickly. To save us repeating ourselves again and again, we're going to use a gem called `view_component`. We can install this gem with:

```
bundle add view_component
```

We can then create a new component class using this gem, placing it into `app/components/react_component.rb`:

```ruby
# frozen_string_literal: true

class ReactComponent < ViewComponent::Base
  attr_reader :component, :raw_props

  def initialize(component, raw_props: {})
    @component = component
    @raw_props = raw_props
  end

  def call
    helpers.tag.div(
      '',
      data: {
        react_component: component,
        props: props
      }
    )
  end

  private

  def props
    raw_props
  end
end

```

This class is then going to place that `div` tag onto our page for us. This class will serve as a base class for any other component classes we define in our app. Those subclasses of `ReactComponent` can override `props` if they need to do work to prepare the props before they're passed through to the component.

Then we can use this component to render React components within our application. Let's change the code in `app/views/home/index.html.erb` to render the `App` component by using this component class:

```erb
<%= render ReactComponent.new("App") %>
```

We can use the view component just like a partial. I'll get to why we're _not_ using partials in a moment. It deserves its own section!

We will need to restart the Rails server at this point so that it picks up the file in `app/components`. After restarting the server, and refreshing the browser, we'll once again see our React component's output.

### Why view components over partials

Why did we complicate things by bringing in a new gem rather than using the wonderful partial features Rails provides?

The simple answer is: Ruby code belongs in Ruby files. And I don't just mean calls to `tag.div`. I mean if you had any sort of Ruby code that needed to run before rendering this component, you could now put that code into the component class.

As an example here, let's create a new React component called `Product`. It will render a name and a price. We'll put this component at `app/javascript/Product/index.tsx`:

```tsx
import React from "react";

const Product = ({ name, price }: { name: string; price: string }) => {
  return (
    <>
      <h1>
        {name} - {price}
      </h1>
    </>
  );
};

export default Product;
```

We can then tell our application to mount this component whenever it sees a `div[data-react-component=Product]` tag, by using the `mount` helper in `app/javascript/entrypoints/application.tsx`:

```
import React from "react";
import mount from "../mount";
import Product from "../Product";

const App = () => <h1>Hello from React!</h1>;

mount({
  App,
  Product,
});
```

As we've now changed `application.tsx`, we will need to rebuild it with `yarn build` again. Now is a good time to say we could've been running `yarn build --watch` this whole time... but I preferred being explicit about when things were being rebuilt and why. Now you know the secret.

To render this React component, we'll create a new Ruby file to represent the Ruby-side of this component. We'll put this component into `app/components/products/show_component.rb`:

```ruby
module Products
  class ShowComponent < ReactComponent
    def initialize(raw_props)
      super("Product", raw_props: raw_props)
    end

    def props
      raw_props.merge(
        price: helpers.number_to_currency(raw_props[:price])
      )
    end
  end
end
```

This component file inherits from our `ReactComponent` component class and will render that component. To use this Ruby component class, we can go back into `app/views/home/index.html.erb` and put this code there:

```erb
<%= render Products::ShowComponent.new(name: "Shoes", price: 100) %>
```

Using this component will mean that we will end up with this `div` tag on the page:

```html
<div data-react-component="Product" data-props="{&quot;name&quot;:&quot;Shoes&quot;,&quot;price&quot;:100}"></div>
```

Our `mount.tsx` code will see that `div` tag and mount the `Product` React component into that place, passing through the props.

Now, the reason for this whole section: **we use view components over partials because Ruby code belongs in Ruby files**.

As a quick example of this, if we want to format the price before it goes to the component, we can update our `ShowComponent` code to process those props:

```ruby
module Products
  class ShowComponent < ReactComponent
    def initialize(raw_props)
      super("Product", raw_props: raw_props)
    end

    def props
      raw_props.merge(
        price: helpers.number_to_currency(raw_props[:price])
      )
    end
  end
end
```

Here we're calling a Ruby method in Ruby code in order to format the price. We're not limited to just methods from `helpers` here -- we could call any Ruby code that we wanted to. This is, in my opinion, better than interspersing Ruby and HTML code into the same file.

What this also means is that we could pass a product through to our component from the `app/views/home/index.html.erb`, rather than passing attributes one-by-one:

```erb
<%= render Products::ShowComponent.new(product: @product) %>
```

(I'm making an assumption here about having a `@product` object set up in the controller -- use your imagination!)

And then in that component class, we can take the raw props of the product object itself and do our formatting of the price:

```ruby
module Products
  class ShowComponent < ReactComponent
    def initialize(product)
      super("Product", raw_props: product)
    end

    def props
      {
        name: product.name,
        price: helpers.number_to_currency(product.price)
      }
    end
  end
end
```

The View Component class finally gives our Ruby view code a proper home to live: in a Ruby file, NOT a HTML file!
