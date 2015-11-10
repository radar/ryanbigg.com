--- 
wordpress_id: RB-367
layout: post
title: Active Record, change_column and scales
---

I discovered a fun quirk of Active Record today. I'm not sure if it's a bug or if it's just me doing something silly, but in these kinds of cases I've learned to lean more towards the latter. Here's how it's done.

Start with a fresh Rails app, using MySQL:

```
rails new shop -d mysql
```

Create a new `Variant` model:

```
rails g model variant price:decimal
```

We just so happen to know that we need to specify a precision (numbers before the decimal) and scale (numbers after the decimal) for this column, and we (read: I) can never remember the syntax for that in the `generate` command, so we edit the migration to provide both a `precision` and `scale` for this column, turning it into this:

```
class CreateVariants < ActiveRecord::Migration
  def change
    create_table :variants do |t|
      t.decimal :price, precision: 10, scale: 2

      t.timestamps null: false
    end
  end
end
```

Running this migration with `rake db:migrate` will generate a `db/schema.rb` which looks like this:

```
ActiveRecord::Schema.define(version: 20151110060233) do
  create_table "variants", force: :cascade do |t|
    t.decimal  "price",      precision: 10, scale: 2
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end
end
```

A `show columns from variants;` MySQL query will show this:

```
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| price      | decimal(10,2) | YES  |     | NULL    |                |
| created_at | datetime      | NO   |     | NULL    |                |
| updated_at | datetime      | NO   |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
```

Note here that the `price` field has a `precision` of 10 and `scale` of 2; that's indicated by `decimal(10,2)`. That's good, because that's what we specified inside our migration.

Let's stop here and create two variants in our console:

```
rails console
Variant.create(price: 26.99)
Variant.create(price: null)
```

These are just for demonstration purposes. No real data was harmed in the writing of this blog post.

The `price` column here doesn't have a default value and it allows for null values. There's data in here already which has `null` and that just won't do, because we want prices to always be a decimal number to make it easy to manage in our code. Having to do `to_f` to convert `nil` to `0.0` is not that smart. We're better than that!

So we'll go ahead and create a new migration to do the the `default` and `null` modifications to this `price` column:

```
rails g migration add_default_to_variants_price
```

Inside that migration, we write this:

```
class AddDefaultToVariantsPrice < ActiveRecord::Migration
  def change
    Variant.where(price: nil).update_all("price = 0")
    change_column :variants, :price, :decimal, default: 0.0, null: false
  end
end
```

Pretty simple stuff. We change all the variants where the price is `nil` (`null`) to have a price set to `0`. Then we set the `default` to be `0.0` and also tell it that we don't want `null` values in this column. If we didn't do the `update_all` call first, AR would bomb out because we tried to set `null: false` on a column which already had nulls.

We then run this migration (`rake db:migrate`), and this is where things go bad.

To start with, let's open `rails console` and run `Variant.first`. This is the variant that has a price set to `26.99`. Well, it's not that any more:

```
#<Variant id: 1, price: 27,
```

Yes, it's now 27.

What happened? Let's look at our `schema.rb`:

```
ActiveRecord::Schema.define(version: 20151110061535) do

  create_table "variants", force: :cascade do |t|
    t.decimal  "price",      precision: 10, default: 0, null: false
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
  end

end
```

Ok, that says it's got a `precision: 10`, but where's the scale from the first migration gone? It's gone away.

Let's confirm this in MySQL too:

```
mysql> SHOW COLUMNS from variants;
+------------+---------------+------+-----+---------+----------------+
| Field      | Type          | Null | Key | Default | Extra          |
+------------+---------------+------+-----+---------+----------------+
| id         | int(11)       | NO   | PRI | NULL    | auto_increment |
| price      | decimal(10,0) | NO   |     | 0       |                |
| created_at | datetime      | NO   |     | NULL    |                |
| updated_at | datetime      | NO   |     | NULL    |                |
+------------+---------------+------+-----+---------+----------------+
```

The precision has stayed at 10, but the scale has changed to 0.

But why does this happen?

Because in the second migration, we didn't specify a precision and a scale.

Instead of this line:

```
change_column :variants, :price, :decimal, default: 0.0, null: false
```

We should have:

```
change_column :variants, :price, :decimal, precision: 10, scale: 2, default: 0.0, null: false
```

Otherwise, it defaults to a precision of 10 and scale of 0 _and_ helpfully rounds up your prices for you.

Isn't that handy?
