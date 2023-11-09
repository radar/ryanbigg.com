---
wordpress_id: RB-1699506854
layout: post
title: Ruby 3, Hashes and Keyword Arguments
---

We debugged a fun one today.

There's a method provided by Rails called `tag`, and it provides a way to write HTML tags.

We were using it like this:

```ruby
def react_component(component_name, props, options = {})
  tag.div({
    data: {
      react_component: component_name,
      props: props.to_json,
    }
  }.merge(options)) { "" }
end
```

Did you spot the bug? We didn't for a while. The symptom was that we were seeing completely blank `<div></div>` tag, when we were expecting them to have at least the `data` attributes populated.

The issue here has to do with how Ruby 3 has changed how it processes keyword arguments. In Ruby 2.7, the argument passed to `react_component` was interpreted as keyword arguments. In Ruby 3, it's interpreted as a regular argument, where the value of that argument is a Hash object.

This means that when [the `TagHelper#method_missing` method](https://github.com/rails/rails/blob/60d05cda7f0000692391cb761caa496e8fa9014c/actionview/lib/action_view/helpers/tag_helper.rb#L320-L326) is called in Action View, the parameters of this are:

* `called`: "div"
* `*args`: `[{data: { react_component: component_name, props: props.to_json }}]``
* `**options`: {}

The fix for this is to tell Ruby that we mean to use keyword arguments here, rather than a Hash argument:

```ruby
def react_component(component_name, props, options = {})
  react_options = {
    data: {
      react_component: component_name,
      props: props.to_json,
    }
  }.merge(options)

  tag.div(**react_options) { "" }
end
```
