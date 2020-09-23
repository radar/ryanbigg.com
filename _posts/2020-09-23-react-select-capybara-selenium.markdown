---
wordpress_id: RB-1600826243
layout: post
title: React Select + Capybara + Selenium
---

Today, I was adding a [React Select](https://react-select.com/home) element to a page, and I really wanted to test it.

This is, surprisingly, [not the first time I've attempted this](https://github.com/JedWatson/react-select/issues/856).

Since 2016, React Select has undergone some changes, released a brand-new (and much better!) version. One of these big features is that it uses [Emotion](https://emotion.sh/docs/introduction) for styling. A consequence of this is that React Select no longer has `.Select`, or `.Select-input` classes that you could use as selectors in the tests. Instead, it will generate hashed CSS selectors, like `css-2b097c-container` and `css-1rhbuit-multiValue`. These have the potential to change: if the underlying CSS changes, then the hash will change. So they are not reliable in tests.

To fix this, I used another prop of `ReactSelect` called `classNamePrefix`:

```tsx
import CreatableSelect from "react-select/creatable";

// ...

const options = [
  { label: "Admin", value: "Admin" },
  { label: "HIU", value: "HIU" },
  { label: "Organisational", value: "Organisational" },
  { label: "Paid", value: "Paid" },
];

// "tags" here comes from a prop on this component
const selectedOptions = options.filter(({ value }) => tags.includes(value));

return (
  <CreatableSelect
    options={options}
    defaultValue={selectedOptions}
    isMulti
    classNamePrefix="tags"
  />
);
```

This prop adds additional classes to the React Select component, such as `.tags__control` and `.tags__multi-value` -- values that _are_ reliable and predictable!

This means that in the Capybara test, I can now use these to interact with this React Select component, like this:

```ruby
def within_tags(&block)
  within(".tags__control", &block)
end

def expect_selected_tag(tag)
  within_tags do
    expect(page).to have_selector(".tags__multi-value", text: tag)
  end
end

def add_new_tag(tag)
  within_tags do
    find("input").fill_in(with: tag)
    find(".tags__option", text: tag).click
  end
end

def remove_tag(tag)
  within_tags do
    within(".tags__multi-value", text: tag) do
      find(".tags__multi-value__remove").click
    end
  end
end

scenario "Can update a User's tags", js: true do
  visit edit_admin_user_path(user)

  expect_selected_tag("Existing tag")
  remove_tag("HIU")
  add_new_tag("Paid")
  add_new_tag("Custom tag")
end
```

I have the following helpers:

1. `expect_selected_tag`: When the page loads, the Select element should contain a tag that is _already_ assigned to the user.
2. `remove_tag`: Used to remove a tag that appears in the Select element.
3. `add_new_tag`: Used to add either a tag from the list of options, or to create a brand new tag.

With these helpers, I can effectively test React Select within Capybara and Selenium.
