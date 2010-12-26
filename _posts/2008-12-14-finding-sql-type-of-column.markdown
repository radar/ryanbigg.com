--- 
wordpress_id: 399
layout: post
title: "Finding SQL Type of Column "
wordpress_url: http://frozenplague.net/?p=399
---
<a href="http://rails.loglibrary.com/chats/15238428/excerpt">exlibris</a> asked tonight in #rubyonrails how to find the type of a column in the table for a model. I didn't know this and maybe someone else out there may not know how either. The solution lies within the <a href="http://api.rubyonrails.org/classes/ActiveRecord/Base.html#M001995"><span class="term">columns_hash</span></a> method from <span class="term">ActiveRecord:Base</span> which returns a hash containing all kinds of useful information about all the columns in your table such as:
<ul>
	<li>Precision (integer, notes the precision of the column if it's decimal-based)</li>
	<li>Primary (boolean, identifies if column is primary key)</li>
	<li>default</li>
	<li>limit (integer, denotes how long the field can be)</li>
	<li>type (symbol, the class type in lowercase)</li>
	<li>name (string, fairly obvious)</li>
	<li>null (boolean, identifies if column can be set to null)</li>
	<li>scale (integer, does something)</li>
	<li>sql_type (returns the sql type of the column)</li>
</ul>
That final column is the magic attribute we're looking for. To get to it we access it like <span class='term'>Model.columns_hash["attribute"].sql_type</span>
