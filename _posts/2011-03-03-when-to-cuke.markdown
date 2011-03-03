--- 
wordpress_id: RB-300
layout: post
title: When to Cuke
---

I think <a href='http://github.com/aslakhellesoy/cucumber'>Cucumber</a> is great, but not great for everything. Many people (including myself) use it and swear by it. You get to write <em>features</em> in <em>English</em> (or other languages), man. It's really awesome if you want to show these stories to people who you're developing for as they can read it and understand it.

I personally feel, in some cases, Cucumber isn't the right solution. If you're developing something that has no non-Ruby savvy stakeholder, why would you write it in Cucumber? I personally don't see the point. It overly complicates things.

Take this example: I want to create a feature for posting a new comment on a post. It would go like this:

    Feature: Comments
    In order to tell the masses what's on my mind
    As a user
    I want to post comments on the site
    
    Background:
      Given there is a post:
        | title        | text                         |
        | When to Cuke | I think Cucumber is great... |

    Scenario: Creating a comment
      Given I am on the homepage
      When I follow "When to Cuke"
      And I fill in "Text" with "I am posting a comment. Look at me go!"
      And I press "Post Comment"
      Then I should see "I am posting a comment." within "#comments"
      
I've tried to keep it as simple as I can here, but it should demonstrate the point I am trying to make. The logic of how the "Given there is a post" step is defined something like this:

    Given /^there is a post:$/ do |table|
      hash = table.hashes.first
      @post = Post.create!(hash)
    end

Where's it defined? Well, it could be anywhere. That's the problem! Usually, I'd define this in a file at `features/step_definitions/post_steps.rb` because it deals with `Post` objects, but that's just me. People have different tastes and therefore, undoubtedly, will do it differently. Maybe I've been too mollycoddled by Rails, but this is completely arbitrarily decided by whoever's writing the feature at the time. It gets to me.

Oh, then what happens if you want to have some kind of association, say you want to add an author to that post, transforming the step into this:

    Given there is a post:
      | title        | text                         | author                  |
      | When to Cuke | I think Cucumber is great... | radarlistener@gmail.com |

Yes, it's an email address. But what does it mean? Well, that behaviour would have to be defined in the step definition, which is "in another castle".


    Given /^there is a post:$/ do |table|
       hash = table.hashes.first
       hash["author"] = Factory(:user, :email => hash["author"])
       @post = Post.create!(hash)
     end

There's no way you can specify a pre-existing Ruby object to be a value for one of the keys in the table in Cucumber. Therefore, you have to hack around it like this.

Additional gripe: I'm constantly typing "Given I" and "When I" and "And I". **Boring**. I'm a programmer, coding a site that programmers will use. Why am I writing it in English?

## Enter: Capybara

Now let's see this *same* test, but written as a Capybara integration test:

    describe "Comments" do
      before do
        Factory(:post, :title => "When to Cuke",
                       :text => "I think Cucumber is great...",
                       :user => Factory(:user, :email => "radarlistener@gmail.com"))
      end
      
      it "creating a comment" do
        visit root_path
        click_link "When to Cuke"
        fill_in "Text", :with => "I am posting a comment. Look at me go!"
        click_button "Post Comment"
        within("#comments") do
          page.has_content?("I am posting a comment. Look at me go!")
        end
      end
    end

No bullshit, everything's there that I need to understand the spec. There are no step definitions. I can "parse" this code much faster in my head than I can with its Cucumber brother, allowing me to be a more productive developer. There's nothing extra on the lines. No "Given", no "When", it just *does* things. There's nobody on my team that doesn't understand this code.

Note also here how I'm able to pass through an object to the `user` key in the `Post` factory without having to hack around it.

Simple, elegant and effective. Yes please. Oh, and it's shorter too. I'm using RSpec + Capybara to develop the <a href='http://github.com/radar/forem'>forem gem</a> (eventual aim: a decent forum engine for Rails 3) and I'm loving it. It just works, and there's no extraneous syntax in my specs.

If you're working with people who aren't technically-inclined then perhaps it would be easier to use Cucumber, as it is the easiest to read. But when working on a team of Ruby developers, developing something internal, I think Capybara is the way to go. If you're looking for a way to combine the two techniques then I'd recommend taking a look at <a href='http://github.com/cavalle/steak'>cavalle's steak</a> gem.

