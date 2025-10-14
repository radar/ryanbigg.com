---
wordpress_id: RB-1760298473
layout: post
title: "Hanami for Rails Developers: Part 4: Associations"
---

* Part 1: [Models](/2025/10/hanami-for-rails-developers-1-models)
* Part 2: [Controllers](/2025/10/hanami-for-rails-developers-2-controllers)
* Part 3: [Forms](/2025/10/hanami-for-rails-developers-3-forms)
* Part 4: [Associations](/2025/10/hanami-for-rails-developers-4-associations) (you are here)

In the first three parts of this guide, we set about building up a way that works with a table called `books` to display these records through some controller actions, and to allow us to create more and edit them in forms.

In this part, we're going to cover how we can set up an association to books called `reviews`. We'll create a new table for this, and work out how to display reviews next to books on the `books.show` page. In this part, we'll be spending a lot of time working back on our repositories and relations.

### Creating the table

To get started, we first need to create a table called `reviews`. We can do this by generating a migration:

```
hanami g migration create_reviews
```

In that new migration under `config/db/migrate`, we'll change the code in that new file to create this new table:

```rb
ROM::SQL.migration do
  change do
    create_table :reviews do
      primary_key :id
      foreign_key :book_id, :books, null: false, on_delete: :cascade
      String :content, null: false
      Integer :rating, null: false
      DateTime :created_at, null: false, default: Sequel::CURRENT_TIMESTAMP
    end
  end
end
```

This table will have all the columns you'd expect to have for a review, minus a user association. We don't want to get too carried away at the moment!

We can run this migration with:

```
hanami db migrate
```

### Review relation

Next, we need to create the classes within our application that we'll use to manage these records in the table. The first of these that we'll need is a relation so that we can query that table. We'll generate one with this command:

```
hanami g relation reviews
```

Let's see how we can create a new review with this relation by booting into the console:


```
hanami console
```

Once we're in this console, we will load the relation with:

```ruby
reviews = app["relations.reviews"]
```

To insert a new review, we'll run this code:

```ruby
reviews.insert(
  book_id: 1,
  content: "I now finally understand Hanami!",
  rating: 5
)
```

This'll return simply `1`, indicating the ID of the record that we saved.

Now how would we return the reviews for a book? Well, we can simply ask for them:

```ruby
reviews.where(book_id: 1).to_a
```

However, we're going to want to display these reviews on a book's page eventually. In a Rails app it would be a simple matter of `book.reviews`. However in a Hanami application, the `book` object in question would be a simple struct with no association methods defined on it. This is by design, to remove a very large footgun in the shape of N+1 queries that are a bugbear of any Rails developer. In a Hanami application, it is impossible to do an N+1 query.

### Loading a book and its reviews

Hanami has a way of loading both the book _and_ its reviews together. We're now going to set this up, by first defining an association between books and reviews over in `app/relations/books.rb`. We define associations in Hanami by changing the `schema` call at the top of this file to this block form:

```ruby
module Bookshelf
  module Relations
    class Books < Bookshelf::DB::Relation
      schema :books, infer: true do
        associations do
          has_many :reviews
        end
      end
      # ...
```

This defines the association, but doesn't tell us much about how to use it. Fortunately, there's this guide for that.

If we exit out of our Hanami console and reload back into it, we can now use this association. First we'll load the `books` relation:

```ruby
books = app["relations.books"]
```

Then we can load the first book _and_ all its reviews by using a method called `combine`:

```ruby
books.by_pk(1).combine(:reviews).first
```

This will now return a hash of all the data for both the book and its reviews:

```ruby
{:id=>1,
 :title=>"Hanami for Rails Developers",
 :author=>"Ryan Bigg",
 :year=>2027,
 :reviews=>[
  {
    :id=>1,
    :book_id=>1,
    :content=>"I now finally understand Hanami!",
    :rating=>5,
    :created_at=>2025-10-13 07:19:48 +1100
  }
  ]
}
```

ROM will do this by running first a query to load the book:

