---
wordpress_id: RB-1651794869
layout: post
title: Using Union Types with GraphQL Mutations in Ruby
---

The [official documentation for the graphql-ruby gem](https://graphql-ruby.org/mutations/mutation_classes.html) recommends this code for a mutation class that can either succeed or fail:

```ruby
class Mutations::CreateComment < Mutations::BaseMutation
  argument :body, String
  argument :post_id, ID

  field :comment, Types::Comment
  field :errors, [String], null: false

  def resolve(body:, post_id:)
    post = Post.find(post_id)
    comment = post.comments.build(body: body, author: context[:current_user])
    if comment.save
      # Successful creation, return the created object with no errors
      {
        comment: comment,
        errors: [],
      }
    else
      # Failed save, return the errors to the client
      {
        comment: nil,
        errors: comment.errors.full_messages
      }
    end
  end
end
```

I'd like to show an alternative to this that I think leads to cleaner code by using GraphQL concept called _union types_.

We use union types in GraphQL when we want a field to return one or more distinct types as its result. In the case of the above comment mutation, the two types of things we would like to return are either:

* A comment, if the mutation was successful
* Errors, if the mutation was unsuccessful

Let's change that mutation above to use a union type by declaring the type at the top of the mutation, and removing the two fields:


```ruby
class Mutations::CreateComment < Mutations::BaseMutation
  type Types::CreateCommentResult
  argument :body, String
  argument :post_id, ID

  def resolve(body:, post_id:)
    post = Post.find(post_id)
    comment = post.comments.build(body: body, author: context[:current_user])
    if comment.save
      # Successful creation, return the created object with no errors
      {
        comment: comment,
        errors: [],
      }
    else
      # Failed save, return the errors to the client
      {
        comment: nil,
        errors: comment.errors.full_messages
      }
    end
  end
end
```

This new type will be our union type that will represent either a successful creation for a comment, or a failed one.

We can define this type in our `types` directory under `graphql`, in a file called `create_comment_result.rb`:

```ruby
module Types
  class CreateCommentResult < BaseUnion
    description "The result from attempting to create a comment"
    possible_types Types::Comment, Types::Errors

    def self.resolve_type(object, _context)
      if object[:comment]
        [Types::Comment, object[:comment]]
      else
        [Types::Errors, object]
      end
    end
  end
end
```

A union type is defined by first inheriting from `BaseUnion`. If we had common logic to share between union types in our GraphQL API, that logic would go into `BaseUnion`.

Inside this `CreateCommentResult` type itself, we provide a description that'll appear in our API documentation, and inform this class what the possible types are. For this union type, we're defining two possible types: `Types::Comment`, and `Types::Errors`.

When the GraphQL code runs, it will call this `resolve_type` method to determine the correct GraphQL type to use when representing the result of the mutation. This method checks if `object[:comment]` is present, and if it is the type that'll be used is a `Types::Comment`, and we can fetch the comment from that object using `object[:comment]`. In Rails parlance, this `object[:comment]` will be an instance of the `Comment` model -- a result of a successful `build` and `save`.

If the operation was to fail, we would instead return a `Types::Error` type, and use the resulting object as the base object for that type.

These two types can be defined in the `types` directory too. Let's look at `CommentType` first, defined in `types/comment.rb`:

```ruby
class Types::Comment < Types::BaseObject
  field :id, ID, null: false
  field :body, String, null: false
end
```

This type is used to represent comments in our GraphQL API. It provides access to both the `id` and `body` attributes from any `Comment` instance that is represented by this API.

Then, the `Errors` type:

```ruby
class Types::Errors < Types::BaseObject
  field :errors, [String], null: false
end
```

This type represents the `{ comment: nil, errors: [...] }` hash that will be returned when a comment creation fails.

With these union types setup, we can write this GraphQL query that will rely on them:

```
mutation {
  createComment(input: { postId: 1, body: "Hello world" }) {
    __typename
    ... on Comment {
      id
    }

    ...on Errors {
      errors
    }
  }
}
```

Firstly, we call this mutation by passing in its required arguments. After that, we fetch a field called `__typename`. This field is automatically defined, and it will return the type whatever object is returned, either `Comment` or `Errors`. When calling this GraphQL API, we can use `__typename` to determine how to act.

The `... on` syntax here tells GraphQL which fields we would like to use in the case of each part of the union being returned here. If it's a comment, we will fetch just the `id`. If it's `Errors`, we can fetch just the errors.

If we were to call this mutation with an empty comment body, we would see this as the result:

```json
{
  "data": {
    "createComment": {
      "__typename": "Errors",
      "errors": [
        "Body can't be blank"
      ]
    }
  }
}
```

And if we were to call it with a valid body, we would see this:

```json
{
  "data": {
    "createComment": {
      "__typename": "Comment",
      "id": "6"
    }
  }
}
```

When using this API (for example, within a frontend codebase), we can assert on `__typename` to determine how to show the result to a user -- if it's a `Comment`, then indicate a successful comment creation. If it's `Errors`, then show those errors on the form.
