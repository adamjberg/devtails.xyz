---
layout: post
title:  "3 Lines of Code Shouldn't Take All Day"
author: adam
author_rank: 1
permalink: /3-lines-of-code-shouldnt-take-all-day
image: assets/img/IMG_3498.jpg
description: "Reflections on my time at Electronic Arts and techniques used to improve iteration times in video game development"
tags: tails
prev:
  url: /how-to-set-up-server-side-rendering-ssr-with-react-and-esbuild
  title: "How to Set Up Server Side Rendering (SSR) With React, express.js, and esbuild"
nxt:
  url: /building-my-first-command-line-interface-with-rust
  title: "Building My First Command Line Interface (CLI) with Rust"
---

![](/assets/img/IMG_3498.jpg)

I have worked at 5 different software companies with a mixture of game development, mobile development, and web development. Across all of these, one topic stands out that does not get the attention it deserves: time to iterate.  Originally I planned to write about build times, but I think iteration times more accurately captures the full picture. For the purpose of this post, I define iteration time as **the amount of time it takes to see a change in code working as expected**.

The goal of this post is to help remind you to reflect on your current development process. Is there some piece of your pipeline taking longer than it needs to? Is there a way to create some debug tools that makes it easier to test a change? Would unit testing bring benefits, but you keep avoiding it because you think there's a big upfront cost to it?

## Electronic Arts

I joined the FIFA team as an intern back in 2014.  Completely new to the world of AAA game development. I remember my eyes widening when I saw that my desktop had 16 (maybe more?) CPU cores available. Then I remember following instructions to get things set up and was told to prepare for at least 30 minutes for the initial build. I'm told the incremental builds will be much faster after this.

While the incremental builds were indeed much faster a single line of code change would still easily take more than 10 seconds to compile. As a relatively new C++ developer at the time, the number of syntax errors I made was high. **Every time I made a code change I was subjected to 15 seconds of waiting to see what I did wrong**.

### 3 Lines of Code Shouldn't Take an Entire Day to Write

This is the sweet spot amount of time where you become tempted to "do something else" while you wait.  I may have googled something random, attempted to make another change, or checked my instant messages.  Inevitably, I would be distracted and it could easily be a full minute before I checked back in on my compile status.

Compiling was just the first step. Now the application needed to be bundled and deployed to whatever console I was working with. When I first started I worked with the PS Vita, Nintendo 3DS, and Nintendo Wii. After another 30 or so seconds the game might have made it's way to the console. Now I need to boot up the game, navigate to the specific game area that I'm working on, and finally I might be able to see my change.

I often worked in the realm of competition logic. Testing changes here could mean progressing through several seasons of career mode in order to test out a change.

No joke, **it would take an entire day to change 3 lines of code** and know that it actually worked correctly.

### Debugging Tools

I eventually moved on to the newer consoles and was introduced to "testbeds". These were slimmed down packages that attempted to reduce iteration times by only focusing on a particular area of code. Once I found the one for Career Mode, I pretty much never ran the game again. This testbed would build in a few seconds and had all kinds of debug functionality built it. It all ran on the PC, which made things even quicker.

I was stoked! But I watched the people around me and it was clear to me that many didn't know how to utilize this tool. They instead followed the old way of booting up the full game, manually navigating through the UI to get to where they needed to be to test a change. I quickly became a champion for the testbed and frequently added new features that made it easier to develop new things.

I still occasionally had to run the full game, but this testbed **saved my sanity** as it allowed me to **quickly experiment** and **learn how the code worked**. It also allowed me to fix actual issues at a reasonable (by my standards) rate.

### Unit Testing

Eventually I moved teams again and this time I find that unit testing has been initiated on this team. While I had some experience with unit testing at the time, I had never used in game development. 

I get an introduction to the code, the different tests, and how to run things. I find out that the test package essentially only contains the code for the specific area of the game that our team works on. A clean build took maybe 10 seconds and the incremental ones after that were probably under a second. 

It's hard to emphasize just how important this threshold is. **At less than a second to compile (and run) the tests, I can now actually continually focus on a task**. Compile and logic errors are inevitable.  But when I can quickly spot the error and re-compile it allows one to enter a state of flow. 

For the first time, I started enjoying writing code at work. Refactoring and moving large blocks of code was a breeze.  It became much easier to modify someone else's code and know that I didn't completely break everything. The **anxiety of making code changes disappeared**. 

I went on to re-write the competition logic to speed it up and to add unit tests. There were all kinds of edge cases that made unit testing the perfect method for making sure all the bases were covered. When I finally left the company I felt better knowing that **I left a system that had its own checks in place**.  The hours of me figuring out how something is supposed to work is codified in a test spec. 

## Closing Thoughts

I'm grateful in many ways for my time at EA. This was one of the many times I was able to see long term engineering initiatives take root and provide real day to day benefits. At some point, someone had to have stepped up and said **"it takes too darn long to test these changes, is there a better way?"** This is a question we should be asking ourselves every day. In a future post, I will go over how web developers needs to start taking iteration time more seriously as the influx of new tools and frameworks starts to bloat up build times.