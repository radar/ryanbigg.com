--- 
wordpress_id: 189
layout: post
title: "SVN: Why I moved away, and why you should too"
wordpress_url: http://frozenplague.net/?p=189
---
At my new work, we use SVN for all our projects, and we did the same thing at SeaLink too. The only difference being during that time in between SeaLink and NetFox, I was introduced to git.

Git is, in my opinion, a far superior "product" than SVN was, is or ever will be. It commits faster, it doesn't whinge (read: completely block you from committing) when you manually rm directories instead of using their propriatary rm command, and you can type one command to add in all new files, all changed files and your commit message in one fell swoop.

Git is incredibly fast. If there was a race between the speed of light and git, git would win. I had a race between git and svn out of interest for a work project, work's project took about<strong> 5 minutes</strong> to commit, whereas git took about <strong>30 seconds</strong>.

Need more reason? Okay then. Ever played around with svn propset in regards to setting svn:ignore. Ever realised how much of a pain in the ass it is? Me too! Wow. Git has this <strong>one file </strong>called .gitignore where you specify the relative path to the files to ignore. Say I have a log directory and I want all files in it with the extension .log. I would simply put "log/*.log" in my .gitignore file in the root of my project, and it would know what I'm talking about. "So what about two directories deep?", I hear your nasily voice ask. Oh, that's just log/**/*.log, effectively blocking any folder within the log (existing or not) from having any of their .log files commited.

But wait, there's more!

Remember those .svn directories? Yeah, all of them. There's only one for .git, and it's kept right where you'd expect it, in the root directory of the project. This was one of my personal huge gripes with svn. When you'd delete a folder without doing svn rm, it would delete the .svn folder contained within it. So you'd go to commit it, and SVN would <strong>block your commit</strong>. You know what git does? Git <strong>tells you</strong> that the file is gone, <strong>but still lets you commit everything.</strong> Yeah, I know it's awesome.

Tried merging and branching svn repositories? You're right, painful is not the right term. Excruciating does not even come close. Git does this beautifully. Type "git branch experimental" and it's there! Where experimental can be any name, I highly recommend naming them after characters from the Lord of the Rings series, or Star Wars. Wow, that was hard. Then you've got to checkout the new branch, "git checkout experimental". Now I'm working on the new branch. No seperate folder containing the branch code, I don't need one. Oh, and merging: "git merge 'your message' head experimental", and there you have it.

One final reason: Rails has moved away from SVN to git. Many rails plugins have also moved away. I personally hope SVN will die a quick and painful death, to be replaced with a better SCM.