```
SELECT `books`.`id`, `books`.`title`, `books`.`author`, `books`.`year`
FROM `books` WHERE (`books`.`id` = 1) ORDER BY `books`.`id`
```

Then another query to load the reviews:

```
SELECT `reviews`.`id`, `reviews`.`book_id`, `reviews`.`content`, `reviews`.`rating`, `reviews`.`created_at`
FROM `reviews`
INNER JOIN `books` ON (`books`.`id` = `reviews`.`book_id`)
WHERE (`reviews`.`book_id` IN (1))
ORDER BY `reviews`.`id`
```


In a Hanami application, we load all the data we need up front, rather than letting method calls way down in the view template dictate what queries are run. This way, there's no surprises like N+1 queries.

This combination can be setup to happen the other way as well. When we define an association from review to book, over in `app/relations/reviews.rb`:

```ruby
module Bookshelf
  module Relations
    class Reviews < Bookshelf::DB::Relation
      schema :reviews, infer: true do
        associations do
          belongs_to :book
        end
      end
    end
  end
end
```

With this association defined, we'll be able to load a review and its associated book:

```ruby
reviews = app["relations.reviews"]
reviews.by_pk(1).combine(:book).first
```

This code will return all the information about a review and its book:

```ruby
{:id=>1,
 :book_id=>1,
 :content=>"I now finally understand Hanami!",
 :rating=>5,
 :created_at=>2025-10-13 07:19:48 +1100,
 :updated_at=>2025-10-13 07:19:48 +1100,
 :book=>{
   :id=>1,
   :title=>"Hanami for Rails Developers",
   :author=>"Ryan Bigg",
   :year=>2027}
 }
```

If we go back to the "book and its reviews" method, we can expose this method to our application through our `BookRepo` by defining this method in `app/repos/book_repo.rb`:

```ruby
def find_with_reviews(id)
  books.by_pk(id).combine(:reviews).one!
end
```

When we go to load a book in our application, we could now use `find_with_reviews` to load that book and its reviews. We can do this in our `show` view by changing the code in `app/views/books/show.rb` to this:

```ruby
# frozen_string_literal: true

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :book do |id:|
          book_repo.find_with_reviews(id)
        end
      end
    end
  end
end
```

In the matching template, it then becomes a cinch to iterate through the reviews. We can do this by updating `app/templates/books/show.html.erb` to contain this new code:

```erb
<h2>Reviews</h2>

<% reviews.each do |review| %>
  <%= review.class %>
  <p>
    <strong><%= review.rating %> / 5 </strong>
    <%= review.content %>
  </p>
<% end %>
```

### A more complicated query

Defining a `has_many` or `belongs_to` association feels like table stakes for a web app these days. Let's look at something more complicated than this to round out the end of this guide. Let's say that we want to add a few methods to find:

1. Books that are well-reviewed (>= 10 reviews)
2. Books that have an average review rating above 3
3. Books that have an average review rating below 2

In a Rails application for the 1st of these queries we would write something like this:

```ruby
Book
  .joins(:reviews)
  .group(:id)
  .having('COUNT(reviews.id) >= 10')
```

This will generate a query with an `INNER JOIN` between the `books` and `reviews` table, with a `GROUP` statement on `books.id`, and a `HAVING` statement that uses the raw SQL we've passed in.

In a Rails app, we would add this code to our model. But in a Hanami application we'll have to do this on our relation. Let's define a method in `app/relations/books.rb` for this now:

```ruby
def popular
  join(:reviews)
    .group(:id)
    .having { count(reviews[:id]) >= 10 }
end
```

The syntax provided by Sequel isn't too much different, until we get to the final line. There we evaluate a block passed into `having`, and we're able to use the `reviews` relation from within our books relation. Instead of writing raw SQL, the underlying Sequel gem provides us a clean Ruby syntax to use instead.

We _could_ still write the `having` statement with raw SQL, but we'd have to call that out explicitly with `Sequel.lit`:

```ruby
join(:reviews)
  .group(:id)
  .having(Sequel.lit("count(reviews.id) > 10"))
```

