---
wordpress_id: RB-1551656914
layout: post
title: "JEP #2: The first 8 weeks"
---

At Culture Amp, we kicked off the latest round of our Junior Engineering Program (JEP) about 8 weeks ago. We hired 9 junior developers all of varying levels of past experience and set about teaching them the foundational skills they need to be productive members of our product teams.

In this post, I want to take the time to reflect on what we've accomplished during those 8 weeks, and to note down my own personal reflections.

## The new program

Before the juniors started, I spent a large amount of my time reviewing the curriculum from the last JEP. [I talked about this in my last JEP post](https://ryanbigg.com/2018/08/junior-engineering-program-resources). On (or around) that topic I want to speak about a few things:

* Expectation setting
* The tech that we covered
* Team building activities
* 1-on-1 support

### Expectation setting

The very first presentation that I gave to the juniors contained very little to do with the tech side of things and with good reason. It covered a timeline of the JEP, and a bunch of focus on setting up expectations early. There is no better time to set expectations like this than at the very beginning.

In particular, I outlined things such as "I will never expect you to know what I know at all times." and "I will never expect you to be able to keep up with me." I know that both of these things were things that the original JEP cohort had anxiety about, so I thought to cover these first. I don't, and never will, expect juniors to be able to know what I know or to be able to keep up with me. It is the most unreasonable expectation I could possibly have, but it needed saying.

On a more positive side, I also said "I will always expect you to ask me to slow down and explain things again." I stressed that it doesn't matter if I have explained it fifty times already. Make me explain it again for the fifty-first time. It'll give me practice in being a better teacher. I want to be a better teacher.

In this same presentation, I outlined that "Priority Zero" is self care. This includes things like setting fixed times for your work days and not exceeding them, talking to other people about your struggles when you're struggling (even though it can be hard!) and asking questions when you feel stuck on something.

**Taking care of yourself should _always_ be the highest priority. Nothing trumps this.** It feels like it doesn't need saying, but it does. It's almost a form of giving permission.

Finally, I outlined what they could expect from the program: a great culture, an exceptionally supportive environment and learning & development opportunities galore. These were my promises to the old cohort too, but with the new cohort I made them very explicit.

### The tech side of things

There is an incredible amount of stuff to learn when it comes to building web applications. Building a tech-focussed curriculum for this program is a massive undertaking. For the initial part of the program, I had the juniors for an 8 week "kickstart" program where I could teach them full-time for those 8 weeks. Figuring out what to teach them was a fun exercise!

I re-worked the JEP curriculum it this time around to start with a focus on browser technologies -- HTML, CSS and JavaScript -- since that's where users interact with applications the most: through a browser. The first project for the juniors was a quick user manual built in HTML + CSS. As an example, [here's mine](https://cultureamp.github.io/jep-bios/ryan/).

Starting at the browser level allowed us to expand "outwards" in complexity, bringing things like React and TypeScript into the mix very soon after starting. We started by using [StackBlitz](https://stackblitz.com/) here to develop our first React application, and this was a really good experience -- especially with the code reloading. The juniors watched the [Frontend Masters - Complete Intro to React v4](https://frontendmasters.com/courses/complete-react-v4/) or [the Udemy React + Redux course](https://www.udemy.com/react-redux/) to learn more about React.

Once we were comfortable with our React applications, we downloaded them to our machines and added TypeScript to them. We had our first guest lecture during this week, ran by one of our staff: Louis Quinnell. He ran the juniors through a Webpack setup with TypeScript.

This week involving React, Webpack and TypeScript was one of the hardest JEP weeks, and next time I'd probably spread it out over two weeks next time. There was just so much content crammed into one week!

After covering browser and JS tooling tech, we then moved out to networking concepts, like hosts, ports and HTTP. We talked about how processes can listen on specific ports, and that when they listen, they communicate over established protocols like HTTP.

To solidify that knowledge, we then made React applications talk to HTTP servers that served JSON data by using the [axios](https://github.com/axios/axios) package. To serve a JSON API, we used [the wonderful `json-server`](https://github.com/typicode/json-server) package. To explain how these different routes within `json-server` worked, I wrote them up on a whiteboard:

![JEP 2 whiteboard](/images/jep/jep2-crud-whiteboard.jpg)


By this point, we had a clearly separated frontend + backend application structure, which is the style of application structure that we are moving towards at Culture Amp: a clear separation between backend and frontend applications.

We then took a week to do some coding exercises through [CodeWars](https://www.codewars.com), with some of the juniors completing [a 3-kyu ranked coding problem called "The Lift"](https://www.codewars.com/kata/the-lift) in Ruby. During this week, I also set the juniors some homework of completing the Toy Robot exercise in either Ruby or TypeScript. The catch was that it had to be tested using RSpec. At the start of the week, we had our second guest lecturer: David Carlin. He ran through a short RSpec testing tutorial [based on the roman numerals exercise from Exercism](https://exercism.io/tracks/ruby/exercises/roman-numerals).

The week after that, we rebuilt our own version of `json-server` with [Ruby's Sinatra web framework](http://sinatrarb.com/intro.html). By using `json-server` first, then building the same thing in Sinatra, we would have a clear idea of what we were trying to accomplish. This application used a combination of `File.read`, `File.write` and `JSON.parse` to accomplish its task, giving the juniors experience working with one particular file format.

During this time, I wrote a suite of tests in [RSpec](https://rspec.info) that made requests to the Sinatra application to assert that it behaved correctly. These tests would assert that everyone's Sinatra application was working correctly.

Once we had the Sinatra application working and reading from a JSON file to serve data, we then converted it again to use a [Mongo database](https://www.mongodb.com/). Why Mongo? Simply, because it is what we use in our main application at Culture Amp and that application will be the first touch point for a lot of juniors once they reach their teams.

We touched on Mongo database querying (through the `mongo` console) relatively quickly (less than an hour), before moving onto Mongoid and how to use that within a Sinatra application. We went quickly to [Mongoid](https://rubygems.org/gems/mongoid) because that's what we use most often to talk to our Mongo database, not direct queries in a `mongo` console.

We touched on what the Object-Document-Mapper (ODM) pattern was, and how it related to the Object-Relation-Mapper pattern (ORM) from Active Record. We replaced our Ruby code within the Sinatra application that read from a JSON file with one that read from a Mongoid model instead. This change made our Sinatra applications much easier to work with! The juniors were able to use the test suite to assert that their application was functioning correctly too.

To wrap up the 8 weeks, we spent the final week learning about [Ruby on Rails](https://rubyonrails.org), going through the [Getting Started guide](https://guides.rubyonrails.org/getting_started.html) and then building an application with it. This application served a CRUD interface through regular Rails HTML+ERB views, as well as an API that worked exactly the same as our Sinatra application. We moved the RSpec tests from the Sinatra application into this new Rails application, and turned them into [RSpec request specs](https://relishapp.com/rspec/rspec-rails/docs/request-specs/request-spec) so that we could easily test our Rails application.

One final bit of testing that we added later on was feature tests using the excellent [Capybara gem](https://rubygems.org/gems/capybara), paired with [selenium-webdriver](https://rubygems.org/gems/selenium-webdriver) and [chromedriver-helper](https://rubygems.org/gems/chromedriver-helper). This allowed us to run tests within a real browser, and the juniors really loved seeing the tests run through their app blazingly fast in a real browser. I think this sort of thing is a good demonstration of what testing provides.

### Building a team

Both of our JEP cohorts did more than just learn a bunch of pieces of tech. The whole reason why we hire a cohort of developers rather than just one or two is so that they can bond through the process. The shared experiences that the group has helps the team support each other and grow faster. To that end, we did a bunch of team building activities too.

#### Team lunches

One of our common activities was to go out to team lunches. Before the program started, we all went out and had lunch at Pok Pok Junior, a Thai restaurant. During our first week, we went out for a "Welcome to Culture Amp" lunch at Tahini Diner in the city:

![Tahini Diner](/images/jep/jep2-tahini-diner.jpg)

During the program, we regularly went out for lunch together as a group and I reckon that helped the group bond well.

By about the 3 week stage, the team had really gelled well and were routinely helping each other out, which made my work easier too. Something happened during this week -- I'm not sure what -- and suddenly the grouped clicked as a whole. It was very noticeable and awesome to watch.

#### Werewolf + Dominoes

On Friday afternoons, we run semi-regular sessions of Werewolf. Here's some of our juniors during one of our Werewolf sessions at an off-site company event having a bunch of fun accusing others of lying:

![Werewolf](/images/jep/jep2-werewolf.jpg)

One of the other activities we've done for "team building" was during the 3rd week, where I brought in 500 dominoes and asked the juniors to work in teams to build the longest chain, tallest tower and a few other things:

![Dominoes](/images/jep/jep2-dominoes.jpg)

It turns out that 500 dominoes is not enough to share between 9 juniors so next time I might bring in 1000 and see how that goes.

This dominoes exercise was intended as a learning exercise for the juniors -- something based around "if you take your time you produce a better quality of work" (dominoes are unforgiving if you rush them!) -- but it ended up being way more fun than serious.

At the end of this session on dominoes, we all signed dominoes for each other and took them home as a memento of our time during the JEP even though it's nowhere near over yet.

![Signed Dominoes](/images/jep/jep2-signed-dominoes.jpg)

This was a really nice touch on this lesson.

### 1-on-1 support

While the juniors may feel comfortable expressing themselves one way within the JEP group, there's going to be cases where they reserve some things for more private cases. Being a junior within a large company with a bunch of experienced engineers is tough. Being in a group of people who you constantly compare yourself to can be tough too.

To help with this part, I spared an hour of my week every single week for each of the juniors. The juniors were told to bring their own agenda along to this meeting. We could catch up and talk about how the week was going, how they were feeling, and talk about any issues that they have encountered that week. I enjoyed these catch ups and I felt like I got to know them all better.

A major topic of conversation was anxiety at feeling like they weren't good enough. This is a pretty common thing for juniors to encounter. I provided the junior assurances that this feeling of "being not good enough" is a perfectly normal thing to happen to them is what I try to do when it pops up. It'll keep coming up from time-to-time, and I think it's a root of imposter syndrome. Almost all of my juniors experienced this feeling during the first 8 weeks.

My main job here is to turn the juniors into confident and capable developers, and these 1-on-1s are critical to making that happen.

## Reflections

It wouldn't be a JEP post if I didn't include some reflections at the end. So here they are!

### Curriculum was great

I strongly believe that the approach I took to curriculum this time around worked incredibly well. The rough order was this:

* Expectation setting
* HTML, CSS and JavaScript
* React
* TypeScript
* Networking fundamentals + servers
* Ruby
* Coding exercises, TDD & BDD
* Sinatra
* Mongo & Mongoid
* Rails
* Capybara

All of this was covered in roughly 6 weeks of "hands-on" time. It helped a lot that the juniors had a grip on some of these things already.

Next time I would like to separate out the React & TypeScript week into two consecutive weeks -- cramming them into one week felt quite intense for me and esepcially for the juniors. During the React week I could add some more content around testing with Jest.

By moving TypeScript out to its own week it would "disconnect" it from React. I would show that it can be used independently and how it compiles down into JavaScript. Then I can show how to use it in conjunction with React.

---

The week spent on Rails + Capybara also felt a bit short I would split this week into two as well, so that we could cover more.

I would've loved to cover Rails + React integration using the [Webpacker](https://github.com/rails/webpacker) gem, but we ran out of time during the last week. This gem would've allowed us to move our frontend code into our Rails application and would've gotten us a close model of how Culture Amp's major Rails application works.

This is the last major piece of the puzzle of how our major Rails application works and I worry that the juniors who have now begun working on their teams won't understand this concept well enough when they see it within the application. But maybe I am being a worry wart.

So overall, we covered this material in 6 weeks but I think 8 weeks of time would be more suitable.

### Make dev machine setup smoother

Lots of time was spent setting up their developer machines. I _strongly feel_ like I should be able to automate this but I worry if I try I would be running into [this classic XKCD](https://xkcd.com/1205/).

There wasn't a canonical list of things for the juniors to work through to set it up, and it always feel a bit ad-hoc. I think maybe keeping a list of these common tasks that developers go through when setting up their computers here would be beneficial. Sharing this list in a todo list application (Wunderlist? Things?) might help provide some order and sense to the steps.

### More "Why?"

One thing that I need to seriously do better is to explain the "why" of what we're doing a lot better. The "why?" question was a pretty common one.

It's all well and good to learn new tech (it's exciting!) but covering _why_ it is important would help sell the juniors on it. Why was it important to learn React? What about JSON APIs? More why.

Providing more details about the "story arc" of the week / program-as-a-whole would've been more useful too, I believe.

### Webpacker, React & Rails


### None-on-Ones

For the past 8 weeks, I honestly have felt like I've been running around, shouting "AAAAAHHHHHH" with my arms flailing above my head.

Onboarding 9 new developers to the company and teaching them new curriculum kept me incredibly busy. So busy that I actually went to sleep at 6:30pm on at least one Friday.

This, coupled with my regular amount of meetings and the 1-on-1s on top of it, meant that I didn't have much "spare" time. In this spare time I would regularly catch up on todo list items, actions that come out of 1-on-1s, emails and so on.

So in the future, I am setting aside _at least_ 5 hours a week in sessions that I'm calling "None-on-Ones". They're booked in my calendar as regular meetings (where I'm marked as "busy"), except I am the only one invited. I hope this will convince myself to focus on clearing out those small-but-important tasks that I never seemed to have spare time to get around to.

Maybe this is a management trick I wasn't taught yet. I think it'll be useful.
