--- 
wordpress_id: RB-310
layout: post
title: Sprocket asset tags internals
---

Yesterday's post and twitter bitching caught the eye of our <a href='http://twitter.com/dhh'>fearless leader</a> who basically claimed <a href='https://twitter.com/#!/dhh/status/81987522766450688'>that I've not made documentation patches recently</a>. I responded with a small reminder that I've done <a href='https://twitter.com/ryanbigg/status/81988004947828736'>some documentation work</a> and went a step further and begun an <a href='http://ryanbigg.com/guides/asset_pipeline.html'>Asset Pipeline Guide</a> because I could. I could have pulled the whole "Don't you know who I am?!!" faux-lebrity deal, but I thought I would be humble. Append "for a change" to the end of the previous sentence, if you wish.

That was incredibly fun. We should do it again some time. Have your people call my people, we'll do lunch.

Before all that went down, I created a short (by my standards, anyway) <a href='https://gist.github.com/1032696'>Gist about how the `Sprockets::Railtie` class is currently set up in Rails</a>. This little Gist begun as short note taking for myself and I thought that maybe other people would find the information helpful, so I formatted it all pretty like.

After the *battle of the egos* took place, I delved a little deeper into the Sprockets rabbit hole, got defeated by some gnarly code and thought "fuck it dude, let's go <s>bowling</s> to sleep". I awoke this morning and delved a little deeper into exactly how all of this magic happens. So here goes.

Hopefully with this information, somebody else besides Josh Peek, Sam Stephenson, Yehuda Katz and (partially) myself can begin to understand how Sprockets works.

### Sprockets Asset Helpers

Within Rails 3.1, the behaviour of `javascript_include_tag` and `stylesheet_link_tag` are modified by the `actionpack/lib/sprockets/rails_helper.rb` file which is required by `actionpack/lib/sprockets/railtie.rb`, which itself is required by `actionpack/lib/action_controller/railtie.rb` and so on, and so forth.

This behaviour will be abstracted out into a gem called `sprockets-rails` by the time Rails 3.1 is released as final (or so I am informed by Yehuda), but the information within this short "note" / "guide" should not change in implementation at all.

