--- 
wordpress_id: 528
layout: post
title: "How Rails Works #2: Mime Types & respond_to"
wordpress_url: http://frozenplague.net/?p=528
---
<strong>THIRD COPY</strong>
 <a href='http://github.com/radar/how-rails-works'>This guide is available on Github</a>

<h3>A Refresher</h3>

`respond_to` is a method that defines different formats that your actions, well, respond to. For those who are unfamiliar with `respond_to` or simply forgot about it, here's a refresher.

Take this example:

<pre>
class BlogsController < ApplicationController
  def index
    @blogs = Blog.all(:limit => 10)
    respond_to do |format|
      format.html
      format.xml
    end
  end
end
</pre>

It's an index action in a controller called `BlogsController` and we have a collection of `Blog` objects stored in `@blogs`. We then call `respond_to` and specify the block with a single argument of `format`. On `format` we call `html` and `xml` which will render <em>app/views/blogs/index.html.erb</em> and <em>app/views/blogs/index.xml.erb</em> respectively. In those templates we can iterate over the `@blogs` collection and do whatever with it that we fancy. There's a shorter way to write the `respond_to` for this:

<pre>
respond_to :html, :xml
</pre>
If we want some formats to respond one way, and some others to respond another way we can do this:

<pre>
respond_to do |format|
  format.html { @blogs = Blog.all(:limit => 10) }
  format.any(:atom, :rss) { @blogs = Blog.all }
end
</pre>

 
In this example <em>index.html.erb</em>'s `@blogs` will contain 10 objects, where <em>index.atom.erb</em>'s and <em>index.rss.erb</em>'s `@blogs` will contain all the blogs record. 

<h3>Diving In</h3>
My first post in this series was my Timezone Overview for Rails 2.2. Today I would like to cover how mime types and `respond_to` work in Rails 2.3. The reason I choose both of these instead of just `respond_to` is because they tie in close together. 

I've tried to make all the methods in this guide clickable with links to the source on Github.

Firstly I'll talk about <a href='http://en.wikipedia.org/wiki/MIME_type'>MIME types</a> in Rails.

The default MIME types are loaded when Rails starts up by <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_type.rb#L212'>the final line in <em>actionpack/lib/action_controller/mime_type.rb</em></a>:

<pre>
require 'action_controller/mime_types'
</pre>
  
This loads the <em><a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_types.rb#L4-21'>actionpack/lib/action_controller/mime_types.rb</a></em> file and registers the default MIME types:

<pre>
Mime::Type.register "*/*", :all
Mime::Type.register "text/plain", :text, [], %w(txt)
Mime::Type.register "text/html", :html, %w( application/xhtml+xml ), %w( xhtml )
Mime::Type.register "text/javascript", :js, %w( application/javascript application/x-javascript )
Mime::Type.register "text/css", :css
Mime::Type.register "text/calendar", :ics
Mime::Type.register "text/csv", :csv
Mime::Type.register "application/xml", :xml, %w( text/xml application/x-xml )
Mime::Type.register "application/rss+xml", :rss
Mime::Type.register "application/atom+xml", :atom
Mime::Type.register "application/x-yaml", :yaml, %w( text/yaml )

Mime::Type.register "multipart/form-data", :multipart_form
Mime::Type.register "application/x-www-form-urlencoded", :url_encoded_form

# http://www.ietf.org/rfc/rfc4627.txt
# http://www.json.org/JSONRequest.html
Mime::Type.register "application/json", :json, %w( text/x-json application/jsonrequest )  
</pre>
  

You may recognise the syntax used in <em>mime_types.rb</em> from your app's <em>config/initializers/mime_types.rb</em>. This file is used to define new MIME types for your application and is loaded on initialization of your application by <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/railties/lib/initializer.rb#L174'>this line in initializer.rb</a>

<pre>load_application_initializers</pre>

and <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/railties/lib/initializer.rb#L597-603'>the corresponding `load_application_initializers` method</a>:
 
<pre>
def load_application_initializers
  if gems_dependencies_loaded
    Dir["#{configuration.root_path}/config/initializers/**/*.rb"].sort.each do |initializer|
      load(initializer)
    end
  end
end
</pre>
  
