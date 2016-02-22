--- 
wordpress_id: RB-369
layout: post
title: Truncating indexes in Elasticsearch 2
---

In pre-2.0 versions of elasticsearch, you may have been truncating indexes using `delete_by_query`. This has been moved in Elasticsearch 2.0 out to a plugin, which can be installed with:

```
bin/plugin install delete-by-query
```

Where `bin/plugin` is located wherever you installed Elasticsearch. On my Mac,
that path is `/usr/local/Cellar/elasticsearch/2.2.0_1/libexec` because I
installed Elasticsearch with Homebrew. If you're on Ubuntu and you installed
it from Elasticsearch's own package repo, it will be at
`/usr/share/elasticsearch`.

I'm using the Elasticsearch Ruby gem to interact with my Elasticsearch instance, and this is the code I'm using to truncate the indexes:

```
module Index
  class Indexers
    def truncate_indexes
      client = Elasticsearch::Client.new
      client.delete_by_query(index: index_names, body: { query: { match_all: {} } })
      client.indices.flush(index: index_names)
    end
  end
end
```

This method is called after each spec has finished running. The `index_names`
is just a list of indexes that the `Index::Indexers` class knows about. The
`delete_by_query` functionality is available here from the `delete-by-query`
plugin that was installed. The `indices.flush` call is necessary because the
next query may return data that the `delete_by_query` request was supposed to
delete. The `flush` call clears the transaction log and memory and writes data
to disk, ensuring that the next query won't return data that was deleted.
