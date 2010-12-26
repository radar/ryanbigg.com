--- 
wordpress_id: 666
layout: post
title: Adding Your Own Differ to RSpec
wordpress_url: http://frozenplague.net/?p=666
---
Recently I <a href='https://rspec.lighthouseapp.com/projects/5645/tickets/848-diff_as_hash'>added diff_as_hash to rspec</a> and I'd like to show you what I did, so you can add your own differs, and it's only a couple of lines of code. You can edit your own local gem copy of rspec using the find_gem gem's edit_gem command.

Let's use the example that you want to add a BigDecimal differ.

<h3><em>lib/spec/expectations/fail_with.rb</em></h3>

First of all you're going to need to add a line to this file, something that looks like the lines here, along with the other <span class='term'>elsif</span>s:

<script src="http://gist.github.com/148909.js"></script>

<h3><em>lib/spec/runner/differs/default.rb</em></h3>

Secondly, in this file inside the <span class='term'>Spec::Expectations::Differs::Default</span> class you'll have to define your <span class='term'>diff_as_big_decimal</span> differ:

<script src="http://gist.github.com/148912.js"></script>

Now when you diff BigDecimal numbers in your rspec tests, you'll see this output, rather than the ugly output.

However, what would be nicer is if you could expand on this diffing syntax in your own project, rather than having to hack rspec and have it wiped next time you upgrade. More on that later though.




