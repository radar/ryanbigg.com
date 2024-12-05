---
wordpress_id: RB-1733437426
layout: post
title: Using Elastic Search's Profile API
---

Recently, we saw that one of our production applications was experiencing very long query times when users were searching for their customers, with some queries taking as long as 60 seconds.

We use Elastic Search to power this search (even though Postgres' own full-text search would've been suitable!) and the query we wrote for Elastic Search was this one written about 10 years ago:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "query_string": {
            "query": "Ryan*"
          }
        }
      ],
      "filter": [
        {
          "bool": {
            "must": [
              {
                "terms": {
                  "merchant_id": [2]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

This query will search for the query string "Ryan*" across all fields on all documents within the `customers` index. Given the application has grown substantially over the last 10 years, there's now _a lot_ of customer documents to search through. As the number of documents grow, the amount of time to search through those documents gets increasingly slower.

In order to figure out _why_ this query was slow rather than "big data" and vibes-driven-development, I turned to the [Profile API within Elastic Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-profile.html). We can use this by adding `profile: true` to the top of any query string:

```json
{
  "profile": true,
  "query": {
    "bool": {
  ...
```

This profile key gives us a _very_ detailed breakdown of what a query is doing, including how long each of its distinct parts are taking. Fortunately for us, this query is relatively "simple" and only consists of one very large operation: search across all document fields for a wildcarded query string.

The first thing I noticed when looking at this output is that the number of fields are quite long:

```
{
  "profile": {
    "shards": [
      {
        "id": "[JzYnfX2ORHiGumsVoL3jhg][customers][2]",
        "searches": [
          {
            "query": [
              {
                "type": "BooleanQuery",
                "description": "(last_name.keyword:Ryan* | <a lot of fields>"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

The excessive amount of fields are a combination of regular customer information and address information. So my first thought was could we limit the amount of fields that we're letting users search through. To do this, we can use `fields` on the query to say "only search these fields":

```json
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        {
          "query_string": {
            "query": "Ryan*",
            "fields": [
              "first_name",
              "last_name",
              "email",
              "reference",
              "card_token",
              "card_number",
              "public_id"
            ]
          }
        }
      ],
      "filter": [
        {
          "bool": {
            "must": [
              {
                "terms": {
                  "merchant_id": [2]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

This time the profile output only contained the fields that I was interested in. These fields are all the fields we display in the UI for customers -- notably `card_number` is a masked version of the number.

After making this change, the query time went from multiple-digit seconds to single-digit seconds. This is because the query now looks in fewer locations across each document within its index. Importantly, the query also passed all our feature tests around searching within our application too.

I still felt like there was space to improve the query. Did we really need it to use a wildcard search, given that Elastic Search is pretty decent at matching text? So I tried it again without the wildcard on the end of the query:

```json
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        {
          "query_string": {
            "query": "Ryan",
            "fields": [
              "first_name",
              "last_name",
              "email",
              "reference",
              "card_token",
              "card_number",
              "public_id"
            ]
          }
        }
      ],
      "filter": [
        {
          "bool": {
            "must": [
              {
                "terms": {
                  "merchant_id": [2]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

This query now operated in two-digit milliseconds. Without using a wildcard, the query is pre-analysed by Elastic Search and breaks it down into tokens that can then be matched to pre-analysed documents within the index.

Comparing the two profile outputs, the one with the wildcard shows a series of `MultiTermQueryConstantScoreWrapper`, matching against all different fields. The one without the wildcard shows a range of different ones such as `TermQuery` for fields classified as `term`, which will match faster as we're searching based on the pre-analysed data within the index.

(And if we want to be completely un-scientific about it, the profile output for wildcard searching is 1,100 lines, while the profile output for non-wildcard searching is only 700 lines. Fewer lines of profiling output is a very good indicator that the searcher is doing less work!)

This is more suitable for matching against customer records in most circumstances, as our users are searching either by a customer's full name or their email addresses. In rarer cases, they're using reference values, and when that happens it appears to be the full reference value. The `card_token` and `card_number` fields are used the least frequently.

I'm going to be rolling out this change next week and I have strong faith in its ability to reduce search time for people. I now have an additional tool in my toolbelt for diagnosing slow Elastic Search queries, and a better understanding from the profile output as to what different queries are doing.
