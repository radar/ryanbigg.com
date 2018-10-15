---
wordpress_id: RB-1539639737
layout: post
title: Working Towards Integration Testing Duolithic Applications
---

I've been revisiting [Twist v2](https://github.com/radar/twist-v2) recently. It's my book review tool that I've rebuilt multiple times over the past 8 years. Its latest incarnation is what I'm calling a "duolith": a very light Hanami backend application with a GraphQL API, and a frontend built with React and Apollo.

The backend and the frontend codebases are kept in separate directories in the same codebase. This allows for separation between the Ruby and JavaScript code, but also the ability to commit changes to both at the same time. The frontend knows how to communicate with the backend, but the backend is frontend-agnostic. Tomorrow I could replace it with Vue and the backend wouldn't care at all.

I've got pretty extensive testing for the backend, but sparse tests for the frontend. But nothing testing the connection between the two. So I've been thinking about how to write some integration tests to cover everything. In the apps I'm used to (Rails ones), I'd just drop some tests into `spec/features` and it would Just Work™ because that's what Rails is good at.

But this time I've made my life (intentionally) harder by separating the codebases, with the intention over the long-term being that these two codebases are easy to navigate due to their clean separations. The time between re-visiting this app can be months, so it's important that it's easy to grok again once I come back to it.

---

Integration testing though is an interesting problem. I know I need some sort of test harness that boots a database, the backend app and the frontend app and then runs some tests over it? But how would I do that?

But then there's an added complication: for each test I need to setup specific data to test it. And that data should be included in the test itself, so it's easy to find what's relevant to this particular test.

To start with, I tried creating a completely separate thing called `integration` at the top-level of this repository, but ran into issues with how to setup the data cleanly. I wanted classes from the `backend` application, but in `integration` they weren't there.

So I tried another tack: putting the integration tests in the `backend` application. This instantly meant that I could access classes to create data for my tests. I could then also rely on the RSpec suite of tests that were already there, extending it a little further.

I've been [looking into Docker Compose] for just this and it seems to be working. I can start up:

* A database
* Migrations (to create the tables)
* Frontend application
* Backend application
* Feature tests

And then it (should) run those tests in an integration test environment. I'm running into some issues at the moment with Chrome, but I think I should have it working soonish.

I've got a work-in-progress branch that I wanted to share here: [twist-v2 @ integration-tests](https://github.com/radar/twist-v2/tree/integration-tests). You can start following along at `docker-compose.yml` to see how things are piecing together. Take a look at `backend/Dockerfile` and `frontend/Dockerfile` too.

I really hope I can get this working because it means that developing duolithic applications would be so much easier.
