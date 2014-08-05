--- 
wordpress_id: RB-353
layout: post
title: Add header to Rack::Test request
---

I couldn't find any results on the Google for the title of this blog post, so I'm writing it here.

All I wanted to do was to send through a header. I tried this:

    it "test" do
      get '/test', {}, { 'Test-Header' => 'Test value' }
      expect(last_response.status).to eq(200)
    end

That doesn't work, because that third argument is actually the Rack `env` object.

The correct way to do it is this:

    it "test" do
      header 'Test-Header', 'Test value'
      get '/test'
      expect(last_response.status).to eq(200)
    end


