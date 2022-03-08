---
wordpress_id: RB-1617786728
layout: post
title: "View Components: The Missing Link"
---

There has been an uptick in making Rails play nice with React recently, made possible by gems such as [react-rails](https://github.com/reactjs/react-rails). The `react-rails` gem allows you to inject React components into your Rails views like this:

```erb
<%= react_component("HelloWorld", { greeting: "Hello from react-rails." }) %>
```

The first argument here is the component name, and the hash at the end is the props that get passed down to the component.

This gem serves a very useful purpose, but I think there's a missing link here and I want to show you what that link is, and how best to leverage it.

### Complicated props crowd up the view

Sometimes, we want to pass a bunch of props through to a React component. Maybe it starts out as one prop and then grows to ten props. This can get really messy:

```erb
<%= react_component("UserPicker", { users: @users.map { |user| { value: user.id, label: user.name }} }, selectedUserIds: @selected_user_ids }) %>
```

As a component grows in complexity, the amount of Ruby in the view continues to grow and grow. Views are sometimes treated like a dumping ground: "well, this _can't_ go in the model and it _shouldn't_ go in the controller... guess I'll just leave it here in the view!"

Yes, this could be more clearly written with some line breaks:

```erb
<%= react_component("UserPicker", {
  users: @users.map do |user|
    { value: user.id, label: user.name }
  end,
  selectedUserIds: @selected_user_ids
}) %>
```

But that still feels quite clunky!

### Enter, view components

GitHub, has released a gem called [view_component](https://github.com/github/view_component/) which aims to solve this problem in a neat way. The `view_component` gem defines new classes where you can put complicated view logic, and separates those views into their own directory too.

Let's take our `UserPicker` component from above. This now becomes a class called `UserPickerComponent`, and lives at `app/components`:

```ruby
class UserPickerComponent < ViewComponent::Base
  attr_reader :users, :selected_user_ids

  def initialize(users:, selected_user_ids:)
    @users = users
    @selected_user_ids = selected_user_ids
  end

  def props
    user_props = @users.map { |user| { value: user.id, label: user.name } }

    {
      users: user_props,
      selectedUserIds: @selected_user_ids
    }
  end
end
```

That's much nicer! Our Ruby code is now where it belongs: in a _Ruby_ file. The code that converts the users to an array-of-hashes with `value` and `label` key now feels at home in this file and has stopped clogging up our ERB file.

But where's our ERB code that renders this React component? Isn't that back over in `app/views`? Well, yeah it is! But we can move that code now into the _other half_ of `view_component`, a special view component ERB file at `app/components/user_picker.html.erb`:

```erb
<%= helpers.react_component "UserPicker", **props %>
```

View component renders components using a combination of the Ruby class and the ERB template, both named the same.

To access the `react_component` helper, we need to use the `helpers` method provided by `view_component`. But there's not much difference here to what we had earlier in a view.

The main thing to note is that our Ruby code now lives in a Ruby file, and the code to render the React component lives over in the component's view. If we had any additional HTML that was required to be wrapped around this component, this is where it would belong too. I've left that out to make things simple here.

If this is the only line of code that would be in our view, we can instead define a `call` method on the component class:



### Rendering a view component

With the Ruby and ERB nicely separated into a view _component_, it's time to add that code back to our view. We will first need to initialize the component in the controller action:

```ruby
def new
  @user_picker_component = UserPickerComponent.new(
    users: @users,
    selected_user_ids: @selected_user_ids,
  )
end
```

Then we can render the component, just like we would render a partial, by calling `render` in the view for the action:

```erb
<%= render(@user_picker_component) %>
```

And there you have it, a clear separation between the responsibilities for rendering a React component within a Rails application. We now have:

* The controller action: responsible for collection information based on the request, and prepares the component
* The view: tells Rails where we want to put the component
* The component Ruby class: container for any Ruby code that we need to run _before_ rendering our React component, but _after_ the controller has done its duty
* The component view file: a clearly separated file that concerns itself with only rendering a React component

### Translations

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">How are people taking i18n translations and making them available to React components these days?</p>&mdash; Ryan Bigg (@ryanbigg) <a href="https://twitter.com/ryanbigg/status/1379259002731646979?ref_src=twsrc%5Etfw">April 6, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

A few days ago, I started experimenting with the right ways to pass translations down to these React components from Ruby.

A few replies to the above tweet were along the lines of "just load all 644kb of JSONified I18n translations on every page load! Your users will love you!" and if this is supposed to be the latest-and-greatest of web development please let me off this wild ride.

Having a view component means that we have somewhere that we can run calls to `I18n.t`, and then pass these as strings through to our React component. Here, let's have a look:

```ruby
class UserPickerComponent < ViewComponent::Base
  attr_reader :users, :selected_user_ids

  def initialize(users:, selected_user_ids:)
    @users = users
    @selected_user_ids = selected_user_ids
  end

  def props
    user_props = @users.map { |user| { value: user.id, label: user.name } }

    {
      users: user_props,
      selectedUserIds: @selected_user_ids
      translations: translations
    }
  end

  private

  def translations
    scope = "users.picker"

    {
      selectAUser: helpers.t("select_a_user", scope: scope)
    }
  end
end
```

In the component file, we're now defining an extra method called `translations`. This is then going to add one extra prop to our React component, and definitely _won't_ be sending 664kb of JSONified I18n translations to our users.

To access these translations in the component, we access them the same as any other property:

```tsx
const UserPicker = ({ translations, users, seelectedUserIds}) => {

  return (
    // ...
    <p>{translations.selectAUser}</p>
  )
}
```
