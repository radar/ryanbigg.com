--- 
wordpress_id: 317
layout: post
title: Ruby Quiz - Matricies
wordpress_url: http://frozenplague.net/?p=317
---
<pre lang='ruby'>
nb = 5
distance = Array.new(nb, Array.new(nb))
k = 0
(0...nb).each do |i|
  (0...nb).each do |j|
    distance[j][i] = k +=1
  end
end

puts distance.inspect
</pre>

This code should generate:
<span class='term'>[[1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,13,19,25], [5,10,15,20,25]]</span>

But generates:
<span class='term'>[[5,10,15,20,25], [5,10,15,20,25], [5,10,15,20,25], [5,10,15,20,25], [5,10,15,20,25]]</span>

I learned why today, and I wonder if anyone else knows.
