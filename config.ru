require 'yaml'
require 'rubygems'
require "rack/jekyll"

class GitHook
  def initialize(app)
    @app = app
  end
  
  def call(env)
    if env["REQUEST_URI"] =~ /\/commit$/
      output = `git pull origin master`
      [200, { "Content-Type" => "text/plain"}, ["Pull complete.<br><pre>#{output}</pre>"]]
    else
      @app.call(env)
    end
  end
end

app = Rack::Builder.new do
  use GitHook
  run Rack::Jekyll.new
end.to_app

run app



