---
wordpress_id: RB-374
layout: post
title: Validating nested JSON data with ex_json_schema
---



I've been working on an Elixir service which reads events from a JSON API and then processes those events. The code to deserialize the events runs a little like this:

```elixir
defmodule MyApp.Event do
  def deserialize(event_module, data) do
    %{"id" => id, "type" => type, "body" => body} = data
    %__MODULE__{
      id: id,
      type: type,
      body: body |> event_module.deserialize,
    }
  end
end
```

It's invoked like `Event.deserialize(Response, data)`, where `data` looks something like:

```elixir
%{
  "id" => "1",
  "type" => "response",
  "body" => %{
    "survey_id" => "123456",
    "answers" => [
      %{
        "comment" => "Some text goes here"
      }
    ]
  }
}
```

I've come across an issue where _sometimes_ the event's data is either malformed, or entirely missing and so I want to validate it as it arrives in the service. The way that I've chosen to do this is to use [`ex_json_schema`](https://github.com/jonasschmidt/ex_json_schema), which allows you to validate that an Elixir `Map`  matches a [JSON Schema](http://json-schema.org/) specification, which is also defined as an Elixir `Map`.

In the case of the above data, I want to make sure that the data _definitely_ contains the `survey_id`, and `answers` properties, and that every answer has a `comment` property. If these conditions aren't met, then the data should be declared invalid and the event should not be processed.

To do this, I first declare a schema in the `Response` module:

```elixir
defmodule MyApp.Response do
  def schema do
    %{
      "definitions" => %{
        "answer" => %{
          "type" => "object",
          "required" => ["comment"],
          "properties" => %{
            "comment" => %{
              "type" => "string"
            },
          }
        }
      },
      "type" => "object",
      "required" => [survey_id", "answers"],
      "properties" => %{
        "survey_id" => %{
          "type" => "string"
        },
        "answers" => %{
          "type" => "array",
          "items" => %{
            "$ref" => "#/definitions/answer"
          }
        },
      }
    } |> ExJsonSchema.Schema.resolve
  end
end
```

This schema defines that the `survey_id` and `answers` properties within the "root" of the `Map` that I'm providing are present, and also validates that all the items within `answers` have a `comment` property. Not only this, but it also validates the type of the data that's incoming too. The `survey_id` and `comment` properties should _always_ be strings. If they aren't, then the data will be invalid according to this schema.

To use this schema, we first have to _resolve_ it. The `ex_json_schema` documentation suggests resolving the schema only once:

> You should only resolve a schema once to avoid the overhead of resolving it in every validation call.

In order to follow that instruction, I pass the schema to the `deserialize` function:

```elixir
defmodule MyApp.Event do
  def deserialize(event_module, data, schema) do
    ...
  end
end
```

To validate that the data matches the schema, I'm doing this:

```elixir
defmodule MyApp.Event do
  def process(event_module, event, schema) do
    validate(event, schema)
    |> deserialize(event_module)
  end

  defp validate(event, schema) do
    %{"id" => id, "body" => body} = event

    case ExJsonSchema.Validator.validate(schema, body) do
      :ok -> {:ok, event}
      {:error, errors} -> {:error, id, errors}
    end
  end

  defp deserialize({:ok, event_module, event}, event_module) do
    %{"id" => id, "type" => type, "body" => body} = event
    {:ok, %__MODULE__{
      id: id,
      type: type,
      body: body |> event_module.deserialize,
    }}
  end

  defp deserialize({:error, id, errors}, _), do: {:error, id, errors}
end
```

There's now two new functions in this `Event` module: `process` and `validate`. The `process` function serves as the new entrypoint for this module, and it validates and deserializes the data. The `validate` function uses the schema to validate the data. If the data is valid, it returns `{:ok, data}`, and if it's not, then it returns `{:error, errors, id}`. That return value is then passed to `deserialize`, which will then deserialize a valid event, and pass through the errors if the data was not valid.

This `Event.process/3` function can then be invoked like this:

```elixir
defmodule MyApp.EventProcessor do
  def process_events(event_module, events) do
    schema = event_module.schema # schema may be resolved earlier than this
    Enum.map(events, fn (event) ->
      process_event(event_module, event, schema)
    end)
  end

  def process_event(event_module, event, schema) do
    case Event.process(event_module, event, schema) do
      {:ok, event} -> process_event(event)
      {:error, id, errors} -> handle_error(id, errors)
    end
  end
end
```

If, for example, a blank event was sent to `Event.process/3`, it would return the `{:error, id, errors}` tuple with some errors, which are very readable:

```
{"Required property survey_id was not present.", "#"},
{"Required property comment was not present.", "#/answer/0"},
```

It's clear from this output that the event wasn't processed because the `survey_id` is missing, and the `comment` is missing from the first answer.
