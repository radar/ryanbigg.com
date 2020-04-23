---
wordpress_id: RB-1587600332
layout: post
title: How to tidy up Git Pull Requests
---

**This post will cover how to break up a commit on a Git branch into two separate commits all from the terminal.**

Sometimes, developers can get carried away when they make commits. For instance, take [this commit](https://github.com/radar/twist-v2/commit/19a513a6ae33ed0de3fb8ce426e7c7ec99449f0d) from yours truly. It _claims_ to be fixing a particular issue, but there's _a lot_ of code there to fix that issue. Is all of it really necessary?

I'll save you the spelunking: just the `frontend/src/styles.css` and `frontend/src/tailwind.css` files are the only things required to fix this issue. This commit _really_ should've just been changes to those two files. The storybook changes should've been in a _separate_ commit.

But the work has been done! Isn't it now set in stone? No, this is Git! We can rewrite history.

So let's pretend like this commit _hasn't been committed to master yet_. I can do this by checking out a new branch to the commit before that one:

```plain
git checkout 19a513a6~1 -b tidy-up-git-example
```

Here, `~1` means "1 before". You could put any number here. You can see what this branch looks like [on GitHub](https://github.com/radar/twist-v2/tree/tidy-up-git-example). The latest commit will be `bb36d9b`, "Add back image missing".

We now want to apply that `19a513a6` commit, the one that fixes Issue #22, to this branch. To do this, we'll open a pull request against this `tidy-up-git-example` branch.

First, we need to switch to a new branch:

```text
git switch -c fix/issue-22
```

`switch` is a recent sub-command of Git, and [was added in 2.23.0](https://github.blog/2019-08-16-highlights-from-git-2-23/). You can think of it behaving like `checkout`.

We'll now bring in that commit to this branch, applying it on top of the current history with `cherry-pick`:

```bash
git cherry-pick 19a513a6
```

When we run `git log --oneline`, we'll see this:

```text
f20de41 (HEAD -> fix/issue-22) Fixes #22
bb36d9b (origin/tidy-up-git-example) Add back image missing
```

This shows us that the top-most / latest commit is that one we just cherry picked, and that the next most recent commit is the latest from the `origin/tidy-up-git-example` branch.

Next, you'll need to push this branch up to GitHub:

```text
git push origin fix/issue-22
```

If you don't have permission to push to this repository (and most of you won't!), you'll need to fork it on GitHub first, then:

```text
git remote add your-username git@github.com:your-username/twist-v2.git
git push your-username fix/issue-22
```

When this branch has been pushed to GitHub, you should now be able to create a pull request from that branch. You can do this by going to https://github.com/your-username/twist-v2/pull/new/fix/issue-22. On this page, under "Open a pull request" you'll see two dropdowns: one for a "base" branch and one for "compare" branch:

![Base & Compare](/images/tidy-up-github/base-and-compare.png)

The base branch is the branch you will be applying your pull request to. The changes in your pull request come from the compare branch. The "Able to merge" here indicates that there are no conflicts between the branches, and so this PR would be mergeable onto the base branch without trouble.

If we go ahead and create this PR now, we'll see this:

![Big Diff](/images/tidy-up-github/big-diff.png)

How many lines?! If I was reviewing a PR of this length I would make sure to grab at least _one_ cup of coffee and have slept well the night before too. Does this PR need to be so _massive_? We answered that before: no.

So we now have got ourselves a little bit stuck. We want to have the changes to fix Issue #22, but we also care about the storybook changes too. Let's now work on how we can separate these two into two separate PRs.

## Separating out Issue #22

Let's start with just the CSS changes from `frontend/src/styles.css` and `frontend/src/tailwind.css`. We want just these changes to be in the PR's commit. To do that, we need to _undo_ and _redo_ this commit.

To _undo_ a commit, we use a Git operation called a _soft reset_:

```text
git reset --soft HEAD~1
```

You can think of this like the opposite of `git commit`; it resets the Git repository's state back to how it was right before `git commit` was run. All of changes from this commit will be staged for commit:

![Staged for commit](/images/tidy-up-github/staged-for-commit.png)

But our latest commit will show up as the one from `tidy-up-git-example`:

```text
git log --oneline
```

```
bb36d9b (HEAD -> fix/issue-22, origin/tidy-up-git-example) Add back image missing
```

Now that we're back to our pre-`git commit` stage, we need to go back one more step, back to before `git add` was run to stage these files. To do that, we need to run:

```
git reset HEAD
```

This command will unstage all the changes in our repository:

![Unstaged files](/images/tidy-up-github/unstaged-files.png)

Now we want to just add the changes from `frontend/src/styles.css` and `frontend/src/tailwind.css`. We can do this with:

```
git add frontend/src/styles.css
git add frontend/src/tailwind.css
```

(Or if we were wanting to pick-and-choose changes from these files, we could do `git add -p <file>` instead)

This will stage these two files:

![Two staged files](/images/tidy-up-github/two-staged-files.png)

Next, we can commit these changes:

```
git commit -m "Fixes #22"
```

We've now re-written the history of the `fix/issue-22` branch. The latest commit on this branch, according to our local computer, is different to the latest one on GitHub. We need to tell GitHub that our history is correct, and we can do this with:

```
git push <your username> fix/issue-22 --force-with-lease
```

This option will force-push your changes to GitHub, updating GitHub with the simpler changes.

If you refresh the GitHub pull request window, you'll now see a much, much smaller diff number:

![Small Diff](/images/tidy-up-github/small-diff.png)

Much better! Our PR is now just focussed on the small changes that we needed to make to fix Issue #22.

We can then merge this PR to the branch, confident that the commit is small.

## Storybook

Next up, we still need to pull in those storybook changes. Because we've reset and unstaged all the changes, those storybook changes will still be tracked as unstaged in our Git repository:

![Unstaged storybook files](/images/tidy-up-github/unstaged-storybook-files.png)

We can check out to a new branch for these changes, add these files, make a new commit and push these changes to GitHub:

```
git switch -c update-storybook
git add .
git commit -m "Update Storybook + separate stories"
git push origin update-storybook
```

We can then go about creating a pull request for these changes if we like by going to https://github.com/your-username/twist-v2/pull/new/update-storybook. Remember to change the base branch here to `tidy-up-git-example`!

Once the PR is created, we can choose to merge it to that base branch. The base branch will then have both sets of changes on it: one (small one) to fix Issue #22, and one (large one) to upgrade storybook.

The storybook changes _could_ probably be split out into smaller commits too, but I'll leave that one as an exercise to the reader.
