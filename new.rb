#!/usr/bin/env ruby

# Script to create a blog post using a template. It takes one input parameter
# which is the title of the blog post
# e.g. command:
# $ ./new.rb "helper script to create new posts using jekyll"
#
# Original Author:Khaja Minhajuddin (http://minhajuddin.com)
# Modifications by Ryan Bigg

# Some constants

require 'rubygems'
require 'bundler/setup'
require 'active_support/core_ext/string'

TEMPLATE = "template.markdown"
TARGET_DIR = "_posts"

# Get the title which was passed as an argument
title = ARGV[0]
# Get the filename
filename = title.parameterize
filename = "#{Time.now.strftime('%Y-%m-%d')}-#{filename}.markdown" 
filepath = File.join(TARGET_DIR, filename)

# Create a copy of the template with the title replaced
new_post = File.read("_layouts/" + TEMPLATE)
new_post.gsub!('TITLE', title);
new_post.gsub!('RB-ID', "RB-" + (Dir["_posts/*.markdown"].count + 11).to_s)

# Write out the file to the target directory
new_post_file = File.open(filepath, 'w')
new_post_file.puts new_post
new_post_file.close

puts "created => #{filepath}"