This syntax is slightly longer than the Ruby version, and a bit more punctuation-heavy too. It's for this reason that I try to opt for the Ruby syntax when I can find a Sequel version of that.

If we run `hanami console`, we can then use this new method:

```ruby
books = app["relations.books"]
books.popular
```

This will show the query it could run:

```sql
SELECT `books`.`id`, `books`.`title`, `books`.`author`, `books`.`year`
FROM `books`
INNER JOIN `reviews` ON (`books`.`id` = `reviews`.`book_id`)
GROUP BY `books`.`id`
HAVING (count(`reviews`.`id`) >= 10)
ORDER BY `books`.`id`
```

This looks great! We don't have enough reviews for this method at the moment. We can create a few:

```
10.times { reviews.insert(rating: 5, content: "Great!", book_id: 1) }
```

And now if we ask for the popular book, we'll see it's returned:

```ruby
books.popular.first
```

This gives us:

```
=> {:id=>1, :title=>"Hanami for Rails Developers", :author=>"Ryan Bigg", :year=>2027}
```


We've got the first method added, now let's look at finding books where the review average rating is above a 3:

```ruby
def liked
  join(:reviews)
  .group(:id)
  .having { avg(reviews.rating) > 3 }
end
```

This time we use an `avg` method to generate an `AVG` aggregation query for our reviews. Let's exit the `hanami console` and restart it again to pick up this new method. Now we'll try to use it:

```ruby
books = app["relations.books"]
books.liked
```

This will show us this query:

```sql
SELECT `books`.`id`, `books`.`title`, `books`.`author`, `books`.`year`
FROM `books`
INNER JOIN `reviews` ON (`books`.`id` = `reviews`.`book_id`)
GROUP BY `books`.`id`
HAVING (avg(`reviews`.`rating`) >= 3)
ORDER BY `books`.`id`
```

That looks great! How about we get both `popular` and `liked` books?

```
books.popular.liked
```

This time the query is:

```sql
SELECT `books`.`id`, `books`.`title`, `books`.`author`, `books`.`year`
FROM `books`
INNER JOIN `reviews` ON (`books`.`id` = `reviews`.`book_id`)
INNER JOIN `reviews` ON (`books`.`id` = `reviews`.`book_id`)
HAVING ((count(`reviews`.`id`) >= 10) AND (avg(`reviews`.`rating`) >= 3))
ORDER BY `books`.`id`
```

No, you're not having vision issues, there are indeed _two_ joins to reviews! This is because both of our methods tell the relation to join the reviews table. If we attempt to run this query, SQL will be unable to disambiguate between which `reviews` table we mean.

What do we do in these situations, then? Well, we add a _third_ method that does the join first:

```ruby
def with_reviews
  join(:reviews)
    .group(:id)
end

def popular
  join(:reviews).having { count(reviews[:id]) >= 10 }
end

def liked
  join(:reviews).having { avg(reviews[:rating]) >= 3 }
end
```

Now this will mean we'll be able to call `books.with_reviews.popular` to get the popular books, and `books.with_reviews.liked` to get the liked books, and then `books.with_reviews.popular.liked` to get the popular liked books!

Before we move on from here, we can add our other method to find the books with low-scoring reviews:

```ruby
def disliked
  join(:reviews).having { avg(reviews[:rating]) >= 2 }
end
```

This syntax with `with_reviews` is going to be a mouthful. Fortunately, we can provide a clean interface by exposing these methods through our `BookRepo` class back to our application. Let's add in a few methods in `app/repos/book_repo.rb`

```ruby
def with_reviews
  books.with_reviews
end

def popular
  with_reviews.popular
end

def popular_and_liked
  with_reviews.popular.liked
end

def popular_and_disliked
  with_reviews.popular.disliked
```

Our repository is now going to provide a cleaner facade back to our application, so that we can make calls such as `book_repo.popular` to get back a list of popular books, and the repo will take care of the `with_reviews` joining.

We can see here with the code in the relation and repository that the relation is taking care of the messy SQL-adjacent code, while the repository is using the methods of the relation to then provide a cleaner interface back up to the application.
