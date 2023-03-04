---
wordpress_id: RB-1677798624
layout: post
title: Please explain, Elastic Search
---

I've recently been using Elastic Search on a project. I came across an issue where Elastic Search wasn't able to find a particular document for a particular query. My first thought that was the document wasn't indexed within the index, but it was.

I'll walk through the process of debugging this search query in this post, demonstrating a couple of helpful Elastic Search endpoints.

Let's go through the whole process, from indexing to searching to explaining. I'll be using [the wonderful httpie tool](https://httpie.io/) to interact with Elastic Search in this post.

## Indexing a document

To index a document in ElasticSearch, we need an index that this document can be inserted into. We can create this index with:

```text
http put http://localhost:9200/posts
```

Running this command will show us the index has been created:

```json
{
  "acknowledged": true,
  "index": "posts",
  "shards_acknowledged": true
}
```

Next, we can add a new document into this index. For this example, I'll create a small JSON file containing the data that we want to index, calling the file `post.json`:

```json
{
  "id": 1,
  "title": "Please explain, Elastic Search",
  "date": "2023-03-03",
  "user_id": 101,
}
```

We can then add this document to the index by running:

```text
http put http://localhost:9200/posts/_doc/1 < post.json
```

When we run this command, we'll see the document has been inserted successfully, as indicated by the "result" field:

```json
{
    "_id": "1",
    "_index": "posts",
    "_primary_term": 1,
    "_seq_no": 0,
    "_shards": {
        "failed": 0,
        "successful": 1,
        "total": 2
    },
    "_type": "_doc",
    "_version": 1,
    "result": "created"
}
```

Let's also add a document that _should not_ be returned by our search query:

```json
{
  "id": 2,
  "title": "We should not see this post",
  "date": "2023-02-02",
  "user_id": 155,
}
```

I'll save this in a file called `post-2.json`, and insert it:

```text
http put http://localhost:9200/posts/_doc/2 < post-2.json
```



## Viewing a document

We can then see the document in this index using either the search API, or using the document API. Let's look first at the search API:

```text
http get http://localhost:9200/posts/_search
```

This shows:

```json
{
    "_shards": {
        "failed": 0,
        "skipped": 0,
        "successful": 1,
        "total": 1
    },
    "hits": {
        "hits": [
            {
                "_id": "1",
                "_index": "posts",
                "_score": 1.0,
                "_source": {
                    "date": "2023-03-03",
                    "id": 1,
                    "title": "Please explain, Elastic Search",
                    "user_id": 101
                },
                "_type": "_doc"
            }
        ],
        "max_score": 1.0,
        "total": {
            "relation": "eq",
            "value": 1
        }
    },
    "timed_out": false,
    "took": 3
}
```

Alternatively, we can request this document using the same URL we used for the `PUT` operation to add the document into the index:

```text
http get http://localhost:9200/posts/_doc/1
```

```json
{
    "_id": "1",
    "_index": "posts",
    "_primary_term": 1,
    "_seq_no": 0,
    "_source": {
        "date": "2023-03-03",
        "id": 1,
        "title": "Please explain, Elastic Search",
        "user_id": 101
    },
    "_type": "_doc",
    "_version": 1,
    "found": true
}
```

## Searching for a document

Elastic Search has a very flexible query API, but it can be a bit wordy sometimes. Let's write some search JSON to find a post based on a particular date range, and a user ID. I'm going to put this one into a file called `query.json`, and we're going to write this in such a way that it does _not_ find our document by writing the wrong user ID, and the wrong date range.

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "date": { "gte": "2023-02-01", "lte": "2023-02-28" }
          }
        },
        {
          "term": { "user_id": 100 }
        }
      ]
    }
  }
}
```

We can then run this query by using the search API:

```text
http get http://localhost:9200/posts/_search < query.json
```

This will return no results, as our query is wrong:

```json
{
    "_shards": {
        "failed": 0,
        "skipped": 0,
        "successful": 1,
        "total": 1
    },
    "hits": {
        "hits": [],
        "max_score": null,
        "total": {
            "relation": "eq",
            "value": 0
        }
    },
    "timed_out": false,
    "took": 2
}
```

## Explaining a query

To get information from Elastic Search on why a particular document hasn't matched a query, we can use the Explain API.

```text
http get http://localhost:9200/posts/_explain/1/ < query.json
```

When we run this query, we see a _huge_ amount of output:

```json
{
    "_id": "1",
    "_index": "posts",
    "_type": "_doc",
    "explanation": {
        "description": "Failure to meet condition(s) of required/prohibited clause(s)",
        "details": [
            {
                "description": "no match on required clause (date:[1675209600000 TO 1677628799999])",
                "details": [
                    {
                        "description": "date:[1675209600000 TO 1677628799999] doesn't match id 0",
                        "details": [],
                        "value": 0.0
                    }
                ],
                "value": 0.0
            },
            {
                "description": "no match on required clause (user_id:[100 TO 100])",
                "details": [
                    {
                        "description": "user_id:[100 TO 100] doesn't match id 0",
                        "details": [],
                        "value": 0.0
                    }
                ],
                "value": 0.0
            }
        ],
        "value": 0.0
    },
    "matched": false
}
```

This shows us that the query did not match because both the `date` and `user_id` fields are wrong. Important to note here is that the `date` field range values are returned in milliseconds-from-epoch, rather than the `2023-03-03` format we might expect.

Let's fix up the query so that it now matches, putting the query into another file called `fixed-query.json`:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "date": { "gte": "2023-03-01", "lte": "2023-03-31" }
          }
        },
        {
          "term": { "user_id": 101 }
        }
      ]
    }
  }
}
```

We can then run this corrected query through the explain endpoint:

```text
http post http://localhost:9200/posts/_explain/1 < fixed-query.json
```

The output will show that our query now matches this document:

```json
{
    "_id": "1",
    "_index": "posts",
    "_type": "_doc",
    "explanation": {
        "description": "sum of:",
        "details": [
            {
                "description": "date:[1677628800000 TO 1680307199999]",
                "details": [],
                "value": 1.0
            },
            {
                "description": "user_id:[101 TO 101]",
                "details": [],
                "value": 1.0
            }
        ],
        "value": 2.0
    },
    "matched": true
}
```

And if we attempt to search with this query, we'll see it returned in the hits for this query too:

```text
http get http://localhost:9200/posts/_search < fixed-query.json
```

```json

{
    "_shards": {
        "failed": 0,
        "skipped": 0,
        "successful": 1,
        "total": 1
    },
    "hits": {
        "hits": [
            {
                "_id": "1",
                "_index": "posts",
                "_score": 2.0,
                "_source": {
                    "date": "2023-03-03",
                    "id": 1,
                    "title": "Please explain, Elastic Search",
                    "user_id": 101
                },
                "_type": "_doc"
            }
        ],
        "max_score": 2.0,
        "total": {
            "relation": "eq",
            "value": 1
        }
    },
    "timed_out": false,
    "took": 12
}
```
