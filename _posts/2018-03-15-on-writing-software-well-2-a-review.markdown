---
wordpress_id: RB-1521081004
layout: post
title: "On Writing Software Well #2: Using callbacks to manage auxiliary complexity: A review"
---

This blog post has been [translated into Japanese](https://techracho.bpsinc.jp/hachi8833/2018_05_10/56193), thanks to [@hachi8833](https://twitter.com/hachi8833)!

A few people have asked for my opinions on DHH's recent video series. And others have bemoaned the lack of a critical take on the videos. So here's a critical take involving my opinions on [DHH's 2nd video](https://www.youtube.com/watch?v=m1jOWu7woKM)) in the series.

Why not start with [Video #1 in the series](https://www.youtube.com/watch?v=H5i1gdwe1Ls)? Because it was great! Code comments that explain why things are the way they are... those are incredibly useful to people new / unfamiliar with parts of a codebase. His points were well made and I find nothing worth commenting on. (Pun intended)

Video #2 though has the word "callbacks" in it and so I'm intrigued to hear what DHH has to say about it.

So here's some "real-time" opinions that I wrote down while watching this video for a _third_ time. If you like this sort of thing, let me know in the comments below.

## Initial reactions

* Ew callbacks. I've been bitten enough times by these -- mainly cases where callbacks are happening when I do not expect them to. Things like where I might call `create` on a model in a unit test and that causes some _other_ behaviour via callback that isn't relevant to the test. I'd prefer to be explicit in these cases to save surprises.
* I've heard mention that these talks might include Rails concerns (modules being included to add behaviour to classes), so I'd suggest you stop right here, get out your favourite drink of choice and take a drink whenever you see a concern used in the Rails app.

## 1:35 - "Side effects"

* "Side effects .. has gotten also a bit of a bad reputation, especially in functional programming" -- Yeah, because _random magical shit_ happening when you call a method isn't easily predictable. Having the code be explicit about what it's doing makes it easier to understand it _now_ and _later_. The later part is what I think DHH is missing here.

## 2:13 - Messages Controller

* `@bucket.record` takes _far_ too many arguments. What is it doing with them all? And P.S. do you even newline your key / value pairs?

```ruby
@bucket.record(new_message,
  parent: @parent_recording,
  status: status_param,
  subscribers: find_subscribers,
  category: find_category
)
```

I think that this reads a little better -- and the Git diff would be neater if a new key was added and removed. It _feels_ like `category` _might_ one be of those things that was added recently and just chucked onto the end here.

TBH a little surprised here that he's using `@parent_recording` which is setup as a  `before_action`,  but `find_subscribers` and `find_category` aren't. They're called explicitly here. I'd expect some sort of consistency... but maybe there's a reason for that? The methods are folded at the bottom of the controller so I can't get a good idea of what those are doing to really judge whether or not it's a good choice.


## 4:15 - `Mention` model

* This model is pretty neat. I cringe a little (PTSD, I guess) on the sight of the `after_create` and `after_commit` uses.
* Interesting that the model doesn't inherit from `ApplicationModel`. Probably a legacy app thing.
* Neat use of `casecmp` in `callsign_matches?`.
* The `unless` in `after_commit :deliver` irks me a little, but maybe it's due to me preferring to keep all the logic inside of methods? I'd write it like this:

```ruby
def deliver
 return unless mentioner == mentioned

...
end
```

## 5:55 - `Recording::Mentions` concern
*DRINK* -- there's a concern here. [bad joke about it being "concerning"]

### Callbacks

* Okay, so this is using more callbacks. I feel like `remember_to_eavesdrop` could be something set "further up" in the chain, probably in the controller. The controller itself could check to see if these things have changed, and then from there choose to send out the mentions.

### Current Attributes
The other thing is `Current` -- used in `eavesdrop_for_mentions` down the bottom of the code view here.

I already [wrote about CurrentAttributes at length](https://ryanbigg.com/2017/06/current-considered-harmful). Global variables magically being available _everywhere_ in the application. Where is `Current.user` set? How can I be sure it's set to a value here?

### Abstracting out the logic for triggering the job

This whole eavesdropping thing _feels_ like it could be wrapped in some other logic (in a controller, perhaps). It's practically begging for it. Basecamp probably doesn't want to be persisting Messages to the database in its tests and having this job code run _every single time_, but that's exactly what's going to happen here. It'd probably slow down the tests due to these side-effects.

It would be better abstracted out to a "service object" which creates the recording and then triggers this `EavesdroppingJob`. Bonus thing there is that you can pass `current_user` from the controller and hey look I just got rid of the `CurrentAttributes` global variable thing.

An idea of what that might look like:

```ruby
module Mention
  class EavesdropForMentions
    attr_reader :recording, :params, user
    def initialize(recording:, params:, user: )
      @recording = recording
      @params = params
      @user = user
    end

    def run
      return unless eavesdropping?

      Mention::EavesdroppingJob.perform_later recording, mentioner: user
    end

    private

    def eavesdropping?
      (active_or_archived_recordable_changed? || draft_became_active?) &&
      !Mention::Eavesdropper.suppressed? &&
      recording.has_mentions?
    end

    def active_or_archived_recordable_changed?
      # code here to check change using recordable + params
    end

    def draft_became_active?
      # code here to check change using recordable + params
    end
end
```

I don't have the big Basecamp app to play with, so i don't know for certain if this code will or won't work. What I do know is that it neatly encapsulates _potentially_ performing the `Mention::EavesdroppingJob` later and avoids the issue where saving a `Recording` in _any_ context might queue up a job as a side-effect.  My approach here decouples those two things, allowing them to happen independently.

Essentially, it accomplishes the same thing in (probably) as many lines, but disconnecting it from the saving of the model is the big win in my mind.

### Callback suppression

Yay more global state appearing out of the blue (`Mention::Eavesdropper.suppressed?`). What could possibly go wrong? How can I track down easily where this might be toggled in the codepath that leads to this method? This looks like it would make debugging hard.

DHH himself says (at ~11mins) he thinks that there might be situations where you don't want callbacks to happen. Okay, great. So make it so that it can be an optional part of your code (as above), rather than this spooky-action-at-a-distance `Mention::Eavesdropper.suppressed?`.

Re-organising the code to _optionally_ trigger this eavesdropping behaviour would lead to a lower cognitive overhead for working with this code.

### `has_mentions?`

Special mention (ha) of `has_mentions?` at the bottom of this module which does seem to at least abstract the behaviour of checking if something has mentions.

## 13:23 - `Mention::EavesdroppingJob`

It feels a lot like `Current.set` here is a cheap way of passing account through to `mention::Eavesdropper` and its associated things. I am not sure why this is wrapped this way, given that the account would be accessible in the `Eavesdropper` class -- assuming it's setup like this:

```ruby
class Mention
  class Eavesdropper
    attr_reader :recording

    def initialize(recording)
      @recording = recording
    end

    ...
  end
end
```

But at least, this `Eavesdropper` class is abstracted away and isn't a concern. There feels to me like concerns are used as a bit of a "golden hammer" in this application.

## 13:45 - run-through of all the parts

DHH jumps straight from the controller to the `Recording::Mentions` concern here. (DRINK)

My initial thought here was: how is someone unfamiliar with this application supposed to know that the `Recording::Mentions` concern is where to look for this eavesdropping behaviour if they were to go about debugging it?

This is spooky-action-at-a-distance and it's the kind of code that I might've written a few years ago and felt very smart _at the time_, but then months later when I've gone back to visit it I've asked myself: "wtf was past-Ryan taking?"

DHH says around the 14:10 mark that "there's a fair amount of indirection here but it provides a very clear path of reading what's going on in the method". Out of anything else in this video, this is the #1 thing that I disagree with the _most_. The path is completely ambiguous to my "untrained" eye -- I am unfamiliar with this application.

It is "clever code" and that is dangerous because future-you will come back and look at the code in a few months time and wonder how it all fit together again.

## 14:20 - `Mention::Eavesdropper`

And now we get to a class which actually has an idea of what the Single Responsibility Principle is.

(Interestingly, DHH can't navigate his own code at the ~14:30 mark)

I've already talked about CurrentAttributes before, so what I'll do here is just sigh longingly, wishing wistfully for the death of global state in any and all applications.

"Globals is not something that you should just litter over your application" -- MY MAN! This is what you're doing here. "Passing around this stuff isn't helpful". Ok, here's the #2 thing I disagree with. When passing things around, you gain an inkling for _where_ the thing came from and if you followed the chain high enough you might find where it was originally defined. This `Current.person` mumbojumbo hides all of that for no real good reason.

Not sure I can state my thoughts clearer than this: *DEATH TO GLOBAL STATE.*

## 16:24 - `Mention::Scanner`

Ok so that `Mention::Scanner` approach looks pretty good. It's great that this code wasn't just thrown into `Eavesdropper` because it was _somewhat_ related. It's a separate concern, and moving that logic into `Mention::Scanner` is a good approach.

## 18:10 - `Mention` `after_commit` hook
I still feel strongly that this could just be a method call in the controller after the `@bucket.record` is called.

## 19:20 - `ProjectCopier` + suppression
The suppression chain underneath `suppress_events_and_deliveries` wouldn't be necessary if this code previously opted-in explicitly to making these "events" and "deliveries". It _still_ feels like a poor work around for something that could be tidied up with half an hour's worth of effort.

And at the ~20:10 mark, DHH can't find where the suppressible behaviour is brought in. This thing where the code is hard-to-navigate  is a massive code smell. Again: if the "callbacks" were explicit rather than implicit, the suppression wouldn't be needed. The overall code footprint would be smaller, more explicit, and therefore easier to understand. The code does A, B, and C. No magic.

## 20:39 - Wrap Up
"I hope it's clear" -- it isn't. I've been doing this Rails stuff for _10 years_ now and if I saw this code in a codebase I would look into ways of making this more explicit to make it easier to work with.

As I've said previously: this code feels like "clever code". "Look at me using all these cool Ruby features! I am so smart!". Well, yeah. You are smart.

But then in several months time of this thing chugging along working perfectly, you'll encounter a bug, look at the code and wonder how the hell it all fit together. There is far too much magic here.

But I guess that's The Rails Way&trade;.

---

20:46: "take all this logic and jam it into, what? The controller? A service object?" -- No. A transaction object (see my example back at 5:55) that created the recording AND explicitly triggered the mention scanner + deliveries.

Another approach would be to use [dry-transaction](http://dry-rb.org/gems/dry-transaction/). This gem provides a very neat DSL for setting up such a thing. I'd imagine it would go like this:

```ruby
class CreateRecording

step :create
step :scan_for_mentions
step :deliver_notifications

def create(bucket: bucket, ...)
  # @bucket.record code goes here
end

def scan_for_mentions
  # MentionScanner goes here
end

def deliver_notifications
  # Delivery code goes here
end
```

It'll all be wrapped up neatly in the one class. _This_ is where it should go. Not a controller. Not a service object. But a transaction object, that clearly delineates the steps involved in the transaction. There's no magic here. The steps are run in the order they are specified in. And it's possible to abort the transaction at each step.

This is my preferred approach. Callbacks and their implicitness have caused so much harm in previous codebases that I would never reach for them again. Transaction objects with explicit orders of operations are what I will be doing instead.