which is responsible for loading all your application's initializers, including <em>config/initializers/mime_types.rb</em>.

The MIME types defined by Rails and your initializers are the methods that you call on the block object `format` or the symbols that you pass to respond_to. You may recognise these from the symbols passed to the `Mime::Type.register` calls earlier.

<a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_responds.rb#L102-109'>`respond_to`</a>'s code may look a bit intimidating at first but it's not really all that bad:

<pre>
def respond_to(*types, &amp;block)
  raise ArgumentError, "respond_to takes either types or a block, never both" unless types.any? ^ block
  block ||= lambda { |responder| types.each { |type| responder.send(type) } }
  responder = Responder.new(self)
  block.call(responder)
  responder.respond
end
</pre>

If we use the block syntax this will just `call` the `block` object with the argument of `responder` which is defined as `Responder.new`.

If we use the single line syntax. this will just pass in the types as an array. This method then defines a `lambda` which is a `Proc` object just like a usual block. This takes one argument, called `responder` and then calls the types on the responder object.

The `||=` on the block definition means "set this variable only if it hasn't been set already". The next line is defining the `responder` object which triggers <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_responds.rb#L102-109'>`initialize` method for `Responder`</a>:

<pre>
class Responder
  def initialize(controller)
    @controller = controller
    @request    = controller.request
    @response   = controller.response
  
    if ActionController::Base.use_accept_header
      @mime_type_priority = Array(Mime::Type.lookup_by_extension(@request.parameters[:format]) || @request.accepts)
    else
      @mime_type_priority = [@request.format]
    end

    @order     = []
    @responses = {}
  end
  ...
end
</pre>

This defines a couple of key variables, namely `@mime_type_priority` and `@responses`.

The first, `@mime_type_priorty` calls <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/mime_type.rb#L69-71'>`Mime::Type.lookup_by_extension(@request.parameters[:format])`</a> which looks like:

<pre>
def lookup_by_extension(extension)
  EXTENSION_LOOKUP[extension]
end
</pre>

`EXTENSION_LOOKUP` is <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/mime_type.rb#L5'>defined on line #5 of mime_type.rb</a> as a hash:

<pre>
EXTENSION_LOOKUP = Hash.new { |h, k| h[k] = Type.new(k) unless k.blank? }
</pre>  

 What happens when a key is looked for on this hash it calls `Mime::Type.new(key)` which calls the <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/mime_type.rb#L147-150'>`initialize`</a> method for `Mime::Type`:

<pre>
def initialize(string, symbol = nil, synonyms = [])
  @symbol, @synonyms = symbol, synonyms
   @string = string
end
</pre>

We eventually understand that all our original `@mime_type_priority` is simply a `Mime::Type` object. If we requested HTML, the MIME type would be: `#&lt;Mime::Type:0x2624380 @synonyms=["application/xhtml+xml"], @symbol=:html, @string="text/html"&gt;`. This element is made into an array and then used in the `respond` method.

The second variable, `@responses` is defined as an empty hash. The magic happens in the `respond` method:

<pre>
def respond
  for priority in @mime_type_priority
    if priority == Mime::ALL
      @responses[@order.first].call
      return
    else
      if @responses[priority]
        @responses[priority].call
        return # mime type match found, be happy and return
      end
    end
  end

  if @order.include?(Mime::ALL)
    @responses[Mime::ALL].call
  else
    @controller.send :head, :not_acceptable
  end
end
</pre>

This method iterates over `@mime_type_priority` and then checks firstly if the element is a `Mime::ALL` This can be achieved by making the format of the URL "all", such as <em>http://localhost:3000/blogs.all</em>. If the element is not `Mime::ALL` this continues iterating through until it finds a format that is defined. It does this by checking if there is a key in the `@responses` hash... but it's empty. So I first thought, too. <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_responds.rb#L157-159'>Buried just over halfway is this method</a> which is called when the file is loaded and this calls <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_responds.rb#L147-155'>`generate_method_for_mime`</a> which does some funky `class_eval`'ing:

