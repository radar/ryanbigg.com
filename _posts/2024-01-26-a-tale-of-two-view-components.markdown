---
wordpress_id: RB-1706230619
layout: post
title: A Tale of two View Components
---

Last night I saw [this post from Will Cosgrove](https://blog.willcosgrove.com/a-tale-of-two-phlexes) showing how he would build a table interface in Phlex. I really like the terseness of the syntax he came up with, and I decided to see how I would approach this too, but using the [View Component](https://viewcomponent.org) gem. This isn't to say one approach is better than the other -- more to show an alternative. Phlex _and_ View Component are _both_ great!

Ultimately, the View Component code is much the same, but we define a Ruby class to wrap our table:

```ruby
class UsersTableComponent < ViewComponent::Base
  def initialize(users:)
    @users = users
  end

  def call
    component = Zeal::TableComponent.new(rows: @users) do |table|
      table.column("First Name", &:first_name)
      table.column("Last Name", &:last_name)
      table.column("Email", &:email)
    end

    render component
  end
end
```

This can then be called in view by doing:

```
<%= render UsersTableComponent.new(users: @users) %>
```

The `Zeal::TableComponent` is defined as this:

```ruby
module Zeal
  module Tables
    class TableComponent < ViewComponent::Base
      attr_reader :columns, :rows

      def initialize(rows: [], &block)
        @columns = []
        @rows = rows
        yield self
      end

      def column(label, &block)
        @columns << {
          label: label,
          block: block
        }
      end

      def render_headers
        render Zeal::Tables::HeaderCellComponent.with_collection(columns)
      end

      def render_cells(row)
        render Zeal::Tables::BodyCellComponent.with_collection(columns, row: row)
      end
    end
  end
end
```

The code that's mostly HTML doesn't get written by some fancy pants Ruby, instead I used a html+ERB file:

```erb
<table class='min-w-full' role='table'>
  <thead class="bg-gray-100 border-b border-gray-200">
    <tr role="row">
      <%= render_headers %>
    </tr>
  </thead>

  <tbody role='rowgroup'>
    <% rows.each do |row| %>
      <tr class='bg-white border-b border-gray-200 align-center'>
        <%= render_cells(row) %>
      </tr>
    <% end %>
  </thead>
</table>
```

The header cell component then defines all the CSS for the header cells:

```erb
<th class="sticky top-0 z-30 opacity-95 bg-gray-100 p-4 text-xs tracking-wide text-left text-gray-600 font-bold uppercase align-top">
  <%= header_cell[:label] %>
</th>
```

With its corresponding Ruby code being:

```ruby
module Zeal
  module Tables
    class HeaderCellComponent < ViewComponent::Base
      attr_reader :header_cell
      def initialize(header_cell:)
        @header_cell = header_cell
      end

    end
  end
end
```

And the body cell component does the same, but for the body cells:

```erb
<td class="p-3 text-sm text-gray-900 whitespace-nowrap" role='cell'>
  <%= column[:block].call(row) %>
</td>
```

With its corresponding code being:

```ruby
module Zeal
  module Tables
    class BodyCellComponent < ViewComponent::Base
      attr_reader :column, :row
      with_collection_parameter :column

      def initialize(column:, row:)
        @column = column
        @row = row
      end
    end
  end
end

```

Each of the body cells knows which column it's going to be rendering, and the block for that column knows which user row it's rendering. This means we can specify both the header for the column and each row inside the same method call:

```
table.column("First Name", &:first_name)
```

If the way to render the value is more complicated, we can pass a block:

```ruby
table.column("First Name") do |user|
  tag.div(class: "text-center") { user.first_name }
end
```

If we need any specific helper for this component, we can define it in the `UserTableComponent` (rather than dumping it into a random file in `app/helpers`!):

```ruby
def status_label(user)
  if user.active?
    Zeal::Tags::SuccessComponent.new(text: "Active")
  else
    Zeal::Tags::DangerComponent.new(text: "Inactive")
  end
end
```

Then to use this component, we can pass the method for the column:

```ruby
table.column("Status", &method(:status_label))
```
