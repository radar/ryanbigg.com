---
wordpress_id: RB-1682370662
layout: post
title: Rails 7, Bootstrap CSS + JavaScript with ESBuild
---

Here's a short guide to setting up an existing Rails 7 application with Bootstrap, using ESBuild to build both the JavaScript and CSS files for Bootstrap.

First you'll want to install the `jsbundling-rails` gem:

```
bundle add jsbundling-rails
```

Next, you'll run the generator for this gem to setup ESBuild:

```
bin/rails javascript:install:esbuild
```

ESBuild will be setup to build assets in `app/javascript`, and put them into `app/assets/builds`. From there, Rails will be able to serve those assets.

To setup Bootstrap itself, we'll add Bootstrap and its dependencies, PopperJS and jQuery:

```
yarn add bootstrap @popperjs/core jquery
```

To use these dependencies, we will need to import them into our application's build entrypoint file, which is located at `app/javascript/application.js`. The lines that we need to add to this file to get Bootstrap loaded are:

```js
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
```

After this, we can build our application's assets by running:

```
yarn build
```

This will show us that it has built these assets:

```
yarn run v1.22.19
$ esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds --public-path=assets

  app/assets/builds/application.css      229.9kb
  app/assets/builds/application.js       186.9kb
  app/assets/builds/application.css.map  479.0kb
  app/assets/builds/application.js.map   356.7kb
```

ESBuild is smart enough here to know that we're bringing in a CSS asset in our JS file, and due to that it will generate _both_ a JS and a CSS file as assets. In addition to this, sourcemaps have been generated for both the CSS and JS files too.

To test that it's all working, we can generate a simple view:

```
rails g controller home index
```

And into `app/views/home/index.html.erb` we can put this HTML that I've "borrowed" from Bootstrap's own example:

```html
<div class="modal fade" id="exampleModalXl" tabindex="-1" aria-labelledby="exampleModalXlLabel" style="display: none;" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-4" id="exampleModalXlLabel">Extra large modal</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        ...
      </div>
    </div>
  </div>
</div>


<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalXl">Extra large modal</button>
```

When we start our Rails app with `bundle exec rails s` and go to http://localhost:3000/home/index, we'll see a blue button. When we click the blue button, the modal will appear:

![Modal](/images/css-bundling/bootstrap/modal.png)
