---
layout: post
title:  "Building a Web Browser With SDL in C++"
author: adam
permalink: /@adam/building-a-web-browser-with-sdl-in-c++
image: assets/img/engram-browser-0.0.1.png
description: An early demo of a web browser and reasons why to even build it in the first place
tags: dev browser
---

![engram browser](/assets/img/engram-browser-0.0.1.png)

You can see the current progress and even read this article using the [engram browser](https://browser.engramhq.xyz/) from your browser.  That's right, **this browser has been compiled with emscripten to wasm so you can run a browser in a browser**.  This post is the first post in likely a series of posts along this journey.  If you are interested in following its progress, you can subscribe to the dev/tails mailing list (sign up at bottom of page) or follow on [Github @engramhq/browser](https://github.com/engramhq/browser).

## Where it's at now

I have played around with SDL several times in the past and will likely be my main external dependency that I lean on to handle windowing, input, and rendering.  In the future, I might explore even removing this dependency, but that feels extreme at this point.

The current browser fetches a hard-coded html document (currently this page you are currently reading) and renders h1-h6 and p tags with different fonts.  Text is line wrapped at 800px to avoid spilling out the width of the window.  With just this, it is already nearly functional.

Scrolling is implemented in a rudimentary fashion where the up and down arrow keys will offset the page up and down.

## Why?

This question has haunted me for so long.  It has prevented me from truly committing to trying things out several times. While I strongly believe "Why not?" is a totally valid answer, here are some other reasons that have cropped up over the past few years.

### A Learning Experience

**A browser combines pretty much all aspects of programming into one.**  This seems like a good opportunity to stretch my current knowledge and stumble on new challenges that I haven't yet experienced. This is probably the number one reason for me at the moment.

### People Think It's Incredibly Difficult

Building a browser that has comparative functionality and stability to modern browsers would be a massive undertaking.  However, I would like to prove that the **basics of what a browser is doing is within the grasp of what any programmer could (and arguably, should) understand**.  At the end of the day, a browser reads some text over a network and then renders it.  **That is it.**

### I Do Not Like That Apple Limits iOS to Using Safari

This App Store restriction seems like it should not even be legal. While a browser application might not be accepted onto their store, we still (for now) have the ability to build and run our own applications on iOS. I have a bit more work to prep the current build for this, but I have already run a few experiments to confirm that I can indeed get an SDL application running on iOS.

This project will remain open source as it evolves, which means as it picks up enough functionality other weirdos like me can eject themselves from Apple's walled garden.

### The Modern Browsing Experience is Frustrating

Back when Steve Jobs killed Flash, he helped position browsers as the way to move forward. This position shifted as Apple realized they could **gouge everyone on their app store** leading them to drag their feet on supporting new browser functionalities (*cough* push notifications).

It has taken us almost a decade, but feels like we've come full circle.  Browsers are now capable of doing everything that Flash was doing decades ago.  Companies, users, and pretty much everyone expects that their "apps" will work in a browser and be fully interactive.  

Unfortunately, much like the days of flash on the web, these "flashy" web pages lack substance and while they might be "secure" by some peoples defintions, I do not feel safe browsing due to the aggressive tactics many websites have taken to. There are large swaths of people like me simply looking to read what other people are writing.  But, our current society tries to convince us that we should only be finding this information through Instagram, TikTok, Twitter, Facebook, or whatever other platform springs up.  

### Browsing the internet has become a game.

Unfortunately for us, not the fun kind.  

After searching for something on Google I first have to scroll down a full page length to avoid paid advertisements. Then I click a link that seems like should have what I'm looking for.  This page takes several seconds to load because there's a mountain of JavaScript and images to load.  Meanwhile the page jankily pulls itself together.  Every half second the layout completely readjusts itself.  

I have learned not to bother attempting to scroll at this point, because this is all some wicked way to get people to accidentally clicking on ads.  Google ads slowly fill up nearly 60% of my screen.  Something that I recently learned is essentially their recommended setup when setting up ads.  

Next is the "all important" cookie notice, that now blocks all interaction with the site.  In most cases, the site has already added their cookie and begun their tracking.  When are we going to **re-assess how terrible this legislation** was?  I can't imagine this helping anyone, but now adds at least one click and a massive distraction to most website visits.

I sell my soul away and click the "Allow Cookies" button.  Lord knows how many more hoops I need to jump through to disable the "non essential ones."  I minimize the horrendous google ad that pops up at the bottom of the screen and finally start reading.  I nervously start to scroll as I get further along. My brain fighting the incredibly distracting colorful video ad.  I've made it through about a paragraph by now.  And then it happens.  The page darkens and a modal pops up.  "Subscribe to our newsletter." Shortly after, the page requests access to send me notifications.  

By this point I'm ready to throw my computer out the window. I really wish this all was an exaggeration, but it feels as if half of my web browsing amounts to something akin to the experience above.  Please do not even get me started about recipe websites...

So how does building a browser help with this?  On its own, it probably doesn't.  But my hope is to use this time exploring what life would be like with a browser without JavaScript support.  I realize that this is possible to enable on current browsers, but there is still a good chunk of my workflow that is tied to web applications that require it.  Perhaps have a secondary browser that I use exclusively for casual browsing and reading could help.

In the future, I would be interested in exploring creating a search engine that explicitly rejects any websites that don't conform with the simple basic "reader mode" that this browser will effectively support.  Thereby creating a smaller web that is a bit more enjoyable to navigate.

### Electron is a total Resource Hog

Yesterday my desktop slowed to a crawl.  I barely managed to open up my resource monitor where I found Slack using several GB of RAM.  I can only guess that it started using so much that it ended up having to use the swap disk.  At 16 GB of RAM, this should never occur. 

With a browser program and I own and control, it would be possible to package up my own web apps as standalone desktop experiences.  Because I'm in control of both, I can make sure the browser only supports what it needs to for a specific application.  This should make it possible to optimize the browser engine better for the web applications I am building.

I am a strong proponent of bringing back desktop applications.  Chrome Web Apps have started to bridge this gap somewhat.  But I still think there's improvements to be made in this realm.

### TypeScript Should be Supported By Browsers

This is somewhat contradictory to my statements about JavaScript above, but I think I would be interested in exploring anyway. "Modern" web development has pretty well settled on TypeScript as the default language to use.  We previously were stuck dealing with the shockingly slow typescript compiler to get ourselves a final bundle that could be shipped.  New challengers have arrived like esbuild showing how just transpilation could significantly speed up this bundling process.  I'm a fan of this, but I can't help but think that all of this becomes obsolete when browsers finally embrace TypeScript.  

The browser already has a JavaSript parsing engine.  All it needs to add on top of this, is the ability to ignore TypeScript types.  I suspect that there are a few trickier TypeScript features that would require on the fly transpilation.  For my own needs and exploration, I would be curious to explore an in between blend that is more of Typed JavaScript.  The typing syntax would be the same as TypeScript to ensure all of that tooling continues to work, but this should make the parsing process much simpler.

The ultimate dream is that we can teach new web developers types from the beginning.  Despite my love of typing, I still often start JS projects without it to avoid the nuisance of pulling in a bundler.  Being able to immediately start with types and no build system would be a great place to end up. And also conveniently gives me an excuse to play around with a JavaScript parser :). 

## What's Next

The most likely next step is to add an address bar to the browser.  For simple blog posts, the current implementation should mostly succeed in rendering the page in a text-only manner.  Having an address bar means I could paste different URLs in and see how different sites perform with it's limited html parsing.

Rendering links would be next on the list.  Once this is available, it becomes possible to actually "browse".  Which is important as this is the entire purpose of a browser.  

I'll check in with a new post once the above has been completed.