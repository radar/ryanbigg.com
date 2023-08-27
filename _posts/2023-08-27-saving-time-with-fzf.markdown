---
wordpress_id: RB-1693169186
layout: post
title: Saving time with fzf
---

One of my favourite terminal utilities is [a little utility called fzf](https://github.com/junegunn/fzf) (fuzzy finder). It's how I save a bunch of time by not writing out commands, or even remembering them.

## Command history

The thing I use fzf for the most is command history. To access the history, I use Ctrl+R and I get a list of my most recent commands:

```
10024 z ryanbigg
10026 bundle exec jekyll serve
```

(The numbers represent the position of that command in my `.zsh_history` file.)

If I then write the word "serve", fzf will only show me commands with that word in it:

```
10026 serve
```

I usually use this for running some different Rails apps on certain ports. So I would hit Ctrl+R, and then type a particular port number such as 3004 to get:

```
10007 bundle exec rails s -p 3004
```

Instead of typing out the full command, I can type Ctrl+R and 4 keystrokes later arrive at the right command.

## Files in current directory

Another thing I use fzf for is its relative file searching. Most of the time, I'm using this to run RSpec tests. I type:

```
ber
```

(Which is my alias for "bundle exec rspec"), and then I hit Ctrl+T and I get a list of files in my terminal:

```
app
app/models
app/models/category.rb
...
```

Then I can type a few words, or even parts of words, to get what I'm after. In this example, I'd like to find the file at `spec/requests/graphql/queries/repo_categories_spec.rb`. What a mouthful! With `fzf`, I can type `repocat` and arrive at that spec in only seven keystrokes:

```
spec/requests/graphql/queries/repo_categories_spec.rb
<other files here>
```

When I hit enter here, my `ber` command becomes:

```
ber spec/requests/graphql/queries/repo_categories_spec.rb
```

Then I can run this test.

(If I've run this command before, I might use `Ctrl+R` to find the "full version" of `ber` + the file path!)


## Filtering output

Finally, the last way I use `fzf` is to filter output. You can pipe a list of inputs to `fzf` and it will provide its fuzzy finding features on that list.

The way I use this the most is this very complicated looking function:

```
fbr () {
	local branches branch
	branches=$(git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format="%(refname:short)")  && branch=$(echo "$branches" |
  fzf-tmux -d $(( 2 + $(wc -l <<< "$branches") )) +m)  && git checkout $(echo "$branch" | sed "s/.* //" | sed "s#remotes/[^/]*/##")
}
```

I didn't come up with this myself, but I borrowed it from elsewhere.

This command finds the 30 most recent Git branches (surely more than adequate!) and provides a way of filtering through them. Here's what I see when I run `fbr` in a gem I have checked out:

```
patch-1
fix-locale-with-separator
prep-1-1-4
...
```

If I type the word `locale` and hit enter, the `git checkout` command will switch me into that branch.

I find this one really useful when I can only half-remember a branch name, or if I've got a branch with an issue number in it, then I can jump straight to that branch if I know the number.
