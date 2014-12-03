---
wordpress_id: RB-359
layout: post
title: Filtering by index in Elasticsearch
---

Today I needed to filter by indexes in an Elasticsearch instance, and so I googled for how to do this but I couldn't find anything other than the [indicies filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-indices-filter.html) which isn't helpful without a proper context of where to use it in a query.

Instead of that filter, this is what I came up with to do the filtering:

```ruby
client = Elasticsearch.new
client.search(index: "logstash-2014.12.03,logstash-2014.12.02...", body: {
  query: {
    ...
  }
})
```

I hope this post can help other people who are looking for the same thing.


