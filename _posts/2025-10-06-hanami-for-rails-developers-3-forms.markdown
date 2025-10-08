---
wordpress_id: RB-1759704100
layout: post
title: "Hanami for Rails Developers: Part 3: Forms"
---

This blog post is part of a series called "Hanami for Rails Developers".

* Part 1: [Models](/2025/10/hanami-for-rails-developers-1-models)
* Part 2: [Controllers](/2025/10/hanami-for-rails-developers-2-controllers)
* Part 3: [Forms](/2025/10/hanami-for-rails-developers-3-forms) (you are here)

In the first two parts of this guide, we covered off the familiar concepts of models and controllers, and saw how Hanami approached these designs. We saw that Hanami split the responsibilities of models between **repositories**, **relations** and **structs**, and we saw that the responsibilities of a controller and its views were split between **actions**, **views** and **templates**.

In this part, we're going to continue building on our application's foundation by introducing a form that lets us add further books to our application. In a Rails app, we would handle this by adding a `new` and `create` action to our controller. You'll see that Hanami isn't much different here when it comes to that.

We'll be building out the `new` and `create` actions for books in this section, seeing how we can create books by using our existing `BookRepo` class. We'll also see how to add validations to our data in this chapter, not on the repository itself, but in the action.

Let's get stuck in.

### The New Book Form

The first thing that we'll create for this new book form is an action, which we can do with:

```
hanami g action books.new
```

We'll change the route generated from this action to have a name that we can use later on. Let's change `config/routes.rb`:

```ruby
get "/books/new", to: "books.new", as: :new_book
```

We can then route to this page by updating our template at `app/templates/books/index.html.erb`. We'll add a link to this page just under the header on that page:

```erb
<h1>Books</h1>

<%= link_to "New Book", routes.path(:new_book) %>
```

This link will take us over to the new book view, which we'll now need to fill out. The template for that view exists at `app/templates/books/new.html.erb`:

```erb
<h1>New Book</h1>

<%= form_for :book, routes.path(:create_book) do |f| %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label :author %>
    <%= f.text_field :author %>
  </div>
  <div>
    <%= f.label :year %>
    <%= f.number_field :year %>
  </div>
  <div>
    <%= f.submit "Create Book" %>
  </div>
<% end %>
```

This `form_for` helper looks a lot like Rails' own, but varies in that it takes positional arguments, rather than keyword arguments. The first argument dictates the naming of the parameters that this form will submit. This means everything will be sent to action under `params[:book]`. The second parameter is the route to create a book, which does not yet exist.

Let's create that action and subsequent route now:

```
hanami g action books.create
```

We'll change the route to have a name by updating the line in `config/routes.rb` to this:

```
post "/books", to: "books.create", as: :create_book
```

After adding this route, our form will now be able to render and display:

![New book](/images/hanami/new_book.jpg)

Next up, we need to give this form somewhere to submit to. To work with what this form submits, we'll update the `books.create` action code in `app/actions/books/create.rb`:

```ruby
# frozen_string_literal: true

module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        include Deps["repos.book_repo"]

        def handle(request, response)
          book = book_repo.create(request.params[:book])
          response.flash[:success] = "Book created successfully"

          response.redirect_to routes.path(:book, id: book.id)
        end
      end
    end
  end
end
```

You'll notice that this action is a lot like a regular `create` action within Rails, with a few clear differences. In the Hanami action, we're pulling `params` from `request`, as we did in the last part with the `year` parameter. We're also working with the `response` object here, setting the flash and `redirect_to` specifically on those objects.

To use `flash` within a Hanami application, we need to add session support to the application. Hanami applications don't come with this enabled by default, because they may instead be used in an API-only context. To add this session support, we'll go to Hanami's application configuration file, `config/app.rb`, and add this line:

```ruby
require "hanami"

module Bookshelf
  class App < Hanami::App
    config.sessions = :cookie, { secret: "your_secret_key_goes_here" }
  end
end
```

With the session support added, our flash message will be stored correctly. But we're currently not _displaying_ that flash message anywhere! In a Rails application you would put this kind of thing in `app/views/layouts/application.html.erb`. Hanami has a different path, which is `app/templates/layouts/app.html.erb`. Let's add the flash there just under the `<body>` tag:

