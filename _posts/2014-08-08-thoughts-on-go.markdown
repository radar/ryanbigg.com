--- 
wordpress_id: RB-354
layout: post
title: Thoughts on Go
---

I've had an interest in Go now for about a year. I've not done much with it before this week besides go through the [go-koans](https://github.com/cdarwin/go-koans) (recommended!) and build a couple of very light projects with it, like an IRC bot that didn't do much. I've also made a couple of commits to [Bo Jeanes' go-lifx](https://github.com/bjeanes/go-lifx) project, which is Go bindings for LIFX lights. It's still very much a work-in-progress, but it was fun to dip my toes into the Go waters again.

This was the first week that not only that I wrote Go code *for my job*, but I actually got to deploy it in a live production context. And it was the first week at my new job at LIFX, too. All this little program does now is read some stats from a JSON file and report them back to our analytics service. The earlier version was written in Ruby, which meant that Ruby needed to be compiled on this box just for one little script. Having the little script in Go means that we no longer need to compile Ruby on that box; a small victory but a victory nonetheless.

I dislike that I don't know much about Go still at this stage. That probably boils down to me not really having a proper use for it until recent. It could also be because a lot of the Go documentation out there is similar to a cookbook that only explains the properties of the ingredients, rather than having recipes. I enjoy learning by example and I think other people do also, because they bought [a book that I wrote](https://manning.com/bigg2) that's all about the examples.

I like that the Go packages themselves are pretty well-documented. I especially like that I know what *type* of object I'm supposed to be passing in. Take [`time.Unix`](http://golang.org/pkg/time/#Unix) for example. It works similarly to `Time.at(unix_time)` in Ruby. The Go documentation for `time.Unix` clearly indicates that it takes two arguments, both of which are of the `int64` type, and that it returns a Time "instance". That's something that I didn't think I would like, given that I've been doing Ruby for so long and it has a little thing called duck-typing where methods can be defined on anything and everything. A Ruby motto could perhaps be: "If it quacks like a duck, let's pretend it is a duck for fear of finding out what it truly is." In Ruby, methods can return whatever they want and more often than not, to know what a method returns you have to look at how that method is defined. Oh, and in Go methods can return multiple values, like `json.Marshal` (like `to_json` in Ruby) which will return the marshalled JSON (as an array of bytes) as well as (possibly) an error if that marshalling fails for some reason.

I like that you can compile your program down to a binary file very easily and then deploy it to a server. For instance, on the `go-lifx` project, we can (and do) provide some very simple binaries that are compiled from the code within that project using Go's built-in tool: `go build`. 

I also enjoy the `go get` tool. It took me a while to figure out that if I structured my `~/Projects/go` directory properly, that my Go experience would be more fluid. The proper way to structure it is:

    Projects/go
      -> src
        -> github.com
          -> bjeanes
            -> go-lifx

I've set `GOPATH` to `~/Projects/go` and so then when I type `go get github.com/codegangsta/cli` it will install it into `~/Projects/go/src/github.com/codegangsta/cli`. I can then reference it in my Go program very simply:

    import (
      "github.com/codegangsta/cli"
    )

That way, if I want to use it in another project then I can do it in exactly the same way.

Finally, the `go fmt` tool is the tool to end all (most?) coding syntax debates. It enforces tab-indentation, and blank spaces for alignment. It does a couple more things, which are [explained in gofmt's documentation](http://golang.org/cmd/gofmt/).

Overall, I enjoy the language and look forward to learning more about it, as well as finding other situations where we can use it at LIFX.











