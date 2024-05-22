---
wordpress_id: RB-1715719691
layout: post
title: What was that branch?
---

When I'm working in an app I tend to have multiple branches on the go at any one time while waiting for feedback on those branches, be that feedback from CI systems or people. Occasionally, it's a few days / weeks between visits to a branch because the flow of work meant it that way. And sometimes, I forget what the branch name was.

To help with this, I've got this function in my `~/.zshrc`:

```
fbr () {
	local branches branch
	branches=$(git for-each-ref --count=30 --sort=-committerdate refs/heads/ --format="%(refname:short)")  && branch=$(echo "$branches" |
  fzf-tmux -d $(( 2 + $(wc -l <<< "$branches") )) +m)  && git checkout $(echo "$branch" | sed "s/.* //" | sed "s#remotes/[^/]*/##")
}
```

This complicated looking function finds the 30 most recent local branches and presents them in a date-ordered list using `fzf-tmux`. To pick a branch, I can type part of the branch name if I remember it, and `fzf` will filter the list of branches to just the ones that match that. When I find the branch I want, I hit enter and this will swap over to the branch.