```erb
<% if flash[:success] %>
  <div class="flash flash-success"><%= flash[:success] %></div>
<% end %>
```

Now that we've setup the rendering of our flash message, there's one final piece we need to do. Our `BookRepo` doesn't know how to create a book. We can add this feature to `BookRepo` by adding this line:

```ruby
module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      commands :create
```

The `commands` method comes from the ROM series of gems, that Hanami uses under-the-hood as its persistence layer. ROM provides some simple commands that reproduce common behaviour, and `create` is one of these.


That'll be all we need to create a new book now. When we try out the form now, we'll see that a book can be created:

![Created book](/images/hanami/created_book.jpg)

### Adding validations

Now that we've got the happy path working for creating a book, let's work on adding some validations to this form so that books can no longer be submitted without an author or title.

To add validations in an Hanami application, we add them to the action that processes the parameters, which would be the `Books::Create` action in our app. Let's add this validation to `app/actions/books/create.rb` now:

```ruby
module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        include Deps["repos.book_repo"]

        params do
          required(:book).schema do
            required(:title).filled(:string)
            required(:author).filled(:string)
            optional(:year).maybe(:integer)
          end
        end

        # ...
```

This syntax uses another gem from the same organisation as Hanami called [`dry-schema`](https://dry-rb.org/gems/dry-schema/1.5/). It validates our parameters when we take them in, rather than throwing yet another responsibility into the model class.

This syntax validates that `title` and `author` are both filled in, and must be a string. It also validates `year`, but only that if it's provided it's going to be an integer, rather than any other type.

On top of this, our parameters are now restricted to accepting only those specified in this set. This syntax both provides the same style of validation that `validates presence: true` would provide in a Rails model, and _also_ the same features that `strong_parameters` (`params.require(:book).permit(:title, ...)`) would in a Rails application. Our validation logic now sits in one place, the action, rather than across two different places.

Next up, we'll need to have the behaviour of this `create `action do different things depending on if the parameters are valid or not. Let's update this action to do that now. We'll change the `handle` method of this action to this:

```ruby
def handle(request, response)
  unless request.params.valid?
    response.flash.now[:error] = "Your book could not be created"
    response.render(new_view,
      errors: request.params.errors[:book].to_h
    )

    return
  end

  book = book_repo.create(request.params[:book])
  response.flash[:success] = "Book created successfully"

  response.redirect_to routes.path(:book, id: book.id)
end
```

This action now checks to see if the parameters passed in are valid or not. If they're not, we'll display a flash message and render the new view, passing it the errors from the validation. If the parameters _are_ valid, then we go ahead with the action as before.

Our new code refers to something called `new_view`, which we don't have yet. To get that, we need to bring that in as a dependency at the top of this class:

```ruby
include Deps["repos.book_repo"]
include Deps[new_view: "views.books.new"]
```

When we import dependencies in Hanami, it will use the last part of the name as the name for the method that becomes available to refer to that dependency. We can pick a different name here, by using Hash syntax where the key is the name we want, and the value is the dependency. If we didn't give this dependency a different name in this case, we would have to refer to it as `new`, which is confusing to see by itself.

When the form fails validation, we'll re-render the `new` action passing it errors. If we want to display those errors in the template, we'll need to expose them from the action. Let's go to `app/actions/books/new.rb` and add an `expose` for that:

```ruby
# frozen_string_literal: true

module Bookshelf
  module Views
    module Books
      class New < Bookshelf::View
        expose :errors
      end
    end
  end
end
```

To display these errors at the top of the form, we'll put this code into `app/templates/books/new.html.erb`:

```erb
<h1>New Book</h1>

<% if errors %>
  <div id="error_explanation">
    <h2>Your book could not be created:</h2>
    <% errors.each do |field, field_errors| %>
      <p><%= inflector.humanize(field) %> <%= field_errors.join(", ") %></p>
    <% end %>
  </div>
<% end %>
```

We can use `errors` here as we've exposed them from the view. We then iterate through them, using Hanami's built in `inflector` to turn these field names into something human-readable. They would be `title` and `author`, but they're now `Title` and `Author`. It's not much, but it'll do the job.

If we attempt to fill out the book form now, but leave either title or author blank, we'll see errors:

![Invalid book](/images/hanami/invalid_book.jpg)

And if we fill out those fields, we'll see that we've successfully created a book.

### Edit Form

Now that we're able to create a book, we're going to want to continue on completing the set of all the RESTful actions, including editing and updating. So let's see what it's going to take to do this in Hanami. Just like we did for the `new` and `create` actions, we're going to need to generate the pair of actions for `edit` and `update`. Let's run the generator now for both of them:

```
hanami g action books.edit
hanami g action books.update
```

After generating these actions, we'll give their routes names so that we can refer to them later. Let's go into `config/routes.rb` and update the last two lines to this:

```ruby
get "/books/:id/edit", to: "books.edit", as: :edit_book
patch "/books/:id", to: "books.update", as: :update_book
```

To be able to navigate to the edit page, we'll add a small link in our `show` template using this `edit_book` path, at `app/templates/books/show.html.erb`:

```erb
<h1><%= book.title %></h1>

<%= link_to "Edit", routes.path(:edit_book, id: book.id) %>
```

Now it's time for the edit view itself. We have a perfectly good form over in `app/templates/books/new.html.erb`, and the way we would share this form in a Rails application between a `new` and `edit` view is to turn it into a partial. Hanami has the same style of support too! So we can move all of this code out of the `new` template, and into a new template at `app/templates/books/_form.html.erb`:

```erb
<% if errors %>
  <div id="error_explanation">
    <h2>Your book could not be created:</h2>
    <% errors.each do |field, field_errors| %>
      <p><%= inflector.humanize(field) %> <%= field_errors.join(", ") %></p>
    <% end %>
  </div>
<% end %>

<%= form_for :book, routes.path(:create_book) do |f| %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label :author %>
    <%= f.text_field :author %>
  </div>
  <div>
    <%= f.label :year %>
    <%= f.number_field :year %>
  </div>
  <div>
    <%= f.submit "Create Book" %>
  </div>
<% end %>

```

Then in our `app/templates/books/new.html.erb` file, we can render this same content with:

```
<%= render "form", errors: errors %>
```

The `render` method here takes in the name of the partial and then any local variable we would like to make available to that partial.

We'll now update our `app/templates/books/edit.html.erb` to use this same template:

```erb
<h1>Editing a book</h1>

<%= render "form", errors: nil %>
```

We're leaving out `errors` here for the moment, as we haven't gotten to implementing that part just yet.

When we're rendering this form, we would like the fields to be automatically populated with what's in the database. To do this, we need to load the book from the database and to load the book we'll need the parameter to be passed in from the action. Let's set that up now in `app/actions/books/edit.rb`:

```ruby
module Bookshelf
  module Actions
    module Books
      class Edit < Bookshelf::Action
        def handle(request, response)
          response.render(view, id: request.params[:id])
        end
      end
    end
  end
end
```

With the parameter passed in, we can now proceed with loading the book over in `app/views/books/edit.rb`:


```ruby
module Bookshelf
  module Views
    module Books
      class Edit < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :book do |id:|
          book_repo.find(id)
        end
      end
    end
  end
end
```

We load the book by bringing in the `book_repo` dependency, and using the `find` method on that to load the book, pulling the `id` parameter out of the block argument for `expose`. Because this `expose` shares a name with the first argument to `form_for`, it will populate the form automatically. If we go to http://localhost:2300/books/1/edit, we'll see the form is populated:

![Editing a book](/images/books/editing_book.jpg)

There's an issue with the form at the moment that if we submit it, it's going to create a duplicate of the book that we've got there rather than updating the existing book. This is because in the `app/templates/books/_form.html.erb` partial, we're telling the form the route is this:

```erb
<%= form_for :book, routes.path(:create_book) do |f| %>
```

The form partial needs to understand that we want to go to different actions, depending on how it's being rendered. Rails has some smarts in it to determine the route based on if the record is either new or persisted. Hanami does not have these smarts in it (yet). So we have to be the smart ones instead.

We'll change how we render this form partial in `app/templates/books/edit.html.erb` to this:

```erb
<%= render "form",
  book: book,
  path: routes.path(:book, id: book.id),
  form_type: :update
%>
```

This passes in two other local variables that we'll use to determine where to take the form. While we're making this change for edit, we'll also make the change for the `new` template too:

```erb
<%= render "form",
  book: book,
  errors: errors,
  path: routes.path(:create_book)
  form_type: :create
%>
```

Now that we're passing these through to the partial, we'll update the partial to handle both `path` and `form_type` by changing `app/templates/books/_form.html.erb` to this:

```erb
<% if errors %>
  <div id="error_explanation">
    <h2>Your book could not be <%= form_type == :create ? "created" : "updated" %>:</h2>
    <% errors.each do |field, field_errors| %>
      <p><%= inflector.humanize(field) %> <%= field_errors.join(", ") %></p>
    <% end %>
  </div>
<% end %>

<%= form_for :book, path, method: form_type == :create ? :post : :patch do |f| %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label :author %>
    <%= f.text_field :author %>
  </div>
  <div>
    <%= f.label :year %>
    <%= f.number_field :year %>
  </div>
  <div>
    <%= f.submit form_type == :create ? "Create Book" : "Update Book" %>
  </div>
<% end %>
```

The three changes here are:

1. Changing the errors box to say "Your book could not be created/updated"
2. Changing the path and the method of the form based on `form_type`
3. Changing the wording of the submit button based on `form_type`.

This will set up the form partial when rendered by the `edit` view to submit to the `update` action, while still maintaining its ability to submit to the `create` view when rendered by the `new` view.

Speaking of `update` actions, let's write one now in `app/actions/books/update.rb`. We'll start by including the book repo as a dependency and defining the parameters that our request will work with:

```ruby
module Bookshelf
  module Actions
    module Books
      class Update < Bookshelf::Action
        include Deps["repos.book_repo"]

        params do
          required(:id).filled(:integer)
          required(:book).schema do
            required(:title).filled(:string)
            required(:author).filled(:string)
            optional(:year).maybe(:integer)
          end
        end
      end
    end
  end
end
```

These parameters are the same as from the `create` action with one exception: we now need to _also_ take in the `id` parameter. If we were to leave that out of the `params` specification here, we couldn't access it within our action as it wouldn't have been in the permitted set of parameters for this action.

With the parameters defined, we can now write the `handle` method:

```ruby
def handle(request, response)
  unless request.params.valid?
    response.flash.now[:error] = "This book could not be updated"
    response.render(edit_view,
      id: request.params[:id],
      errors: request.params.errors[:book].to_h,
    )

    return
  end

  book_repo.update(request.params[:id], request.params[:book])
  response.flash[:success] = "Book updated successfully"

  response.redirect_to routes.path(:book, id: request.params[:id])
end
```

This action works similarly to `create`, except we're going to be updating a book rather than creating it. We're referring to `edit_view` here, but we haven't yet defined that. Let's import that as well at the top of this action:

```ruby
include Deps[edit_view: "views.books.edit"]
```

To make the `book_repo` accept a call to `update`, we'll need to add a command to `app/repos/book_repo.rb`:

```ruby
module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      commands :create, update: :by_pk
```

This command takes a second argument to determine which method from the `books` relation to use when looking up a book to update.

That'll handle the successful flow of updating our book, but we also need to pay attention to the unsuccessful flow as well. The `edit` view will receive `errors`, which it will need to expose. Let's update `app/actions/books/edit.rb` to this:

```ruby
module Bookshelf
  module Views
    module Books
      class Edit < Bookshelf::View
        include Deps["repos.book_repo"]
        expose :errors

        expose :book do |id:|
          book_repo.find(id)
        end
      end
    end
  end
end
```

This will take in the errors from the re-rendering of this view from a failed `update`, and render a form with the errors.

If we attempt to update a book correctly now, we'll see it works:

![Updated book](/images/hanami/updated_book.jpg)

And if we attempt to update it with invalid data, it will fail:

![Updated book errors](/images/hanami/book_update_error.jpg)