The `Sprockets::Helpers::RailsHelper` is included into ActionView through the process described in my earlier [Sprockets Railtie Setup](https://gist.github.com/1032696) internals doc. Once this is included, it will override the `stylesheet_link_tag` and `javascript_include_tag` methods originally provided by Rails itself. Of course, if assets were disabled (`Rails.application.config.assets.enabled = false`) then the original Rails methods would be used and JavaScript assets would then exist in `public/javascripts`, not `app/assets/javascripts`. Let's just assume that you're using Sprockets.

Let's take a look at the `stylesheet_link_tag` method from `Sprockets::Helpers::RailsHelper`. The `javascript_include_tag` method is very similar so if you want to know how that works, just replace `stylesheet_link_tag` with `javascript_include_tag` using your *mind powers* and I'm sure you can get the gist of it.

#### What `stylesheet_link_tag` / `javascript_include_tag` does

This method begins like this: 

    def stylesheet_link_tag(source, options = {})
      debug = options.key?(:debug) ? options.delete(:debug) : debug_assets?
      body  = options.key?(:body)  ? options.delete(:body)  : false

The first argument for `stylesheet_link_tag` is `source` which specifies a file which can either be a straight CSS file or a manifest file which will be processed by Sprockets later. The method also takes some `options`, the two currently supported are `debug` and `body`.

The `debug` option will expand any manifest file into its contained parts and render each file individually. For example, in a project I have here, this line:

    <%= stylesheet_link_tag "application" %>

When a request is made to this page that uses this layout that renders this file, it will be printed as a single line:
    
    <link href="/assets/application.css" media="screen" rel="stylesheet" type="text/css" /> 

Even though the file it's pointing to contains *directives* to Sprockets to include everything in `app/assets/stylesheets`:

    *= require_self
    *= require_tree .

What sprockets is doing here is reading this manifest file and compiling all the CSS assets specified into one big fuck-off file and serving just that instead of the \*counts\* 13 CSS files I've got in that directory.

If `debug` is set to true for this though, either through `options[:debug]` being passed or by `debug_assets?` evaluating to `true`, this will happen:

    if debug && asset = asset_paths.asset_for(source, 'css')
      asset.to_a.map { |dep|
        stylesheet_link_tag(dep, :debug => false, :body => true)
      }.join("\n").html_safe
      
The `debug_assets?` method by the way is defined like this:

    def debug_assets?
      params[:debug_assets] == '1' ||
        params[:debug_assets] == 'true'
    end

If `?debug_assets=1` or `?debug_assets=true` is appended to the page (or the parameter is set some other way) then the assets will be "debugged".

Back to the code within `stylesheet_link_tag`, this snippet will get all the assets specified in the manifest file, iterate over each of them and render a `stylesheet_link_tag` for each of them, ensuring that `:debug` is set to false for them. 

It's important to note here that the CSS files that the original `app/assets/stylesheets/application.css` points to can each be their own manifest file, and so on and so forth.

If the `debug` option isn't specified and `debug_assets?` evaluates to `false` then the `else` for this `if` will be executed:

    else
      options = {
        'rel'   => "stylesheet",
        'type'  => "text/css",
        'media' => "screen",
        'href'  => asset_path(source, 'css', body)
      }.merge(options.stringify_keys)

      tag 'link', options
    end

This calls the `asset_path` method which is defined like this:

    def asset_path(source, default_ext = nil, body = false)
      source = source.logical_path if source.respond_to?(:logical_path)
      path = asset_paths.compute_public_path(source, 'assets', default_ext, true)
      body ? "#{path}?body=1" : path
    end

(WIP: I don't know what `logical_path` is for, so let's skip over that for now. In my testing, `source` has always been a `String` object).

This method then calls out to `asset_paths` which is defined at the top of this file:

    def asset_paths
      @asset_paths ||= begin
        config     = self.config if respond_to?(:config)
        controller = self.controller if respond_to?(:controller)
        RailsHelper::AssetPaths.new(config, controller)
      end
    end

This method (obviously) initializes a new instance of the `RailsHelper::AssetPaths` class defined later in this file, passing through the `config` and `controller` objects of the current content, which would be the same `self.config` and `self.controller` available within a view.

This `RailsHelper::AssetPaths` inherits behaviour from `ActionView::AssetPaths`, which is responsible for resolving the paths to the assets for vanilla Rails. The `RailsHelper::AssetPaths` overrides some of the methods defined within its superclass, though. 

The next method is `compute_public_path` which is called on this new `RailsHelper::AssetPaths` instance. This is defined simply:

    def compute_public_path(source, dir, ext=nil, include_host=true)
      super(source, 'assets', ext, include_host)
    end

This calls back to the `compute_public_path` within `ActionView::AssetsPaths` which is defined like this:


    def compute_public_path(source, dir, ext = nil, include_host = true)
      source = source.to_s
      return source if is_uri?(source)

      source = rewrite_extension(source, dir, ext) if ext
      source = rewrite_asset_path(source, dir)

      if controller && include_host
        has_request = controller.respond_to?(:request)
        source = rewrite_host_and_protocol(source, has_request)
      end

      source
    end

This method, unlike those in Sprockets, actually has decent documentation.

> Add the extension +ext+ if not present. Return full or scheme-relative URLs otherwise untouched.
> Prefix with `/dir/` if lacking a leading `/`. Account for relative URL
> roots. Rewrite the asset path for cache-busting asset ids. Include
> asset host, if configured, with the correct request protocol.

In this case, let's keep in mind that `source` is going to still be `"application"`. Therefore, the `rewrite_extension` and `rewrite_asset_path` methods will be called first.

The `rewrite_extension` method is actually overridden in `Rails::AssetPaths` like this:

    def rewrite_extension(source, dir, ext)
      if ext && File.extname(source).empty?
        "#{source}.#{ext}"
      else
        source
      end
    end
    
This method simply appends the correct extension to the end of the file (in this case, `ext` is set to `"css"` back in `stylesheet_link_tag`) if it doesn't have one already. If it does, then the filename will be left as-is.

The `rewrite_asset_path` method is also overridden in `Rails::AssetPaths`:

    def rewrite_asset_path(source, dir)
      if source[0] == ?/
        source
      else
        assets.path(source, performing_caching?, dir)
      end
    end

If the `source` argument (still `"application"`, remember?) begins with a forward slash, it's returned as-is. If not, then the `assets` method is called and then the `path` method is called on that. First up though, `performing_caching?` is one of the arguments of this method, and is defined like this:

    def performing_caching?
      @config ?  @config.perform_caching : Rails.application.config.action_controller.perform_caching
    end

Basically, if the application is configured to perform caching, then the second argument sent to `path` will be `true` and this modifies how this method acts. 

The `assets` method is defined just above `performing_caching?` in the `Sprockets::Helpers::RailsHelper`:

    def assets
      Rails.application.assets
    end

This points to the `assets` method, defined by a simple `attr_accessor` in `railties/lib/rails/application.rb`, but actually set up in `actionpack/lib/sprockets/railtie.rb` by calling `asset_environment`. To find out the juicy details of how that method works, read [the Gist I wrote yesterday](https://gist.github.com/1032696). Essentially, `assets` returns a `Sprockets::EnvironmentIndex` object.

The `path` method defined on this object is defined like this: 

    def path(logical_path, fingerprint = true, prefix = nil)
      if fingerprint && asset = find_asset(logical_path.to_s.sub(/^\//, ''))
        url = path_with_fingerprint(logical_path, asset.digest)
      else
        url = logical_path
      end

      url = File.join(prefix, url) if prefix
      url = "/#{url}" unless url =~ /^\//

      url
    end

If the file contains a "fingerprint" (an MD5 hash which is unique for this "version" of this file) then it will return a path such as `application-13e6dd6f2d0d01b7203c43a264d6c9ef.css`. We are operating in the development environment for now, and so this will simply return the `application.css` path we've come to know and love.

The final three lines of this method will append the `assets` prefix which has been passed in, so that our path now becomes `assets/application.css` and this will also prefix a forward-slash to this path, turning it into `/assets/application.css`.

This return value then bubbles up through `rewrite_asset_path` to `compute_public_path` to `asset_path` and finally back to the `stylesheet_link_tag` method where it's then specified as the `href` to the `link` tag that it renders.

And that, my friends, is all that is involved when you call `stylesheet_link_tag` within the development environment. Now let's look at what happens when we do the same thing, but in production.

#### Later, in production

In production, things work very similarly to the process just described except for (obviously) some key differences. In the production environment, `performing_caching?` will return `true` and therefore the `path` method in `Sprockets::EnvironmentIndex` will receive it's `fingerprint` argument as `true`, rather than `false`.

This means that this code in `path` inside `Sprockets::Environment` will be called:

    if fingerprint && asset = find_asset(logical_path.to_s.sub(/^\//, ''))
      url = path_with_fingerprint(logical_path, asset.digest)

In this case, `fingerprint` is going to be `true` so that part of the `if` will run. But what does `find_asset` do? Well, it takes the `logical_path` (in this case, just `application.css`), sans any single forward slash at the beginning. 

The `find_asset` method is defined in `sprockets/lib/environment.rb`:

    def find_asset(logical_path, options = {})
      logical_path = Pathname.new(logical_path)
      index = options[:_index] || self.index

      if asset = find_fresh_asset_from_cache(logical_path)
        asset
      elsif asset = index.find_asset(logical_path, options.merge(:_environment => self))
        @cache[logical_path.to_s] = asset
        asset.to_a.each { |a| @cache[a.pathname.to_s] = a }
        asset
      end
    end

The `logical_path` argument here is still going to be `"application.css"`. This method begins by converting `logical_path` into a `Pathname` object and setting up an `index` variable which is a `Sprockets::EnvironmentIndex` object.

First the asset is searched for in a cache with the `find_fresh_asset_from_cache` method, which is passed the now-`Pathname`'d `logical_path` argument. We don't know yet what this cache is, so let's look at what `find_fresh_asset_from_cache` is defined as:

    def find_fresh_asset_from_cache(logical_path)
      if asset = @cache[logical_path.to_s]
        if path_fingerprint(logical_path)
          asset
        elsif asset.stale?
          nil
        else
          asset
        end
      else
        nil
      end
    end

This `@cache` variable method is set up in the `expire_index!` method which actually serves two purposes: one is to initialize this cache when the `initialize` method for `Sprockets::Environment` is called. This happened way back when the `Sprockets::Railtie`'s `after_initialize` hook ran). The second is to clear this cache.

The moment, our `@cache` variable is going to be just an empty hash, and so the first `if` in this method will return nothing. The `asset` variable therefore won't be set, and so it will fall to the `else` which just returns `nil`

So that clears the `if` in `find_asset`, so then it goes to the `elsif` which, as a reminder, is defined like this:

    elsif asset = index.find_asset(logical_path, options.merge(:_environment => self))
      @cache[logical_path.to_s] = asset
      asset.to_a.each { |a| @cache[a.pathname.to_s] = a }
      asset
    end

This then falls down to the `index` (it's a `Sprockets::EnvironmentIndex` object, remember?) object, and the `find_asset` path defined on it. This is a *different* `find_asset` to the one that we saw before. That one was defined for `Sprockets::Environment` objects, where as this one is for a `Sprockets::EnvironmentIndex` object. This method is defined in `sprockets/lib/environment_index.rb` like this:

    def find_asset(path, options = {})
      options[:_index] ||= self

      pathname = Pathname.new(path)

      if pathname.absolute?
        build_asset(detect_logical_path(path).to_s, pathname, options)
      else
        logical_path = path.to_s.sub(/^\//, '')

        if @assets.key?(logical_path)
          @assets[logical_path]
        else
          @assets[logical_path] = find_asset_in_static_root(pathname) ||
            find_asset_in_path(pathname, options)
        end
      end
    end

This method receives the `path` argument which is still the `String` `"application.css"`. This method makes a new `Pathname` object out of that `path` and then calls `absolute?` on it. The pathname is absolute if it begins with a preceding slash, but in this case it doesn't have one, and so it will fall to the `else` in this method.

This begins by removing any slash at the beginning of the path, but ours doesn't have one and so it will be left as is. The `@assets` variable is set up in the `initialize` method of `Sprockets::EnvironmentIndex`, and is just an empty `Hash` object at this stage. This means that this `@assets` hash would not contain the key of `"application.css"` at this point, and so it will go to the `else` for `@assets.key?(logical_path)`. 

Inside this `else`, Sprockets sets that `@assets[logical_path]` variable so that it doesn't have to find it again. To find that particular asset though, it first looks in a static root using `find_asset_in_static_root` and if it can't find one there then looks for it using `find_asset_in_path`.

Let's see what `find_asset_in_static_root` does first. This method is actually defined in `sprockets/lib/static_compliation.rb` and begins with these two lines:

    def find_asset_in_static_root(logical_path)
      return unless static_root

If `static_root` isn't set then this method will return nothing. So is this set? The method is defined at the top of `Sprockets::StaticCompilation` like this:

    def static_root
      @static_root
    end

But where is this `@static_root` variable set? If we look just underneath this `static_root` definition there's a `static_root=` definition which cleans the index and sets this variable:

    def static_root=(root)
      expire_index!
      @static_root = root
    end

This `static_root=` method is called when `Sprockets::EnvironmentIndex` is initialized, using this line:

      @static_root = static_root ? Pathname.new(static_root) : nil

The `EnvironmentIndex` object was initialized earlier when the `index` method was called on the `Sprockets::Environment` object. It does this:

    def index
      EnvironmentIndex.new(self, @trail, @static_root)
    end

This `@static_root` variable is set up when the `after_initialize` hook sets up the `Sprockets::Environment` object, in `Sprockets::Railtie` using this line:

    env.static_root = File.join(app.root.join("public"), assets.prefix)

The `assets` object here is the `Rails.application.config.assets` object set up in `railties/lib/rails/application/configuration.rb`, with the `prefix` method on it returning simply `/assets`. This means that the `env.static_root` will result in a path that points at the `public/assets` directory within the application.

This means that the `static_root` method back in `find_asset_static_root` is actually going to return a value and so the method will continue past this point. The next two lines in this method are these:

    pathname   = Pathname.new(static_root.join(logical_path))
    attributes = attributes_for(pathname)
 
The `logical_path` is still going to be `"application.css"`, and in this case it's going to be appended to the end of `static_path`, making the output something like `[Rails.root]/public/assets/application.css` and turning that into a `Pathname` object.

Next, the `attributes_for` method is called on this new `Pathname` object. This method is defined like this:

    def attributes_for(path)
      AssetAttributes.new(self, path)
    end

The `AssetAttributes` class is actually `Sprockets::AssetAttributes`. This class serves the purpose of providing several helper methods, some of them which we'll see in just a bit, for the assets of this application. The `initialize` method for this class is defined like this:

    def initialize(environment, path)
      @environment = environment
      @pathname = path.is_a?(Pathname) ? path : Pathname.new(path.to_s)
    end


The `environment` passed in is the `Sprockets::Environment` object we've been dealing with for a while now, and the `path` is the newly-initialized `Pathname` object set up just before `attributes_for` is called. No particularly big bit of magic going on here.

