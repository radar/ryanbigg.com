---
wordpress_id: RB-1675764481
layout: post
title: "Why game programming and why Magic?"
---

For about the past 5 months, I've been fiddling with a little Ruby project called ["Magic: The Gathering: The Ruby Project"](https://github.com/radar/mtg). It's my attempt to make Magic: The Gathering, in Ruby.

But why game programming when my forté is web programming, and why _this_ game specifically? Why not Uno?

Because I wanted a challenge!

I had played Magic first [through their Arena app on iOS](https://apps.apple.com/us/app/magic-the-gathering-arena/id1496227521), which (mostly) works, save a few little issues here and there. Last year I started playing Magic weekly at a local game shop in town. I love the different mechanics of the different cards and figuring out how they all interact best. _Especially_ when they syngerise together.

What's appealing about this game is that while there's a rulebook (I'll get to that in a minute), the _cards themselves_ make up the rules. If the creators want to change the rules of the game, they can print more cards with different text on them.

This is Rule 101.1 of Magic:

> 101.1. Whenever a card’s text directly contradicts these rules, the card takes precedence.

Some of the cards are simple, like [Savannah Lions](https://scryfall.com/card/a25/33/savannah-lions). It costs one white mana to play, and it has 2 power and 1 toughness.

Others, like [Questing Beast](https://scryfall.com/card/eld/171/questing-beast) with all its words, and [Garruk Relentless](https://scryfall.com/card/isd/181/garruk-relentless-garruk-the-veil-cursed) with all its words on one side, _and then even more words on the other side_, are not so simple.

This Rule 101.1, the _first_ of Magic's several "Golden Rules", is contained in [this two-hundred-and-seventy-eight PDF page document](https://media.wizards.com/2023/downloads/MagicCompRules%2020230203.pdf), where all of Magic's non-card-defined rules are written down. Some of the rules even have examples with them.

If you wanted to find out all of the creature types, you'd look at Rule 205.3m.

Want to know how combat is designed to run? Start on page 74 with Rule 506, and finish on Page 84 with rule 511.

----

Now this MTG-in-Ruby project is not a line-for-line reproduction of the rulebook or even a card-for-card replication attempt from A-Z. It started as an attempt to reproduce the features of a stack of random cards that were on my desk, and progressed from there to attempting to implement all of the [Core Set 2021](https://scryfall.com/sets/m21?as=grid&order=set) cards. I needed to set myself a goal, and even though that goal is _extremely ambitious_, it's still a goal and something to aim for.

I've gotten most of the white cards done, and that leaves only about 300 more cards of that set. And [there are quite a few sets](https://en.wikipedia.org/wiki/List_of_Magic:_The_Gathering_sets) .


What I'm particularly proud of here is that I have a clean DSL for being able to define cards and their abilities. For a simple card like [Story Seeker](https://scryfall.com/card/khm/34/story-seeker), I can define it like:

```ruby
module Magic
  module Cards
    StorySeeker = Creature("Story Seeker") do
      cost generic: 1, white: 1
      type "Creature -- Dwarf Cleric"
      keywords :lifelink
      power 2
      toughness 2
    end
  end
end
```

The one thing here I'd change is making those types into constants rather than being strings. I've been too lazy to address that yet, as it hasn't been a problem. Here's a quick riff on what that might look like:


```ruby
module Magic
  module Cards
    StorySeeker = Creature("Story Seeker") do
      cost generic: 1, white: 1
      type Types::Creature[:Dwarf, :Cleric]
      keywords :lifelink
      power 2
      toughness 2
    end
  end
end
```

While writing this post I built [this exact interface](https://github.com/radar/mtg/commit/8cb9efe66248a1672d0e56a04bc8e92d19209385). I'd love to go back to revisit it sometime to handle when an _invalid_ type is passed, but it'll work for the time-being.

---

The cards themselves are _usually_ straightforward to implement. It's how they interact that's the tricky part. For this, I try to come up with scenarios that might happen in real games, and then model those in the tests themselves.

One of these that I'm particularly proud about is the mana-cost-reducing effect of [Foundry Inspector](https://scryfall.com/card/nec/152/foundry-inspector). I started working on this card by writing the test for it first and working up from there.

```ruby
 require 'spec_helper'

RSpec.describe Magic::Game, "Mana spend -- Foundry Inspector + Free Sol Ring" do
  include_context "two player game"

  context "when at first main phase" do
    before do
      current_turn.untap!
      current_turn.upkeep!
      current_turn.draw!
      current_turn.first_main!
    end

    context "foundry inspector reduces sol ring cost" do
      let(:foundry_inspector) { Card("Foundry Inspector") }
      let(:sol_ring) { Card("Sol Ring") }

      before do
        p1.hand.add(foundry_inspector)
        p1.hand.add(sol_ring)
      end

      it "casts a foundry inspector and then a sol ring" do
        p1.add_mana(red: 3)
        action = Magic::Actions::Cast.new(player: p1, card: foundry_inspector)
        expect(action.can_perform?).to eq(true)
        action.pay_mana(generic: { red: 3 } )
        game.take_action(action)
        game.tick!

        action = Magic::Actions::Cast.new(player: p1, card: sol_ring)
        expect(action.can_perform?).to eq(true)
        game.take_action(action)

        game.tick!
        expect(p1.permanents.by_name(sol_ring.name).count).to eq(1)
      end
    end
  end
end
```

The body of the test ensures that we can pay 3 red mana to cast the Foundry Inspector, and then by casting that we can then cast the [Sol Ring](https://scryfall.com/card/dmc/190/sol-ring) by not paying any mana at all. It finishes by using some more DSL code to ensure that the Sol Ring has been registered as a permanent controlled by Player 1.

---

If you're looking for where the proverbial bodies are buried on this particular project, well, there are _plenty_. This project was coded up over nights, after work and sometimes even after a glass of Port or two. Caution was thrown to the wind, and past that.

The worst of it would be demonstrated in `attacking_creature_creates_attacking_token_spec.rb`, where a card called [Falconer Adept](https://scryfall.com/card/m21/18/falconer-adept) has a triggered ability of:

> Whenever Falconer Adept attacks, create a 1/1 white Bird creature token with flying that’s tapped and attacking.

What this means is that you can declare that Falconer Adept is attacking as a part of the _regular_ "Declare Attackers" phase of combat, and then by doing that, a different game object (a Bird token) is created, where you will need to delcare what that Bird token is attacking. In effect, "Declare Attackers" happens _twice_.

You can see how this code is handled in the `Turn` class's state machine, particularly anywhere the `final_attackers_declared` method is used.

This one took me a _long_ time to implement.

---

I like fiddling with this project. It's outside my regular wheelhouse and is teaching me more about event-driven game programming.

If I get stuck on a card, it's not like I _have_ to implement it. There's thousands more out there to choose from.

I'd suggest if your interested in practicing some Ruby code outside of the usual web sphere to find [a card at random](https://scryfall.com/random) and attempting to impelment it here. Or if you're looking for something more challenging, have a read through of this code and see if you can refactor it to handle certain events or effects in a more straightforward way.
