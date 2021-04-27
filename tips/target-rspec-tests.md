---
layout: default
title: Target RSpec tests
---

# Target RSpec tests

You can target a particular RSpec test by line number:

```
rspec spec/models/user.rb:78
```

But you can also target it by example name (including any part of the example, context or description):

```ruby
RSpec.describe User do
  context "admin users" do
    it "are allowed to..." do
      # ...
    end
  end
end
```

```
rspec spec/models/user.rb -e 'admin' # targeting by word in the context
rspec spec/models/user.rb -e 'allowed' # targeting by word in the example
```
