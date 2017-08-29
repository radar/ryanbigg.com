---
wordpress_id: RB-1503872748
layout: post
title: Rails, Dropzone.js, Amazon S3 and imgix
---

In this tutorial I'll cover how you can upload files directly to S3 by using a feature called `PresignedPost`. I'll then show how you can use [imgix](https://imgix.com) to resize these images dynamically after they've been uploaded.

The Rails app that I use for this tutorial is [dropzone-example](https://github.com/radar/dropzone-example), with the [finished branch](https://github.com/radar/dropzone-example/tree/finished) being the final version of the code from this tutorial.

### Background

I've got a small hobby Rails app that I use to share photos with my extended family. This app had humble beginnings: it was a very light Rails application with one model that used [Paperclip](https://rubygems.org/gems/paperclip) to handle the attachments. Paperclip works very well, and I especially love that I don't have to care about _how_ my photos get resized; Paperclip just does it -- as long as you have the right things installed.

I got the attachments through to Paperclip by using the wonderful [Dropzone.js](http://www.dropzonejs.com/). A simple file input would also work, but I wanted to be able to upload multiple files from all kinds of devices. Dropzone lets me do that.

But then I wanted to add video support to this application. It's at this point that I should mention three things: 1) this application is hosted on Heroku 2) Heroku's request timeout is set to a hard 30 seconds 3) Australian internet is prohibitively slow and iPhone videos are so big that any video longer than 25 seconds does not upload within that 30 second window.

So I had to come up with an inventive solution. Googling for other people's attempts to solve or workaround this problem suggest that the best solution was to upload to s3 directly; but then I would lose the automatic resizing for images that comes with Paperclip. Fortunately, I knew about [imgix](https:/imgix.com).

A lot of the other writings on the internet don't really cover it from start-to-finish, and so I pieced all this together from many, many blog posts and documentation pages.

Contrary to my tweet earlier:

<blockquote class="twitter-tweet" data-lang="en-gb"><p lang="en" dir="ltr">Hooked up dropzone + s3 direct file uploads and now I&#39;m going to keep all that knowledge to myself mwhahahaha</p>&mdash; A Ryan (@ryanbigg) <a href="https://twitter.com/ryanbigg/status/901668466599510017">27 August 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

I'm not going to keep all this knowledge to myself, but instead I'll share with you how I did it here.

### Dropzone setup

I'm going to assume that people reading this already have at least a Rails application setup and they want to add this functionality to it. I've got a [small example app](https://github.com/radar/dropzone-example) with dropzone added, if you want to take a look.

I'm going to go old-school on this: no Webpacker, no React. If you want those things I am sure you can figure it out.

To start with, you can download the Dropzone files from the Download link in the [project's README](https://gitlab.com/meno/dropzone/blob/master/README.md). This will download the latest release. Extract this zip, and then move `dropzone.css` into `vendor/assets/stylesheets/dropzone.css`, and `dropzone.js` into `vendor/assets/javascripts/dropzone.js`. These two files will need to be required in both `application.scss` and `application.js`:

**application.scss**

```
*= require dropzone
```

**application.js**

```
//= require dropzone
```

Then wherever you want the dropzone to appear, put this code:

**app/views/uploads/new.html.erb**

```erb
<%= form_tag uploads_path, class: "dropzone", id: "uploader" do %>

<% end %>
```

The `dropzone` class is the special bit here: Dropzone will automatically apply itself to any element with this class. If you've done this correctly, you'll see this:

![Test](/images/dropzone/drop-files-to-upload.png)

The styling isn't exactly pretty, but that's something you can fix up later. ([Here's the CSS](https://gist.github.com/radar/4e2957edf84efb40e222b43439e772a1) that I use for my own; I think I cribbed it from the Dropzone site.)

What this will do is submit files to the `uploads_path`, as if there was a file input and we had selected a file and hit "submit". If we had a controller action to receive these files, it might look something like this:

```ruby
def create
  Photo.create!(photo: params[:file])

  head :ok
end
```

This action would use Paperclip to do the processing and resizing. The configuration in the `Photo` model would look like:

```ruby
has_attached_file :photo,
  styles: { small: "250x250#", large: "1000x1000#"}
```

This would all result in the files being stored locally, in the `public/system` directory of the application. This might suit some, but for an application hosted on Heroku it is a terrible idea, because Heroku's filesystem is read-only; your uploads would fail.

So let's assume that this application is going to be hosted on Heroku. That means that we need to find somewhere else to host our files, and one very good place for that is Amazon S3.

### Upload direct to S3

There's an interim step here where you could configure Paperclip to upload the files to S3 after it has finished processing them on the server. In fact, there's a [great Heroku tutorial](https://devcenter.heroku.com/articles/paperclip-s3) demonstrating just that.

However, as I mentioned at the beginning, we're looking to upload files _directly_ to s3 to avoid Heroku's 30 second timeout. The Rails app may not have time to process the upload before the timeout if the file is sufficiently large enough. Therefore configuring Paperclip in this way won't suit us. What we'll do instead is upload this file directly to S3.

**I will assume at this stage that you've setup an AWS account and at least one S3 bucket to receive uploads into. I will also assume that you know what an AWS access key and AWS secret key are. If you haven't configured these things, then go ahead and do that now.**

**I highly recommend creating a new user that only has read + write access to S3, and even then that access is limited to just this bucket. Your default user has _all_ the permissions, and so if your keys leaked then someone could access your entire AWS account. Be careful.**

To let users upload to our application, we'll need to use an S3 feature called a [_presigned post_](http://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html). S3 Buckets by default are not writeable by the general public. In this particular case, we _do_ want the general public to upload files to our bucket.

This feature will allow us to generate a URL and some fields for our upload form. The combination of this URL and these fields will allow regular users of our application to upload files straight to our S3 bucket.

To use any AWS feature in our application, we first need to add the `aws-sdk` gem to our Gemfile:

```ruby
gem 'aws-sdk', '~> 2'
```

We can use this gem to generate a presigned post, but before that we need to setup some credentials within our application. I like to use the [dotenv-rails](https://rubygems.org/gems/dotenv-rails) gem for this purpose:

```ruby
gem 'dotenv-rails'
```

This gem will load any environment variable specified in an `.env` file. Let's create one of those now with these values:

```
AWS_ACCESS_KEY_ID=[your access key goes here]
AWS_SECRET_KEY=[your secret key goes here]
AWS_REGION=[your region name goes here]
AWS_BUCKET=[your bucket name goes here]
```

**NOTE: Make sure to add this `.env` file to `.gitignore`. You don't want to commit your AWS access keys!**

Now let's go ahead and generate a presigned post in the Rails console:

```ruby
resource = Aws::S3::Resource.new
post = resource.bucket(ENV.fetch("AWS_BUCKET")).presigned_post(
  key: "uploads/#{Time.now.to_i}/${filename}"
)
```

The `aws-sdk` gem will automatically reference the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_KEY` and `AWS_REGION` keys from the environment to correctly configure itself. If you don't believe me, try these three methods:

```ruby
resource.client.config.credentials.access_key_id
resource.client.config.credentials.secret_access_key
resource.client.config.region
```

They will return the same values as specified in `.env`, if you've configured all the above correctly.

Let's go back and look at what that `post` is. It's an instance of `Aws::S3::PresignedPost`, and it has two main methods that you need to know about: `url` and `fields`.

The `url` method is easy: it returns the URL to the bucket that will contain your uploaded files. Something like `https://[bucket].s3-[region].amazonaws.com`. Yours might be slightly different depending on the region you specified.

The `fields` method is a little more complicated. It will return a hash with the following keys:

* `key`: The path where the file will live. We specified a timestamp and `${filename}` here. The `${filename}` part will be replaced by the name of the actual file when it has been uploaded.
* `policy`: A Base64 encoded JSON blob, listing the policy for this post. For more info, [read here](http://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html).
* `x-amz-credential`: Specifies the access key used, the current date, and the scope to where this particular credential is used.
* `x-amz-algorithm`: The encryption algorithm used to generate the signature.
* `x-amz-date`: Today's date.
* `x-amz-signature`: The "signed" part of the request. A unique signature which verifies this request. For information on how this is constructed, [read this](http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html#query-string-auth-v4-signing).

When we're building our form, we need to use both the `url` and the `fields` parts of this `PresignedPost`. The combination of these two things will authenticate users with AWS and allow them to put files in our S3 buckets. We must generate the `PresignedPost` object server-side first, which we can do in our `UploadsController`:

```ruby
class UploadsController < ApplicationController
  def new
    s3 = Aws::S3::Resource.new
    @post = s3.bucket(ENV.fetch('AWS_BUCKET')).presigned_post(
      key: "uploads/#{Time.now.to_i}/${filename}",
      allow_any: ['utf8', 'authenticity_token'],
      acl: "authenticated-read",
    )
  end
end
```

We're generating that `PresignedPost` here the same way as we've done in the console, with two small differences: we're using an `allow_any` and an `acl` key.

Rails forms automatically insert two fields called `utf8` and `authenticity_token`. AWS uses the fields of the request to build the signature, and if any extra fields are added to the request then that may alter the signature. By using `allow_any` here, we're saying that it's OK for these fields to be _present_, and we don't -- and AWS shouldn't -- necessarily care about what those fields' values are.

If we didn't specify this `allow_any` key, our upload would fail with a "403 Forbidden" status, and the response body would say:

```xml
<Error>
  <Code>AccessDenied</Code>
    <Message>Invalid according to Policy: Extra input fields: utf8</Message>
    ...
</Error>
```

By setting up this little bit of configuration now, we avoid those issues later on.

The `acl` key will configure our uploaded objects permissions in such a way that only signed S3 requests can read those files.

Now with the `PresignedPost` generated server-side, we're going to need to change our upload form to use that `PresignedPost`'s `url` and `fields`. Let's change `app/views/uploads/new.html.erb` to this:

```erb
<%= form_tag @post.url, class: "dropzone", id: "uploader" do %>
  <% @post.fields.each do |key, value| %>
    <%= hidden_field_tag key, value %>
  <% end %>
<% end %>
```

These simple changes will now use the `PresignedPost` object's `url` and `fields` to build out our form. When files are uploaded, they will go to the S3 bucket that we specified with `AWS_BUCKET` in `.env`.

There's one more small configuration change that we need to make on the AWS side of things before this will all work, and that's CORS (Cross-Origin Resource Sharing). Open up your S3 bucket in the AWS console, go to Permissions, and then CORS Configuration and paste in this:

```xml
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>

   <AllowedMethod>PUT</AllowedMethod>
   <AllowedMethod>POST</AllowedMethod>
   <AllowedMethod>GET</AllowedMethod>

   <AllowedHeader>*</AllowedHeader>
 </CORSRule>
</CORSConfiguration>
```

You may want to set the `AllowedOrigin` to your website here; I've just left it as an asterisk to make it easier for myself. This configuration allows any authenticated website's users to issue `PUT`, `POST` and `GET` requests to this S3 bucket. If we tried to do an upload without this configuration, we would see an error that said:

> XMLHttpRequest cannot load https://[bucket].s3-[region].amazonaws.com/. Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access. The response had HTTP status code 403.

With this configuration in place, it should now be possible to upload a file to the bucket:

![Successful upload](/images/dropzone/successful-upload.gif)

This is what you should see too with your upload.

### Recording the upload

Our upload now arrives safely on S3, but we currently do not have any record of it within our application. With Paperclip, when a file is uploaded we have to attach it to a particular model's instance, and through that model instance we track the location of the file. When we upload directly to S3, we don't have that same kind of "automatic" tracking that Paperclip provides.

We're going to have to come up with another way of recording this upload within our application. Some hipster ops would probably recommend that you trigger an AWS lambda event whenever a file is uploaded to the bucket, and then that event posts back to your application... but I think that is a touch too complicated.

What we'll do instead is to get S3 to report back after the file has been successfully uploaded. S3 will do this in the response it returns from a file upload request, as long as we configure it to do so. This response will contain the location of the file that has been uploaded, and then with that information we can then create an `Upload` record.

To make S3 report back information about the upload, we need to make a small change to our controller. We'll need to add an extra key to our `presigned_post` call:

```ruby
@post = s3.bucket(ENV.fetch('AWS_BUCKET')).presigned_post(
  key: "uploads/#{Time.now.to_i}/${filename}",
  allow_any: ['utf8', 'authenticity_token'],
  success_action_status: 201,
)
```

This small change tells S3 that we would like a response back. By default, S3 returns a "204 No Content" status. This configuration option changes that to a "201 Created", which will contain a response body that contains the file information.

The next issue that we have to deal with is that Dropzone + S3 are handling the upload, and we don't currently have a way to intercept the response back from S3. Fortunately, Dropzone is easily configurable and so we can get it perform an action once a file has been uploaded successfully.

Let's configure Dropzone like this now:

**app/assets/javascripts/uploads.js**

```javascript
Dropzone.autoDiscover = false;

$(document).ready(function() {
  var myDropzone = new Dropzone('#uploader', { timeout: 0 });

  myDropzone.on("success", function(file, request) {
    console.log(request);
    var resp = $.parseXML(request);
    var filePath = $(resp).find("Key").text();

    $.post('/uploads', {
      authenticity_token: $.rails.csrfToken(),
      upload: {
        path: filePath,
        file_type: file.type,
        last_modified: file.lastModified
      }
    })
  });
});
```

Again, I'm going a bit "old-school" with the jQuery usage. Sorry, JS hipsters. This could very well [just as easily be a React component](https://github.com/founderlab/react-dropzone-s3-uploader), but I'm wanting to keep it relatively simple here.

The first thing that we do here is to turn off Dropzone's autodiscovery. We do this because we want to configure a custom dropzone component, but at the same time we want to keep the styling provided by `dropzone.css`. This styling refers to the class `dropzone`, but Dropzone's autodiscovery feature applies dropzone to any element with that class. So to have the styling but _not_ the autodiscovery, we disable this option.

Then we go about configuring the custom Dropzone component. We start by linking it to the `#uploader` element (our `form_tag`), and setting the timeout to 0. By default Dropzone's timeout is 30 seconds, just like Heroku's. If we have a large file that we're uploading through Dropzone and/or a slow (read: Australian) internet connection, then Dropzone will cancel the request after 30 seconds. This option disables that feature.

The `on` function call then sets a handler for a "success" event, which is what happens right after a file has been uploaded. The first argument to this callback is the `file` which has just been uploaded, and contains some handy information like the file's content type and its last modification date.

The content type can come in handy if you want to display different files differently. For instance, for images you might want to display a smallnail but for a video or a PDF file you might want to display an icon.

The `request` argument represents the response that we get back from S3 after the file has been uploaded. Because of that `success_action_status` configuration in our controller, this response will be a short XML document.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PostResponse>
  <Location>https://[bucket].s3-[region].amazonaws.com/[file]</Location>
  <Bucket>[bucket]</Bucket>
  <Key>[file]</Key>
  <ETag>[etag]</ETag>
</PostResponse>
```

From this XML response, we extract the `Key` element by using jQuery's `$.parseXML` function, and then send that through in a `POST` request with `$.post` to `/uploads`. With this request, we need to send through the authenticity token, which we get with `$.rails.csrfToken`.

This request will hit the `create` action of our `UploadsController` which doesn't yet exist, so let's create it:

```ruby
def create
  Upload.create!(upload_params)

  head :ok
end

private

def upload_params
  params.require(:upload).permit(:path, :file_type, :last_modified)
end
```

With all this hooked up, we should now see uploads coming through to this controller. Go ahead and upload one and give it a spin. If it's successful, you'll see something like this in the Rails server output:

```
Started POST "/uploads" for 127.0.0.1 at 2017-08-29 10:36:38 +1000
Processing by UploadsController#create as */*
  Parameters: {
    "authenticity_token"=>"[token]",
    "upload"=>{
      "path"=>"uploads/1503966995/joe.png",
      "file_type"=>"image/png",
      "last_modified"=>"1503965717000"
    }}
   (0.1ms)  begin transaction
  SQL (0.5ms)  INSERT INTO "uploads" ...
   (1.5ms)  commit transaction
Completed 200 OK in 21ms (ActiveRecord: 2.8ms)
```

Hooray!

One issue though: if we display these uploads from S3 then they'll be displayed in their original resolutions. With Paperclip, it automatically resized uploads to smallnail or smaller versions, but with direct-to-S3 upload we're missing out on that feature. Let's look at how we can add that feature back to our app with imgix.

### Serving images using imgix

[imgix](https://imgix.com) is a real-time image processing and CDN service. We can use them to dynamically resize the photos uploaded to our application.

imgix takes image hosting quite seriously. [Take a look at their "Building a Graphics Card for the Internet" writeup + photos](http://photos.imgix.com/building-a-graphics-card-for-the-internet) just to see how serious they are about it.

Signing up is free, and they give you a $10 credit on signing up. That should be plenty to at least trial this.

Sign up to imgix, and create a new source. For the "Source Type" you'll want to choose "Amazon S3", and then you'll need to fill in the AWS Settings. The images do not have a path prefix, so leave that blank. Under "Security" check "Secure URLs". For why you'd want to check that box, read [this page from imgix's docs](https://docs.imgix.com/setup/securing-images).

Once you've setup the source, you'll need to get the token from under the "Security" section. It will look like `5pXdqzZw69drsRgB`. We'll use this token to securely sign our imgix URLs.

To generate these URLs, we can use the `imgix` gem. Let's add that to the `Gemfile`:

```ruby
gem 'imgix', '~> 1.1.0'
```

Then run `bundle install`. Let's add our secure token to the `.env` file, just so it's not in our committed code. We'll also add in the subdomain for the source that we setup:

```
IMGIX_TOKEN=5pXdqzZw69drsRgB
IMGIX_SUBDOMAIN=[your subdomain goes here]
```

We're adding in the subdomain here as it will be different for our production environment. The subdomain here should be a _development-specific_ one.

With that there, let's now try generating an imgix URL with this gem in the rails console. First, we'll need an `Imgix::Client`:

```ruby
client = Imgix::Client.new(
  host: "#{ENV.fetch("IMGIX_SUBDOMAIN")}.imgix.net",
  secure_url_token: ENV.fetch("IMGIX_TOKEN")
)
```

Then to sign a URL, we can use `Imgix::Client#path`. By this point, we should have at least one upload, so let's use that upload's path to generate this URL:

```ruby
path = client.path(Upload.last.path)
```

This gives us an `Imgix::Path` object. We can transform this path into a URL with the `to_url` method:

```ruby
path.to_url
```

The URL returned here will look something like:

```
https://[imgix subdomain].imgix.net/uploads/[path]?ixlib=rb-1.1.0&s=[signature]
```

If you open this URL in your browser you'll see the image that you have just uploaded, at the resolution you uploaded it. This is a good thing, as it proves that imgix's proxying service is working: imgix is fetching the image from the S3 bucket and serving the image through the imgix CDN.

The next step that we want to acheive is to get imgix to dynamically resize these photos. Let's say that we want an image that's 250×250 pixels to use as our smallnail. To get imgix to generate an image like that, we need to pass some options to `to_url`:

```
path.to_url(w: 250, h: 250)
```

This will return an image that maintains its aspect ratio, but at least the width or the height is a maximum of 250 pixels. Let me explain what I mean by this with an example: I have an image hosted through imgix that is 3264×2448 pixels. With the above options, imgix resizes this image to 250×188, effectively reducing the measurements of the photo by a ratio of 13.058.

However, in this particular application I want images that are perfect squares because I display these photos in a grid fashion. You might want this too, and so to generate images like this we can use the `:fit` option in `to_url`:

```
path.to_url(w: 250, h: 250, fit: 'crop')
```

imgix will now crop the image so that it fits neatly into a 250×250 square. There are [other styles of cropping, which are explained here](https://docs.imgix.com/apis/url/size/fit). You can load up the two images in two browser tabs to compare what they look like.

Let's make our images do this now through our view, and not just through the console. We can create a new class for this at `lib/upload_url.rb`:

```ruby
class UploadURL
  def initialize
    @client = Imgix::Client.new(
      host: "#{ENV.fetch("IMGIX_SUBDOMAIN")}.imgix.net",
      secure_url_token: ENV.fetch("IMGIX_TOKEN")
    )
  end

  def small_url(path)
    @client.path(path).to_url(w: 250, h: 250, fit: 'crop')
  end

  def large_url(path)
    @client.path(path).to_url(w: 1000, h: 1000, fit: 'crop')
  end
end
```

Then we can use this new class in `UploadsHelper`:

*app/helpers/uploads_helper.rb*
```
require_dependency 'upload_url'

module UploadsHelper
  def small_image(upload)
    image_tag(upload_url.small_url(upload.path))
  end

  def large_image(upload)
    image_tag(upload_url.large_url(upload.path))
  end

  private

  def upload_url
    @upload_url ||= UploadURL.new
  end
end
```

We can then use these helpers to display smallnail versions of our image on the `index` template:

**app/views/uploads/index.html.erb**
```erb
<h1>Uploads</h1>

<% @uploads.each do |upload| %>
  <%= small_image(upload) %>
<% end %>
```

Or large images on the `show` template:

**app/views/uploads/show.html.erb**
```erb
...
  <%= large_image(@upload) %>
...
```

### Summary

Dropzone, S3 and imgix allow us to upload and host our images very easily, without the need of the paperclip gem. By uploading directly to S3, we avoid tying up our application's processes with lengthy file uploads too.

If you found this post helpful, chuck a few bucks my way on PayPal: https://paypal.me/ryanbigg





