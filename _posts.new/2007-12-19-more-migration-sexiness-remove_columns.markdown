--- 
wordpress_id: 102
layout: post
title: More Migration Sexiness - remove_columns &amp; add_columns
wordpress_url: http://frozenplague.net/?p=102
---
After seeing <a href="http://errtheblog.com/posts/51-sexy-migrations">a post on errtheblog</a> about them making migrations sexier, I was inspired on the train ride this morning to write something similar. I had a table and I wanted to drop many columns for it and I ended up writing something like:
<pre lang="ruby"> remove_column :table, :column_1

remove_column :table, :column_2

remove_column :table, :column_3

remove_column :table, :column_4...</pre>
and by now you're starting to get the idea. I have to not only type out remove_column four times, but also the table name! What a waste of time!

So I hacked up some code and put it into lib/custom_methods.rb.
<pre lang="ruby">module ActiveRecord
  module ConnectionAdapters
    class MysqlAdapter
      def remove_columns(table_name, *columns)
        columns.each { |column| remove_column table_name, column }
      end

      def add_columns(table_name, type, *columns)
        columns.each { |column| add_column table_name, column, type}
      end
    end
  end
end</pre>
So now instead of the monstrosity above I can now type:
<pre lang="ruby">remove_columns :table, :column_1, :column_2, :column_3, :column_4</pre>
to remove all the columns.

Also inspired by remove_columns was add_columns (already spied by the observant few). There's a little difference in add_columns compared with add_column, the type is now the second argument instead of the third:
<pre lang="ruby">add_columns :table, :string, :column_1, :column_2, :column_3</pre>
