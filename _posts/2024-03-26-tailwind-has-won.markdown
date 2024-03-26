---
wordpress_id: RB-1711410035
layout: post
title: Tailwind has won
---

Over the last couple of months, I've been working across multiple applications that use various CSS frameworks. Specifically: [Bulma](https://bulma.io/), [Bootstrap](https://getbootstrap.com/) and [Tailwind](https://tailwindcss.com/). There are (at least) three distinct CSS frameworks within these applications because each of these apps have been developed over almost a decade and a half, and the flavour-of-the-month has changed a lot over that time. As people have worked on the systems, they have left the "fingerprints" of personal choices.

Three years ago, I became the Platform Tech Lead at Fat Zebra, which meant I was in charge of the technical side of things when it comes to our frontend. Part of this job meant standardising our frontend tech stack. At this time, Bootstrap (around v4.5) and Bulma (0.9.4) were the only two CSS frameworks used at Fat Zebra. After talking about it with the team, we decided to not use _either_ of these frameworks, and instead opted to go with Tailwind.

The reason for this is that we found Bulma lacking quite a lot of the common things from CSS frameworks we wanted -- it was too light. And, similarly, we found Bootstrap _too heavy_ -- it did too much.

Tailwind on the other hand, we found _just right_. It has an absolute wealth of styles, its documentation is absolutely stellar, and the preprocessor that shrinks the base CSS file to _just the styles you are using_.

On top of this, we've found the [Flowbite](https://flowbite.com/) component library to be incredibly helpful to declare base styles for our components. Our designer has integrated these styles into our Design System, called Zeal, and he provides designs in Figma based off these modified Flowbite components. These changes are then brought into our code through the [Tailwind config file](https://tailwindcss.com/docs/configuration), that's shared across our projects.

So now instead of having _three_ distinct CSS frameworks, we're undertaking work to use just the one: Tailwind, in combination with the customizations from our design system.

To share these Tailwind styles across components, we've got two methods that we rely on.

For React apps, we use React components with these class names specified in the `className` prop. Or if we're using these in non-React-apps, we'll move these styles into a shared CSS file, using Tailwind's [`@apply` directive](https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply):

```css
.zeal-button {
  @apply py-2 px-4 h-10 inline-flex items-center rounded-lg text-sm whitespace-nowrap disabled:cursor-not-allowed;
}

.zeal-button-primary {
  @apply zeal-button bg-primary-500 text-white disabled:bg-primary-300 active:bg-primary-700 hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-300;
}
```

Then we can use these as substitutions in our HTML, instead of spamming it with all the classes:

```html
<button class='zeal-button-primary'>
```

This setup works incredibly well for our little team, and I suspect it would scale as well for an even bigger team. Changes get applied to the design system, which then are updated in Figma, and those updates flow through to our React components or our CSS files, depending on which component it is.

So for all of these reasons above, **Tailwind has won the CSS framework wars.** It provides a set of very sensible defaults out of the box, with just enough extensibility for us to build a design system on. It works well with React components, or regular HTML views. And it has a ton of useful documentation and example components out there that you can use to get started.
