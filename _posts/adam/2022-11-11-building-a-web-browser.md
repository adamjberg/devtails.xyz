---
layout: post
title:  "Building a Web Browser With SDL in C++"
author: adam
permalink: /@adam/building-a-web-browser-with-sdl-in-c++
image: 
description: 
tags: dev browser
---

This is a rough first draft that will need to be updated later.  I just wrapped up some work to put together a reasonably functional build: [@engramhq/browser](https://github.com/engramhq/browser).

## Why?

This question has haunted me for so long.  It has prevented me from truly committing to trying things out several times. While I strongly believe "Why not?" is a totally valid answer, here are some other reasons that have cropped up over the years I have put this project off.

### People Think It's Incredibly Difficult

Building a browser that has comparative functionality and stability to modern browsers would be a massive undertaking.  However, I would like to prove that the basics of what a browser is doing is within the grasp of what any programmer could (and arguably, should) understand.  At the end of the day, a browser reads some text over a network and then renders it.  That is it.

### The Browsing Experience Has Become Frustrating

Back when Steve Jobs killed Flash, he helped position browsers as the way to move forward. It has taken us almost a decade, but feels like we've come full circle.  Browsers are now capable of doing everything that Flash was doing decades ago.  Companies, users, and pretty much everyone expects that their "apps" will work in a browser and be fully interactive.  

Unfortunately, much like the early days of flash, these "flashy" web pages lack substance. There are large swaths of people like me simply looking to read what other people are writing.  But, our current society tries to convince us that we should only be finding this information through Instagram, Twitter, Facebook, or whatever other platform springs up.  

Browsing the internet has become a game.  But, not the fun kind.  After searching for something on Google I first have to scroll down a full page length to avoid paid advertisements. Then I click a link that seems like should have what I'm looking for.  This page takes several seconds to load because there's a mountain of JavaScript and images to load.  Meanwhile the page jankily pulls itself together.  Every half second the layout completely readjusts itself.  

I have learned not to bother attempting to scroll at this point, because this is all some wicked way to get people to accidentally clicking on ads.  Google ads slowly fill up nearly 60% of my screen.  Something that I recently learned is essentially their recommended setup when setting up ads.  

Next is the all important cookie notice, that now blocks all interaction with the site.  In most cases, the site has already added their cookie and begun their tracking.  When are we going to re-assess how terrible this legislation was?  I can't imagine this helping anyone, but now adds at least one click and a massive distraction to most external link clicks.

I sell my soul away and click the "Allow Cookies" button.  Lord knows how many more hoops I need to jump through to disable the "non essential ones".  I minize the horrendous google ad that pops up at the bottom of the screen and finally start reading.  I nervously start to scroll as I get further along. My brain fighting the incredibly distracting ad that is for some reason a video.  I've made it through about a paragraph by now.  And then it happens.  The page darkens and a modal pops up.  "Subscribe to our newsletter". At the same time the page requests access to send me notifications.  

By this point I'm ready to throw my phone out the window. I really wish this all was an exaggeration, but it feels as if half of my web browsing amounts to something akin to the experience above.  Please do not even get me started about recipe websites...

So how does building a browser help with this?  On its own, it probably doesn't.  But my hope is to use this time exploring what life would be like with a browser without JavaScript support.  I realize that this is possible to enable on current browsers, but there is still a good chunk of my workflow that is tied to web applications that require it.

I would be interested in exploring creating a search engine that explicitly rejects any websites that don't conform with the simple basic "reader mode" that this browser will effectively support.

### TypeScript Should be Supported By Browsers

This is somewhat contradictory to my statements about JavaScript above, but I think I would be interested in exploring anyway. "Modern" web development has pretty well settled on TypeScript as the default language to use.  We previously were stuck dealing with the shockingly slow typescript compiler to get ourselves a final bundle that could be shipped.  New challengers have arrived like esbuild showing how just transpilation could significantly speed up this bundling process.  I'm a fan of this, but I can't help but think that all of this becomes obsolete when browsers finally embrace TypeScript.  

The browser already has some JavaSript parsing engine.  All it needs to add on top of this, is the ability to ignore TypeScript types.  I suspect that there are a few trickier TypeScript features that would require on the fly transpilation.  For my own needs and exploration, I would be curious to explore some in between blend that is more of Typed JavaScript.  The typing syntax would be the same as TypeScript to ensure all of that tooling continues to work, but this should make the parsing process much simpler.

The ultimate dream is that we can teach new web developers types from the beginning.  Despite my love of typing, I still often start JS projects without it to avoid the nuisance of pulling in a bundler.  Being able to immediately start with types and no build system would be a great place to end up. And also conveniently gives me an excuse to play around with a JavaScript parser :).

## Where it's at now

I have played around with SDL several times in the past and will likely be my main external dependency that I lean on to handle windowing, input, and rendering.  In the future, I might explore even removing this dependency, but that feels extreme at this point.

The current browser can load an html from from disk and render h1 and p tags with different fonts.  Text is line wrapped at 800px to avoid spilling out the width of the window.  With just this, it is already nearly functional.  

## What's Next

The first obvious missing piece is that it needs to be able to accept a URL and fetch the HTML file from there.  With most websites on https, this would be complicated to roll on my own.  I will likely lean on the curl library in order to get this going more quickly.

The other current issue that I will probably look into first is figuring out how to scroll the page.  Currently, once the text reaches the bottom of the window the rest can never be seen.  I'm hopeful that there will be some simple method of just offsetting the texture and listening for scroll events.  I won't worry too much about fancy scrolling tricks.  Since it is mostly just text, and I would expect most sane blog posts to have some reasonable length limit, I don't think this would really ever run into major performance issues.

