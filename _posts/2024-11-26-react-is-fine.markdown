---
wordpress_id: RB-1732653407
layout: post
title: React is fine
---

[This post called "Things you forgot (or never knew) because of React](https://joshcollinsworth.com/blog/antiquated-react) by Josh Collinsworth is a good read about the deficiencies of React, and includes a good comparison between React and the other frontend frameworks at the moment.

And yet, I find myself and my team consistently being productive with React. The main application we develop uses a lot of it, a second application has had a re-write of a key component into React, and other apps have "React sprinkles" through them. It's a versatile framework!

In our main application, we have React componentry brought in from our design system, which is then bundled together into much larger components. Most of these are static components: take some data, render an element a certain way depending on that data. Where we use React's "reactivity" is typically in a few small places:

1. Make this menu appear when its "open" button is clicked
2. Show a loading spinner while a request is processing
3. Display a validation error message if a field doesn't pass validation (for example: a card expiry that is in the past, or an invalid card number -- neither of which browsers support natively.)

We also leverage a lot of what GraphQL provides by exporting types from the backend to then inform types on the frontend. Yes, we _could_ do this [with another framework](https://the-guild.dev/graphql/codegen/docs/guides/svelte) but even adding a single component that uses this framework doubles our team's cognitive load for what seems like minimal benefit. These GraphQL types then go on to inform what the data used in those React components of the app should look like.

In terms of styling: we use Tailwind, which I covered in ["Tailwind has won"](https://ryanbigg.com/2024/03/tailwind-has-won). We don't need styles that are limited in scope to a particular component because of how Tailwind operates -- it's all utility classes and they don't apply _until you apply them_. Yes, you can have really really long class lists, but you can compress these down into your own utility classes, as we've done with things such as `.zeal-button-primary`.

Two things that we don't have yet in how our applications operate are server-side rendering and web components.

Server-side-rendering would mean that we could get away with displaying dynamic data, still using our existing React components, without displaying loading spinners all over the place. It's a trivial thing, but a loading spinner makes me think "this app could've taken an extra 100ms to fetch this data in the original request". We could probably get there with a little effort, though I do wonder how it'd work with the GraphQL things we have in place.

On web components: I would like to move parts of our design system towards adopting those. I'm somewhat wary of the "newness" of interactivity between React + web components, and also about the "split brain" of switching between "this is a React component" and "this is a web component". But I think web components is ultimately where we're headed, as the browser always wins.

(And on one more note: Don't get me started on Stimulus.)