<pre>
def self.generate_method_for_mime(mime)
  sym = mime.is_a?(Symbol) ? mime : mime.to_sym
  const = sym.to_s.upcase
  class_eval &lt;&lt;-RUBY, __FILE__, __LINE__ + 1
    def #{sym}(&amp;block)                # def html(&amp;block)
      custom(Mime::#{const}, &amp;block)  #   custom(Mime::HTML, &amp;block)
    end                               # end
  RUBY
end
</pre>

Remember back when we were calling `responder.send(type)`? This is what it calls, this generated method.

The generated methods take an optional block, as shown by the code for <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_controller/mime_responds.rb#L127-137'>`custom`</a>:

<pre>
def custom(mime_type, &amp;block)
  mime_type = mime_type.is_a?(Mime::Type) ? mime_type : Mime::Type.lookup(mime_type.to_s)

  @order &lt;&lt; mime_type

  @responses[mime_type] ||= Proc.new do
    @response.template.template_format = mime_type.to_sym
    @response.content_type = mime_type.to_s
    block_given? ? block.call : @controller.send(:render, :action => @controller.action_name)
  end
end
</pre>

If the first argument given to custom is not a `Mime::Type` object then it will do a lookup and find it. The method will then concatenate into `@order` `mime_type`. This variable is used for when `Mime::ALL` is specified as the mime type, it will use the first one in this list, which will be the first one you've called in your `respond_to`. If you've define your respond_to like this:

<pre>
def index
  @blogs = Blog.all(:limit => 10)
  respond_to do |format|
    format.html 
    format.json { render :json => @blogs }
    format.any(:atom, :xml) { @blogs = Blog.all }
  end
end
</pre>

The `all` will call `html` because it was defined first. Following on with this example, the `format.html` method isn't passed a block, but the `format.xml` is. This determines what this line does in `custom`:

<pre>
block_given? ? block.call : @controller.send(:render, :action => @controller.action_name)
</pre>

When we don't pass a block for the `format.html` it will render the action, looking for <em>index.html.erb</em> which, in the default scaffold, will list all the blogs. Rails does this by calling:

<pre>
@controller.send(:render, :action => @controller.action_name)
</pre>

It calls `send` because `render` is a protected method. This passes a single argument to render, `{ :action => @controller.action_name }` which in this example is "index". <a href='>http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/base.rb#L859-946'>`render` is a pretty heavy method</a>, weighing in at close to 100 lines, so I won't bore you with all the details of this method in this post. What I will show you is the part where it processes our <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/base.rb#L907-908'>`:action`</a> option:

<pre>
elsif action_name = options[:action]
  render_for_file(default_template(action_name.to_s), options[:status], layout)
</pre>

The method we're interested here is not `render_for_file` but <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/base.rb#L1318-1320'>`default_template`</a>:

<pre>
def default_template(action_name = self.action_name)
  self.view_paths.find_template(default_template_name(action_name), default_template_format)
end
</pre>

This calls a number of methods, but what we're interested in here firsty is the <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/layout.rb#L276-278'>`default_template_format`</a> method. This method looks like this:

<pre>
def default_template_format
  response.template.template_format
end
</pre>

and <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_view/base.rb#L265-273'>`template_format`</a> looks like:

<pre>
def template_format
  if defined? @template_format
    @template_format
  elsif controller &amp;&amp; controller.respond_to?(:request)
    @template_format = controller.request.template_format.to_sym
  else
    @template_format = :html
  end
end
</pre>

Our request will match the <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_view/base.rb#L268-269'>`elsif`</a> in this code which will call another <a href='http://github.com/rails/rails/blob/a2270ef2594b97891994848138614657363f2806/actionpack/lib/action_controller/request.rb#L193-203'>`template_format`</a> method, this time on the `request` object of our controller. This method looks like this:

<pre>
def template_format
  parameter_format = parameters[:format]
  if parameter_format
    parameter_format
  elsif xhr?
    :js
  else
    :html
  end
end
</pre>

Yes! After all this time it does call `parameters[:format]`! This is also known as `params[:format]` and, to the well trained `"html"`. So way back in our initial `default_template` call:

<pre>
def default_template(action_name = self.action_name)
  self.view_paths.find_template(default_template_name(action_name), default_template_format)
end
</pre>

We were firstly interested in `default_template_format` which is what we just covered. Now we're interested in <a href='http://github.com/rails/rails/blob/35c5727acea882f4cef2a8a2d12d87a8fda045c8/actionpack/lib/action_view/paths.rb#L43-67'>`find_template`</a>:

<pre>
def find_template(original_template_path, format = nil, html_fallback = true)
  return original_template_path if original_template_path.respond_to?(:render)
  template_path = original_template_path.sub(/^\//, '')

  each do |load_path|
    if format &amp;&amp; (template = load_path["#{template_path}.#{I18n.locale}.#{format}"])
      return template
    elsif format &amp;&amp; (template = load_path["#{template_path}.#{format}"])
      return template
    elsif template = load_path["#{template_path}.#{I18n.locale}"]
      return template
    elsif template = load_path[template_path]
      return template
    # Try to find html version if the format is javascript
    elsif format == :js &amp;&amp; html_fallback &amp;&amp; template = load_path["#{template_path}.#{I18n.locale}.html"]
      return template
    elsif format == :js &amp;&amp; html_fallback &amp;&amp; template = load_path["#{template_path}.html"]
      return template
    end
  end

  return Template.new(original_template_path) if File.file?(original_template_path)

  raise MissingTemplate.new(self, original_template_path, format)
end
</pre>

Nothing inside the `each` block will match, so it will not return anything. Instead, what is returned is the line after the each block:

<pre>
  return Template.new(original_template_path) if File.file?(original_template_path)
</pre>

This returns a Template object like this:

<pre>
#&lt;ActionView::Template:0x2193258 @format=nil, @base_path=nil, @template_path="blogs/", @extension=nil, @locale=nil, @name=nil, @load_path=nil&gt;
</pre>

<a href='http://github.com/rails/rails/blob/8fa4275a72c334fe945dada6113fa0153ca28c87/actionpack/lib/action_controller/base.rb#L1239-1243'>`render_for_file`</a> takes this object and uses it to render the appropriate template that the user requested.

When we do pass a block to our `format.xml`, this is much simpler in the call to <a href='http://github.com/rails/rails/blob/8fa4275a72c334fe945dada6113fa0153ca28c87/actionpack/lib/action_controller/base.rb#L945-947'>`render`</a>:

<pre>
elsif xml = options[:xml]
  response.content_type ||= Mime::XML
  render_for_text(xml.respond_to?(:to_xml) ? xml.to_xml : xml, options[:status])
end
</pre>

This code calls <a href='http://github.com/rails/rails/blob/dd2ed32418a74ca9126834f98a1b0bca926c0c4f/activerecord/lib/active_record/serializers/xml_serializer.rb#L154-157'>`to_xml`</a> on our collection and converts it to an XML document.

Finally, the <a href='http://github.com/rails/rails/blob/4b68debb1c4d3d272b237049c88d01b1eceb58f0/actionpack/lib/action_controller/mime_responds.rb#L139-145'>`any`</a> is another method defined on the `Responder` object. You can pass to this a collection of mime types and for these mime types it will perform the block. In this example we've used:

<pre lang='rails'>
  format.any(:atom, :xml) { @blogs = Blog.all }
</pre>

but you can also do:

<pre lang='rails'>
  format.any { @blogs = Blog.all }
</pre>

which will define the response for all currently undefined mime types.

`any` goes a bit like this:

<pre lang='rails'>
def any(*args, &amp;block)
  if args.any?
    args.each { |type| send(type, &amp;block) }
  else
    custom(@mime_type_priority.first, &amp;block)
  end
end 
</pre>

We've passed args to ours, so it'll just call the methods `atom` and `xml` on the `Responder` object and then render the appropriate views for these. 

If we don't pass arguments to `any`, any MIME type that we don't have a `respond_to` line for will call the `any` block instead. Take for example, if we had this:

<pre>
def index
  @blogs = Blog.all(:limit => 10)
  respond_to do |format|
    format.html 
    format.json { render :json => @blogs }
    format.any { @blogs = Blog.all }
  end
end
</pre>

And we requested an XML page, http://localhost:3000/blogs.xml, this will trigger the code in the `any` block to be ran.

So that wraps up this guide on respond_to. Thanks for reading!
