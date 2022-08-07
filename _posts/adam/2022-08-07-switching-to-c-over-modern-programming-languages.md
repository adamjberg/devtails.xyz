---
layout: post
title:  "Switching to C Over 'Modern' Programming Languages"
permalink: /@adam/switching-to-c-over-modern-programming-languages
image: assets/img/old-buglaria.jpeg
author: adam
description: In computers, we often refer to a native language as the language understood by the computer. I've recently flipped this around in my ponderings and thought more about what my personal native programming language is.
tags: dev engram
---

![](/assets/img/old-buglaria.jpeg)
<figcaption>Nessebar, Bulgaria or concept art for a new Elder Scrolls game</figcaption>

## The Excitement of a New Programming Language

About a year ago, I decided I wanted to know more about all the Rust hype. I read the [Rust book](https://doc.rust-lang.org/book/), followed a couple tutorials, and read [Rust in Action](https://www.manning.com/books/rust-in-action).  Somewhere in between all of this, I decided I was ready to write my [first CLI notes application on my own with Rust](https://medium.com/p/b6beb9c284e0).

<div class="text-center">
<iframe style="border: 0; width: 700px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=535167567/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/track=3913189530/transparent=true/" seamless><a href="https://ryanwhyman.bandcamp.com/album/october">october by Ryan Whyman</a></iframe>
<p style="font-size: 14px">Classical music with incredible tavern-like vibes to further embed my RPG analogy</p>
</div>

If you are a gamer, **starting a new programming language is a bit like starting a new character in an RPG**.  Everything is exciting at first as you try out your new build.  As you get further along, you realize the same things that frustrated you with your previous build start to show up.  I've come to identify that these "frustrations" are usually mostly boredom. In the context of video games, starting over because you are bored makes a lot of sense.  The whole purpose of a video game is to have fun.  However in software, starting over is a much bigger deal. In this post, I'll go over some of the reasons I've decided to put Rust (and other languages) on the shelf and instead focus my energy on (re)learning C.

## "Native" Languages

In computers, we often refer to a native language as the language understood by the computer. I've recently flipped this around in my ponderings and **thought more about what my personal native programming language is**.

As a teenager, I babbled around with Java, but this was more parroting exactly what I saw in tutorials.  The first language I properly learned was C in first year of my engineering degree.  Success in this class seemed almost binary; students either did very well or extremely poorly.  This makes sense to me because with programming it either works or it doesn't.  In this class, I learned all the fundamentals of programming and loosely how a computer actually worked. My experience in the class solidified my belief that programming was what I wanted to do and **forged a bond with the C language that I didn't realize until now.**

Nowadays I'm fluent (or at least functional) in many programming languages: C, C#, C++, Assembly, Php, Java, Golang, Rust, Swift, ActionScript 3, JavaScript, TypeScript, Haxe, and Python. As a person actively trying to learn a new human language (Bulgarian), I often draw parallels to computer language learning.  **We all seem to agree there's something special about our "mother" tongue**.  In my case, this is English and when I speak or write the words just flow right out.  My Bulgarian, however, runs through multiple layers of searching for the correct word, translating in my head, and stressing about pronunciation before it's able to come out.  There's certainly an eventual possibility of fluency, but I know nothing will ever feel the same as English.

The number one thing people respond with when you mention C is "oh wow, C is so hard".  Reflecting back, **I remember JavaScript, Swift, and Rust being some of the most difficult languages to wrap my head around**.  There's just so much "magic" happening in each that it's difficult to figure out what's going on.  When I'm writing code in these languages, I realize my brain is effectively writing psuedo-C code and then transpiling to whatever language I'm working with.

**I started to wonder why I was even learning these new languages.**  I started JavaScript because it was the only way to get something interactive on the web (in the post-Flash world). Then I started Swift because that's effectively the only way Apple allows you to write iOS apps. Finally, I started learning Rust... mostly because it was trendy to do so. 

I learned a lot from how each of these languages differ, but each one left a sour taste in my mouth.  I'm tired of **how slow JavaScript is** (especially in web dev land where we're making all kinds of micro-optimizations, when there's probably a minumum 2x speedup just by using a different language).  Swift feels like a **pair of Apple branded handcuffs**. I don't feel confident I would (or even could) use it outside their walled garden, and I know that I won't accept only being able to develop on one platform. **I hoped that Rust might fill the sweet spot between the two**.  I still think it has the potential to.  Unfortunately, I found the **syntax clunky** and spent way more time "learning" than actually being able to write code.  Admittedly, this would slowly go away as I gained more experience with the language.  For now, I'm not ready to make that committment considering the strong liklihood that Rust might not catch on. I also **haven't really experienced the problems Rust claims to be solving in C/C++.**  This is likely because I haven't spent enormous amounts of time in C/C++, but I think it's prudent to properly understand a problem before reaching for a solution.

## Programming in the Key of C

I recently had a bit of a lightbulb moment of remembering that **C can be compiled for the web with emscripten.**  I have toyed with this in the past, but this time took some time to put together a [proof of concept Pong game written in C using the SDL library](/@adam/building-pong-in-c-with-sdl2-and-emscripten-part-1).  

I was a game developer well before I was a web developer and I've always found the way a **game engine runs to be much more intuitive than a website.**  I have started experimenting with writing non-game applications with SDL.  The first being a GUI terminal like application for note taking.  It took me some time to wrap my head around what I needed, but I now have a functional application.  I will hopefully soon follow up with a post specifically about this application.

<div class="text-center">
<img src="/assets/img/engram-c-sdl.jpeg" height="400px"/>
<p style="font-size: 14px">Screenshot taken from iOS</p>
</div>

I went a step further with a few extra steps had the same code running on my iPhone 6.  The same phone that Apple doesn't support compiling Swift applications for.  After looking up compatibility for SDL, I noticed it is able to run on iOS 6 and greater, meaning it supports iOS devices all the way back to iPhone 3GS.  Another win for this method as I can avoid both Swift and Objective-C, while still having better iOS compatibility than most modern "iOS developers."

On the web development side of things, I have become increasingly frustrated with the options for "installing" a web application.  Interacting with the local file system doesn't really exist, and the concoction of service workers, IndexedDB, etc. to get something to properly work offline is far too complicated. With C, it's dead simple to read and write files the way that I know and love. Making an offline-only application is the natural default, with online capabilities being added functionality.

In my opinion, web applications should act as a complement to a properly installed application. We are already kind of seeing this with Electron (and others) allowing companies to export their web application (e.g. Slack) as a desktop application.  I'm interested in exploring whether working in the opposite direction makes sense. e.g. writing the application in C for the desktop and then making sure that same code is able to run in the browser.  

I'm tired of being unable to access my applications without internet.  I'm tired of having 3-4 tabs always open.  I'm tired of how long it takes to open applications.  Our processors have become so much faster, but we have mostly used this as an excuse to write sloppier applications.

## Closing Thoughts

For now, this feels like starting a new character all over again. I will probably come out on the other side with a lot of the same feelings about C as other languages.  Thankfully, I strongly believe that gaining a better understanding of C is much more valuable than most other languages.  C is the foundation on which everything else was built on top of. Maybe I will find the complicated syntax and rules of Rust are worth it.  This is a decision I want to be making myself, rather than blindly trusting what happens to be posted on the Internet.

Ultimately, learning is what this is mostly about, but if I happen to come out of this with a new preferred way of writing applications, I wouldn't complain.  I will be following up with code once I've cleaned things up a bit.  You can subscribe below or follow the [engram](https://github.com/adamjberg/engram) repository as that is where it will land.