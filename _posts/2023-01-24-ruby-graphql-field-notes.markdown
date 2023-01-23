---
wordpress_id: RB-1674501531
layout: post
title: Ruby GraphQL field notes
---

Here's a series of my notes of working within a GraphQL application as I can think of them. This comes out of my work on [Twist's GraphQL API](https://github.com/radar/twist-v2/blob/master/backend/lib/twist/web/graphql/schema.rb), and other GraphQL APIs that are deployed in production.

Overall sentiment is that GraphQL is an improvement over the classic REST approach because:

1. It gives you clear types of fields
2. You can choose which fields you wish to select
3. You can choose to select from a single resource, or from multiple, disparate resources at the same time.

I like its interoperability between Ruby and JavaScript, with good tooling existing on both sides of that divide in the [GraphQL Rubygem](https://rubygems.org/gems/graphql) and the [Apollo Client](https://www.apollographql.com/docs/react/get-started/) on the JavaScript side of things. Honorable mention to the [GraphQL codegen](https://the-guild.dev/graphql/codegen) library too, which provides the ability of generating TypeScript types from a GraphQL schema.

## Schema definition

A schema can be defined in `app/graphql` in a Rails application (since its _application_ code), or a directory of your choosing in any other Ruby project.

I'd recommend disabling the introspection endpoints here so that 3rd parties cannot find out that your API contains particular admin-only endpoints. I'd also recommend setting up a `max_complexity` and a `max_depth` value. This prevents API requests from recursively requesting data (think post -> comments -> post -> ...), and from also building queries that might rate as "highly complex" database operations. You can read more about [complexity and depth here](https://graphql-ruby.org/queries/complexity_and_depth).

```ruby
class AppSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
  disable_introspection_entry_points unless Rails.env.development?

  max_complexity 200
  max_depth 20
end
```


## Schema dumping from Ruby

On that topic, the Ruby library provides the ability to dump the schema out with a custom Rake task (that I've put in `lib/tasks/graphql.rake`)

```ruby
require "graphql/rake_task"

GraphQL::RakeTask.new(
  schema_name: "AppSchema",
  directory: "./app/javascript/graphql",
  dependencies: [:environment]
)
```

Running this Rake task:


```
bundle exec rake graphql:schema:dump
```

Will generate two files, a `schema.json` and a `schema.graphql`, which are both representations of the _shape_ of the GraphQL API. Different tools (such as GraphQL codegen) can then use this schema to work with the GraphQL API.

## Queries and Resolvers

The GraphQL Ruby library [recommends](https://graphql-ruby.org/fields/introduction.html) defining the fields and their resolvers within the same class:

```ruby
module Twist
  module Web
    module GraphQL
      class QueryType < ::GraphQL::Schema::Object
        field :books, [Types::Book], null: false

        def books
          ...
        end
      end
    end
  end
end
```

I feel like this gets messy particularly quickly if your types have a large (> 5) amount of fields.

For top level fields like this, I would recommend defining separate resolver classes:

```ruby
field :books, [Types::Book], null: false, resolver: Resolvers::Books
```

```ruby
module Twist
  module Web
    module GraphQL
      module Resolvers
        class Books < Resolver
          def resolve
            ...
          end
        end
      end
    end
  end
end
```

This allows for you to have potentially complex logic for resolution separate from the field definitions, allowing you to read _what_ fields are defined by looking at the type, rather than reading _what_ the fields are and _how_ they're also implemented.

If we had a resolver for a book chapter, then I'd put that class under `Resolvers::Books::Chapters` to indicate that it's not resolving _all_ chapters, but rather chapters for a particular book.

## Mutations

Along similar lines to queries and resolvers, I also suggest using separate classes for mutations, namespacing them down the lines of the particular _context_ of the application (`Mutations::Users::Login`), or at least along the lines of the resource thats undergoing mutation:

```ruby
field :add_comment, mutation: Mutations::Comments::Add
```

## Union types

Occassionally, it can be helpful to return one or another type from a GraphQL query or a mutation. For this, GraphQL has _union types_.

```ruby
module Twist
  module Web
    module GraphQL
      module Types
        class BookPermissionCheckResult < BaseUnion
          description "The result from attempting a login"
          possible_types Types::Book, Types::PermissionDenied

          def self.resolve_type(object, _context)
            if object.is_a?(Twist::Entities::Book)
              Types::Book
            else
              Types::PermissionDenied
            end
          end
        end
      end
    end
  end
end
```


This type is used in the `book` field:

```ruby
field :book, Types::BookPermissionCheckResult, null: false, resolver: Resolvers::Book
```

If the resolver returns a `Twist::Entities::Book` instance, then this union type will use the GraphQL class `Types::Book` to resolve this field. Otherwise, it uses `Types::PermissionDenied`.

In the client-side GraphQL query, utilising these union types looks like this:

```gql
query {
  book(permalink: "exploding-rails") {
    __typename
    ... on Book {
      id
      title
      defaultBranch {
        name
        chapters(part: FRONTMATTER) {
          ...chapterFields
        }
      }
    }

    ... on PermissionDenied {
      error
    }
  }
}
```

The query uses the GraphQL `__typename` to return the type of the `book` field. We can then read this type on the client side to determine how to act (to show a book, or not). The fields selected within both branches of this union allow us to display information about a book if the query has gone through successfully, without having to first check for permission, and then querying for a book.

The `resolve_type` method from union classes can also return an _array_:

```ruby
def self.resolve_type(object, _context)
  if object.success?
    [Types::BookType, object.success]
  else
    [Types::PermissionDenied, object.failure]
  end
end
```

This is helpful if we wish to do something with the object being resolved. In this case, we're unwrapping that `object` from a `Dry::Result` wrapping. If we did not do this unwrapping, then the `BookType` type would not be able to work on the object it receives, as the wrapped `Dry::Result` object does not have the `title` that `Types::Book` would expect that object to have.

## Authentication

To authenticate against the GraphQL API, I'd recommend supporting sessions as well as authentication by tokens. While requests may come into the application from the same domain, they also may not. Allowing that flexibility of your API to be queryable by a 3rd party from the outset (assuming they have the right token!) can only be a good thing. It will also allow you to make requests from within tests by providing a token.

You can do this with something like the following code:

```ruby
  def current_user

    @current_user = super
    @current_user ||= User.authenticate_by_token(request.authorization)
  end
```

## Testing

To test the GraphQL endpoints, I would recommend request specs over testing the schema itself by calling `Schema.execute(...)`. This ensures that you can run tests against your API as close to how it will be used as possible.

To aid in this, I like adding a `GraphqlHelpers` module with a little helper:

```ruby
  def graphql_request(query:, variables: {})
    post "/graphql",
      params: {
        query: query,
        variables: variables,
      }.to_json,
      headers: { Authorization: user.token, 'Content-Type': "application/json" }
  end
```

You can then use this in a test:

```ruby
query = %|
  query {
    book(permalink: "exploding-rails") {
      title
    }
  }
|

json = graphql_request(query: query)
expect(json.dig("book", "title")).to eq("Exploding Rails")
```

## Preventing N+1 queries

By default, GraphQL Ruby will perform N+1 queries if you write a query such as:

```
query {
  users {
    books {
      chapters
    }
  }
}
```

This will make one query for all the users, N queries for all of those users' books, and M queries for all of those users' books' chapters.

To prevent N+1 queries, I'd recommend relying on the `GraphQL::Dataloader` features [shown here](https://graphql-ruby.org/dataloader/overview.html). This will collect all the IDs for the relevant resources, and then perform one large fetch for each of the users, each of the users' books, and each of the users' books' chapters, resulting in only 3 queries.
