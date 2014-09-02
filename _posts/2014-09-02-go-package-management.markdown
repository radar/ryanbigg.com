--- 
wordpress_id: RB-355
layout: post
title: Go package management
---

In Ruby-land, we have a wonderful tool called Bundler to manage package dependencies. I can specify dependencies like this:

```ruby
gem 'rails', '4.1.5'
```

When I run `bundle install`, Bundler will install not only the `rails` dependency, but all of its dependencies and all of their dependencies and so on. It will then take note of the dependencies which have been resolved and save them to a `Gemfile.lock`. I can commit this file to Git and push it up to GitHub, then when other people work on my project they can clone it and run `bundle install` on their machine and work with the exact same dependencies. Another benefit of this is that I can have multiple versions of Rails installed on the machine and when I use Bundler, it will use the correct version of Rails as specified in the Gemfile.

There's tools out there in Go-land, such as [gom](https://github.com/mattn/gom) and [godep](https://github.com/tools/godep) which provide similar functionality. I prefer `godep`, but truth be told I wish that there was a Bundler-for-Go. Godep saves the dependencies in a JSON file:

```json
{
  "ImportPath": "github.com/radar/my-project",
  "GoVersion": "go1.3",
  "Packages": [
    "./..."
  ],
  "Deps": [
    {
      "ImportPath": "github.com/codegangsta/cli",
      "Comment": "1.2.0-22-g687db20",
      "Rev": "687db20fc379d1686465a28e9959707cd1acc990"
    },
    {
      "ImportPath": "github.com/fatih/color",
      "Rev": "3161cccfa22c6243e02aa984cf2886d022024cec"
    },
    {
      "ImportPath": "gopkg.in/check.v1",
      "Rev": "5b76b26efe7f426789852e983fbde4de62c42282"
    }
  ]
}
```

This is a pretty good solution. `godep save` will update the dependencies (similar to `bundle update`), and `godep restore` will install the dependencies (similar to `bundle install`) if they aren't available in `GOPATH` already.

---

Here's what I would like though: I want a way that I can specify dependencies for Go projects like I can specify for Ruby projects. Ruby projects have a `.gemspec` file [which lists dependencies](http://git.io/teWNMw0), and I would like Go projects to do the same thing. For instance, in my project I'd like to specify my dependencies in a very simple JSON syntax (let's call it `deps.json`):

```json
[
  {
    path: "github.com/codegangsta/cli",
    rev: "1.2.0",
  },
  {
    path: "github.com/fatih/color",
    rev: "master",
  }
]
```

Then I would like to run a `bundle install`-equivalent which creates a `deps.json.lock`:

```json
[
  {
    path: "github.com/codegangsta/cli",
    rev: "565493f259bf868adb54d45d5f4c68d405117adf",
  },
  {
    path: "github.com/fatih/color",
    rev: "3161cccfa22c6243e02aa984cf2886d022024cec",
  }
]
```

That's the first step. The second step is a lot more complex than that, and it involves fetching the dependencies from their sources and setting up a proper `GOPATH`. See, the issue with the normal `GOPATH` is that all your dependencies are thrown into the one `src` directory. This means that if you want to use "Version A" of a project in "Codebase A" and "Version B" of that same project in "Codebase B", you're going to have a bad time. This is why I think having a *global* `GOPATH` is a terrible idea.

Instead, there should be a project-specific `GOPATH`. It looks the same as a normal `GOPATH`, but has the correct dependencies in it. For instance, instead of having a `~/Projects/go/src/github.com/radar/my-project`, I would have `~/Projects/go/my-project`, and then underneath that it would have `bin`, `pkg` and `src` directories relevant only to that project. The project's code itself would exist within `Projects/go/my-project/src/github.com/radar/my-project`, only because that's what Go expects.

To setup the project, I would create `~/Projects/go/my-project/src/github.com/radar/my-project`, and then run that `bundle install` equivalent. This would clone `github.com/codegangsta/cli` into `~/Projects/go/my-project/src/github.com/codegangsta/cli`, and check it out to the ref specified in `deps.json.lock`. It would then do the same thing with `github.com/fatih/color`. Now I have the first layer of dependencies that `my-project` needs.

The third step is where it gets *even more difficult*. These first layer of dependencies *might* have dependencies themselves, and so this tool should check for `deps.json.lock` (or `deps.json`) within those projects and resolve them as well. This is difficult because you may run into issues like circular dependencies and conflicting version requirements.

I believe if project setup was done this way, multiple Go projects on the same machine can use varying dependencies very easily.

There's of course caveats: potential disk usage problems, every project needs a `deps.json`, and the resolution problems. By no means am I suggesting that this is *The Way Things Should Be Done*. It's just something that occurred to me tonight that could be a potential beginning towards a solution for the Go package management puzzle

