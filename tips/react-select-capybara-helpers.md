---
layout: default
---

# React-select Capybara helpers

There's a gem called [capybara-select2](https://github.com/goodwill/capybara-select2) that will let you target Select2 components, but for `react-select`, those components have dynamic class names. To target these, you must specify a custom class on the component itself:

```tsx
<Select
  classNamePrefix="advanced_filter" />
```

Then, it is helpful to have a special `SelectControl` class for dealing with these components:

```ruby
module FilterHelpers
  class SelectControl
    include Capybara::DSL

    attr_reader :prefix

    def initialize(prefix:)
      @prefix = prefix
    end

    def select(option)
      within_control do
        find("input").fill_in(with: option)
      end

      find(".#{prefix}__option", text: option).click
    end

    def value
      find(single_value_selector).text
    end

    def blank?
      page.has_no_selector?(single_value_selector)
    end

    def values
      all(multi_value_selector).map(&:text)
    end

    def remove(label)
      value = find(multi_value_selector, text: label)
      within(value) do
        find("#{multi_value_selector}__remove").click
      end
    end

    def visible?
      page.has_selector?(control_selector)
    end

    def hidden?
      !visible?
    end

    private

    def single_value_selector
      ".#{prefix}__single-value"
    end

    def multi_value_selector
      ".#{prefix}__multi-value"
    end

    def control_selector
      ".#{prefix}__control"
    end

    def within_control(&block)
      within(control_selector, &block)
    end
  end

  module AdvancedFilterControl
    def advanced_filter_control
      SelectControl.new(prefix: "advanced_filter")
    end

    def select_advanced_filter(advanced_filter)
      advanced_filter_control.select(advanced_filter)
    end

    def expect_advanced_filter_selected(advanced_filter)
      expect(advanced_filter_control.value).to eq(advanced_filter)
    end

    def expect_no_advanced_filter_selected
      expect(advanced_filter_control).to be_blank
    end
  end
end
```

Then in the tests, you can use helpers like `select_advanced_filter` to select the values, rather than clumsy selector calls.
