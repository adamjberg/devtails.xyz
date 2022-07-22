---
layout: post
title:  "I Can No Longer Compile My First Flash Game"
author: adam
permalink: /i-can-no-longer-compile-my-first-flash-game
image: assets/1641668778541-i_solated.jpeg
description: A tale about game development and techonlogy obsolescence
tags: tails flash
---

**Update**

With some [help from a HN user](https://news.ycombinator.com/item?id=30583307), I've managed to successfully compile the main swf.  The issue was a combination of not knowing the right command line parameters and there were a [couple code changes that needed to be made](https://github.com/adamjberg/i_solated/issues/4)  Thanks to all who have suggested things, has given me renewed interest in bringing this back to life.  I think a Haxe/OpenFL port is looking like the most likely option to get this running on the web.  Or perhaps helping out the [ruffle.rs](https://ruffle.rs/) project to get AS3 working as intended. That is an adventure for another day.

## iRok2 Media Inc.

![](/assets/1641670725920-irok2.jpeg)

In May 2012, I started my first software internship as a Game Developer at a now defunct startup company iRok2 Media Inc. The above screenshot is one of the few surviving images I can find of the project.

Prior to joining, I had barely scraped together a Pong game in Java.  That was apparently enough to get me in the door. I was immediately thrown into a flash codebase and was in way over my head.

Thankfully, the overwhelmingness dissipated quickly and I soon found myself becoming reasonably comfortable working with ActionScript 3 (the language of Flash programming). The possibilities with Flash seemed endless and prototyping interactive experiences was a fun process.

I started doing some additional learning on weekends and evenings. I picked up the only flash book I was able to find at the library (I think it was a Flash 8 book, which would have already been at least 5 years out of date).  The core concepts still seemed to apply and after completing it, I felt confident I knew what was available to me in the language.

## i_solated

After making a couple simple demo projects, I managed to convince 3 friends to make a game together. I would do the programming, one would do the environment art, one would do the music and sound effects, and one would do the animation.  We would all collaborate on the game design.  The game eventually shaped into *i_solated*.

<video width="100%" controls style="margin-bottom: 8px">
    <source src="/assets/i_solated.mp4" type="video/mp4"></source>
</video>


<figcaption>Our Trailer (Sound On Recommended)</figcaption>

### Indie Game: The Movie

Part of the inspiration for the project was [*Indie Game: The Movie*](https://en.wikipedia.org/wiki/Indie_Game:_The_Movie#:~:text=The%20film%20is%20about%20the,on%20the%20success%20of%20Braid.), a documentary about indie game developers.  The documentary introduced me to the [Independent Games Festival (IGF)](https://igf.com/), an annual competition where indie game developers went to showcase their work. I knew we'd never compete with the quality of games being released there, but upon further investigation, found that they had a student competition. 

The submission deadline was mid-October and we were already heading into late Summer. I knew that a deadline was the only thing that would motivate us to get something put together so I suggested we submit to the student IGF competition.

### Zoop

![](/assets/1641668778541-i_solated.jpeg)
<figcaption>Zoop doing some heavy lifting</figcaption>

Before we had a game idea, the animator of the group showed us a cute little drawn robot character named "zoop".  This became the inspiration for a point and click adventure that would ultimately be titled: *i_solated*.

### Game Design

![i_solated level design](/assets/isolated_level_design.jpeg)
<figcaption>An early drawing of what became the third chapter</figcaption>

We had rough paper drawings of the levels we wanted to have and the "core game mechanic" of a circular pulse that revealed hidden things in the environment. The pulse was actually revealing what the environment looks like in the present time.  Hints of a past civilization exist, but as Zoop goes on his adventure it's unclear if there is any life left on the planet.

### Development

I spent what felt like every evening and weekend outside of work working on the project.  I had never built a project this large and that meant a LOT of learning along the way.

By October, most of the game was put together, but it was still not possible to make it through a full playthrough due to a variety of bugs.  I pulled a near all nighter before the submission deadline to at least get the first couple of levels functional.  I figured it would be some time before the judges actually had a look and maybe if they ran in to a problem they'd reach out and I've have it fixed by then.  Better yet, the submission was just a URL to the game.  Which means I could submit on time and still update the game after the fact.

### Independent Games Festival

I didn't expect this game to win any awards (and it definitely didn't), but working towards something is a significant part of why this game actually got completed.  The official submission can be viewed in the [IGF archives](https://igf.com/isolated).  Hopefully one day I'll return with a new entry in the main competition.  I've learned so much since this project and it would be fun to create something new.

## I Can No Longer Compile i_solated

It's been almost 10 years now, which is a lifetime in software (RIP Flash).  Between my poor documentation and the death of Flash, I am unable to figure out how to compile this anymore. I remember using [FDT](https://fdt.powerflasher.com/) for development, but this program crashes upon opening. I've tried installing the [Flex SDK](https://flex.apache.org/), but running the compiler throws errors about finding the location of certain required files (why these aren't a part of the SDK is beyond me).

Thankfully, my past self decided to commit the final [built `swf` application](https://github.com/adamjberg/i_solated/blob/master/bin/Main.swf) into the code repository. Besides digging out a hard drive I'm not sure even exists anymore, I'm not sure I'll ever be able to modify the game again.

With Flash now unable to run in browsers the only way to play the game is to download the [standalone flash player projector](https://www.adobe.com/support/flashplayer/debug_downloads.html).  Which serves to guarantee that approximately 0 people reading this will ever actually play the game.

This is made more frustrating by the fact that something about newer standalone flash players causes one of the levels to be near unplayable.  I will probably have to accept that it will just remain broken for eternity until I take on the project of rewriting the game.

My commit history shows that I was still making fixes up until January 2013, several months after the competition.  Some were minor tweaks and fixes and I also remember tackling some major performance issues by converting vector graphics to bitmaps.  **Spoiler alert**: I suspect this is what ended up causing many of the issues that can be seen in the final build.  (to my knowledge, these issues did not exist when running the game at the time)

I'm sure it must be possible, so if you're somehow still a Flash wizard and reading this, the full source code is available [here on Github](https://github.com/adamjberg/i_solated).  Fixing the actual problem is a whole other thing, but in order to track that down I'd need to be able to rebuild the game.

## How to Play i_solated

1. Download the [flash player projector](https://www.adobe.com/support/flashplayer/debug_downloads.html) for your respective operating system.
1. Clone or download the repo [https://github.com/adamjberg/i_solated](https://github.com/adamjberg/i_solated)
1. Open the Flash Player Projector and click `File > Open File...`
1. Select `i_solated/bin/Main.swf`

Apparently the build I checked in was a development one, which means it's possible to skip ahead levels by using the Right Arrow key.  Unfortunately, this doesn't correctly clean up audio, so you end up with overlapping songs if you do so.  But it can be a useful way to get a sense of the game.  And because the third chapter renders the past and present layers incorrectly, you pretty much have to skip it (it's technically completable, but quite painful).

## Final Thoughts

When I first started building i_solated, I never could have predicted this current situation. This experience is a reminder that proprietary things come and go.  I have already started the long journey towards future-proofing projects that I work on.  We've seen an explosion of languages, frameworks, and libraries in the last several years.  But how many of these will still be around in 5, 10, or 20 years?  I pretty much only have faith that C and the HTML specification will remain in widespread use.  

Thankfully, I think we'll see better backwards compatibility on these kinds of things.  Though certain realms still feel heavily reliant on central entities.  For example, If NPM ever shut its doors, the process to get your JavaScript project back together again is going to be quite painful.

I miss Flash.  I don't know if we'll ever see the same kind of community around something like it.  I'm glad to have been a part of the story - even though I was a fairly late entrant.  In the future I'll share some more general thoughts on Flash that challenge some of the [conclusions that were drawn by Steve Jobs](https://newslang.ch/wordpress/wp-content/uploads/2020/06/Thoughts-on-Flash.pdf).