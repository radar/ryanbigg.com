---
wordpress_id: RB-1759618560
layout: post
title: "Hanami for Rails Developers: Part 1: Models"
---

This blog post is part of a series called "Hanami for Rails Developers".

* Part 1: [Models](/2025/10/hanami-for-rails-developers-1-models) (you are here)
<!-- * Part 2: [Controllers](/2025/10/hanami-for-rails-developers-2-controllers) -->

There's plenty of writing out there for _why_ you should use Hanami, and so this post won't cover that. If you want those thoughts, see my [Hanami 2.0 thoughts](https://ryanbigg.com/2022/11/hanami-20-thoughts) and my earlier [thoughts on Hanami](https://ryanbigg.com/2018/03/my-thoughts-on-hanami) posts.

This post covers off how to get started with Hanami, with a focus on those who are familiar with Rails and the MVC structure it provides. I'm unashamedly going to crib parts of this from the [Hanami Getting Started Guide](https://guides.hanamirb.org/v2.3/introduction/getting-started/), but explain them in a different way.

With a Rails app, you'll be familiar with the Model-View-Controller pattern. Hanami has adopted this pattern too, but has a take on it where the concerns are split across more distinct types of classes. This leads to a better separation of concerns and an easier-to-maintain application.

Hanami's layers of separation are designed with the intent of making long-term maintenance of your application easier. The layers that Hanami introduce don't come from nowhere. They come out of decades of professionally building Rails applications and realizing what would make maintenance of those applications easier.

In Part 1 of this series, I'm going to cover off how Hanami applications interact with databases.

## The Model Layer

Whenever you're building a Rails application you typically want to pull data from a data source. When you're building a Hanami application, you'll want to do the same thing. Rather than having one model class to use as a dumping ground, Hanami separates these into a few distinct classes called repositories, relations and structs.

1. **Repositories**: Defines the interactions between your database and your application.
2. **Relations**: Provides a home for your application's complicated queries.
3. **Structs**: Represents rows from your database in plain and simple Ruby objects.

Let's take a look at each of these in turn by creating a table called `books`, and then inserting data into that table, and then requesting that data back out in various ways.

### Migrations

Hanami, like Rails, supports database migrations. To create a migration, we use this command:

```
hanami g migration create_books
```

This migration syntax uses ROM -- Hanami's choice for a database library -- and is currently empty. The migrations in Hanami live in `config/db/migrate`, rather than the `db/migrate` of Rails. The reason for this is that migrations are _configuration for your database_.

Let's see that migration file now in `config/db/migrate`:

```ruby
ROM::SQL.migration do
  # Add your migration here.
  #
  # See https://guides.hanamirb.org/v2.2/database/migrations/ for details.
  change do
  end
end
```

We can fill out this migration to create the `books` table this way.

```ruby
ROM::SQL.migration do
  change do
    create_table :books do
      primary_key :id
      column :title, :text, null: false
      column :author, :text, null: false
    end
  end
end
```

The syntax used here is not too dissimilar to what you'd see in a Rails migration. Notably, we have to include the `primary_key` here, whereas in Rails it comes automatically pre-defined.

We can run this migration with:

```
hanami db migrate
```

With our table now existing in our database, we need something to insert and read data from that table. That "something" is called a relation.

### Relations

We can generate a relation using this command:

```
hanami g relation books
```

Relations in Hanami are pluralised, and match the name of the table. We can use this relation to insert some data by booting up the console:

```
hanami console
```

Hanami provides a _registry_ for our applications classes, and we can use this registry to get the relation:

```ruby
books = app["relations.books"]
```

We'll see this relation is already configured with our database, thanks to some setup taken care of by Hanami. Rails would do the same thing, but calls it `connection` on Active Record models.

```ruby
#<Bookshelf::Relations::Books name=ROM::Relation::Name(books) dataset=#<Sequel::SQLite::Dataset...
```

We can insert a book into our table by running:

```ruby
books.insert(title: "Hanami for Rails Developers", author: "Ryan Bigg")
```

This will simply return `1` as its the ID of the record that was inserted into the database. This may be surprising to Rails developers, who are used to getting instances back straight away from an `insert` request. To get back to the data that's in the database, we can run:

```
book = books.first
```

We will now see the data as a Hash:

```
=> {:id=>1, :title=>"Hanami for Rails Developers", :author=>"Ryan Bigg"}
```

The relation for Hanami works with data in its barest form. We passed a Hash to `insert`, and got one back for `first`. To get back proper Ruby objects, we need a repository.

### Repository

Let's generate a repository for our `books` table now, by exiting our `hanami console` session (with `exit`) then running this:

```
hanami g repo book
```

Repositories in Hanami are singularized, but relations are pluralized. This is because relations are working on your table, which is a collection of data. Repositories on the other hand represent a single type of that data, in this case `Book`. So the repository representing that type is called `BookRepo`.

We can use this repository in the console by jumping back in with `hanami console` and then running:

```ruby
book_repo = app["repos.book_repo"]
```

To fetch the book we inserted, we can run:

```ruby
book_repo.books.first
```

This method calls `books`, which access the matching relation from the repository. Then it calls `first` on that relation.

An interesting thing happens here: this will return a structured version of our data.

```
=> #<Bookshelf::Structs::Book id=1 title="Hanami for Rails Developers" author="Ryan Bigg">
```

We get this ability by using the relation through the repository.

The returned object here has very few methods on it. Just enough methods to represent the data from the row, and that's it.

Calling `book_repo.books.<whatever method>` is going to get old very quickly, and that leads us to the point of repositories. We can provide shorter methods by adding them to our repository. Let's add a `find` and an `all` method to our repository, over in `app/repos/book_repo.rb`:

```ruby
module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      def find(id)
        books.by_pk(id).one
      end

      def all
        books.to_a
      end
    end
  end
end
```

This method can then be used to find our book based on the table's primary key. Let's exit the console, start it again and try that now:

```ruby
book_repo = app["repos.book_repo"]
book = book_repo.find(1)
```

We'll get back our book, all without having to type `where` + `first`.

```
=> #<Bookshelf::Structs::Book id=1 title="Hanami for Rails Developers" author="Ryan Bigg">
```

We can also retrieve all of our books by using `all`:

```
books = book_repo.all
=> [#<Bookshelf::Structs::Book id=1 title="Hanami for Rails Developers" author="Ryan Bigg">]
```


### Scoping queries

To further demonstrate what a repository and relation do within a Hanami application, we're now going to perform an action that would be common to a lot of Rails applications: adding a `by_year` scope to our queries. In Rails, we would add this to a model with this code:

```ruby
scope :by_year, ->(year) { where(year: year) }
```

This defines a method on the model within Rails. The approach in Hanami is very similar, but instead of defining the method on the model, we define it on the repository. Before we can perform queries against a year column, let's add it with one more migration. We'll create this migration with:

```
hanami g migration add_year_to_books
```

We'll open up that new migration file in `config/db/migrate` and fill it out this way:

```ruby
ROM::SQL.migration do
  change do
    add_column :books, :year, :integer
  end
end
```

Let's run this migration with:

```
hanami db migrate
```

Now that we have a `year` column, let's open up `app/repos/book_repo.rb` and define a method to find books matching a particular year:

```ruby
def by_year(year)
  books.where(year: year)
end
```

This code can allow us to call `book_repo.by_year(2025)` to get all the books from the year 2025.

As you can see by these `find` and `by_year` methods, we define the methods to interact with our database as we need them within a Hanami application.

Let's add one more of these to find by the author as well:

```ruby
def by_author(author)
  books.where(author: author)
end
```

If we do `book_repo.by_author("Ryan Bigg")` in our console, we'll get back the book we added earlier on.

Now what about if we wanted to chain these `by_author` and `by_year` methods together by calling:

```ruby
book_repo.by_year(2025).by_author("Ryan Bigg")
```

Well, if we try that out now, we'll get an error:

```ruby
(irb):2:in `<main>': undefined method `by_author' for #<Bookshelf::Relations::Books
```

This is because the object returned by `by_year` is an instance of the relation itself. If we want to chain these methods, we need to add them to the relation, and not to the repository. Let's create similar methods over in `app/relations/books.rb` now:

```ruby
def by_year(year)
  where(year: year)
end

def by_author(author)
  where(author: author)
end
```

We can now use these methods, rather than defining the same logic again, back in the repository. Let's change the code there in `app/repos/book_repo.rb` to this:

```ruby
def by_year(year)
  books.by_year(year)
end

def by_author(author)
  books.by_author(author)
end
```

By moving these methods over to the relation, we should now be able to chain them together. Let's reload the console and try again:

```ruby
book_repo = app["repos.book_repo"]
book_repo.by_year(2025).by_author("Ryan Bigg")
```

What we get back here is a new instance of `Bookshelf::Relations::Books`, because we haven't asked this relation to do any more than to generate us a query based on books for a particular year and author. At this point, we _could_ throw some more `where` clauses onto the end if we wanted to further scope the data.

We can trigger a query to run by asking this for the _first_ book.

```ruby
book_repo = app["repos.book_repo"]
book_repo.by_year(2025).by_author("Ryan Bigg").first
```

This returns nothing! This is because there is no book with that year in our dataset, we only created a book with a title and an author, not a year. We can update our record to have a year by running:

```ruby
book_repo.books.where(id: 1).update(year: 2025)
```

Instead of doing a `find` then an `update` like you might in a Rails app, we're doing only an update. That's all we need to do here. Let's try running that query again to get the first book:

```ruby
book_repo = app["repos.book_repo"]
book_repo.by_year(2025).by_author("Ryan Bigg").first
=> #<Bookshelf::Structs::Book id=1 title="Hanami for Rails Developers" author="Ryan Bigg" year=2025>
```

Great!

As we can see from this "Model Layer" section of this guide, Hanami provides three distinct layers of separation here:

1. **Repositories**: Defines the interactions between your database and your application.
2. **Relations**: Provides a home for your application's complicated queries.
3. **Structs**: Represents rows from your database in plain and simple Ruby objects.

Rails would have you throw all of this into the one class (a model), leading to quite a lot of mess and making things harder to read. Hanami's separation is initially disorienting (which file was that code in?) but after a few days that disorientation will wear off!
