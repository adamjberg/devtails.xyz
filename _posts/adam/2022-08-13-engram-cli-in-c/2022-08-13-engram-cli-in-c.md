---
layout: post
title:  "engram Command Line Interface in C"
permalink: /@adam/engram-cli-in-c
image: 
author: adam
description:  
tags: dev engram
---

The overall goal of [engram](https://github.com/adamjberg/engram) has always been going from "thought to jot" as quickly as possible.  I started with a [web application](https://engram.xyzdigital.com/), which eventually was too slow for my liking on mobile, so I ended up writing [Swift iOS version](https://apps.apple.com/ca/app/engram/id1568952668).  In using the application more and more, I keep coming back to the idea that most of what I want it to do can be accomplished very well inside a terminal-like environment.  Unfortunately, neither iOS nor Android really gives you access to the terminal.  I played around with a [terminal on the PinePhone](https://twitter.com/devtails/status/1547387264346591232) and was really pleased with having this kind of an interface on a phone.

I have since managed to get an [application together using SDL that allows me to render my own terminal](https://twitter.com/devtails/status/1551278096292032512) on pretty much any device I like.  This has inspired me to take a deeper look into what a CLI version of engram should look like.  In a recent post, I went over some of the reasons I'm [switching development over to C](/@adam/switching-to-c-over-modern-programming-languages).  In this post, I'll lay out some requirements for my MVP CLI version on engram.  This is mostly for me to organize my thoughts, but will be useful to refer back to once actually written.

# Creating a Note

As mentioned earlier, the primarly objective of this application is to provide a place to quickly gather thoughts as they come up. Supporting this in the CLI is fairly easy as we can accept input from the user and then store that note how we wish.

# Listing Notes

Writing a note is (almost) useless if you are unable to view it afterwards. I want to be able to list a certain number N of previous notes with as few keystrokes as possible.  I have determined that `l` will be a shorthand command to list messages.  By default, it will list out the last 10 notes.  It will also optionally allow passing an integer N to specify how many notes should be printed out.

# Clear Screen

This app attempts to help calm the mind when there's too many things coming to mind.  Having an entire terminal full of text is straining on the eyes and stressful for the brain.  Once I have seen what I want to see, I would like to be able to hit "Return" with an empty note and have the screen cleared. This way I can have a fresh plate to work off of.

# Data Storage

I have tossed and turned over how to store data.  As a secondary goal of this project is to promote learning of software concepts, I have decided that the data storage layer must be written as part of this, rather than using some off the shelf database.  This is tough, as I'm not sure what I want to be able to support yet, but I will introduce more complicated data storage only as it becomes necessary.

For the current MVP, I only need to be able to create a new note and display N number of recently added notes.  

## Writing

These notes must persist across sessions, so they will need to be written to disk in some form.  Since we only need to support creating notes, we can simply append the new data to a file `engram.db` once it's written.  

## Reading

On initialization, the program will load up the entire "database" and any reading will be done from the in-memory representation.  This should both be easier to write as well as provide faster access than reading directly from the file.

# Next

With some specific requirements in mind, I hope to be settled on a `0.0.1` version of the engram cli.  I will be following this up with the actual C code required to accomplish this.  Once this is together, it should be possible to install from source and have the first iteration of this running on your machine ready for whatever you've got brewing in your mind.