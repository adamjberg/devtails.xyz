---
layout: post
title:  "What Does Github For Music Look Like?"
permalink: /@adam/what-does-github-for-music-look-like
image: assets/img/what-does-github-for-music-look-like.png
author: adam
description: This post explores Git/Github concepts and how they apply to music
tags: dev
---

A few years ago this question entered my brain.  It led to the creation of [kaizen.place](https://kaizen.place/?filter=newest) where we are actively exploring this.  In this post, I’d like to run through the parellels between software and Github, what corresponding concepts might look like for music and how they currently work in Kaizen.

## Repository

A repository seems like an easy place to start.  Even in software, a “repository” could just as easily be called a project.  In music lingo, this is probably most analogous to an album.  The goal of the repository is to be a central place where everything related to that project is stored.  

On Kaizen, a “Project” is currently the closest thing to a repository right now.  

## Commits

As a software developer, a commit is the next most obvious thing that comes to mind when I think of Git/Github.  Commits are little checkpoints made on the way to some kind of larger progress.  

I can see the value of bringing something like this to the music creation process, but in reality it feels cumbersome.  The music process seems less linear.  With code, I know I have made progress towards my ultimately goal (*cough* usually…), but with music you might try something one direction and then go a different direction.  

Much like with code, I think it’s more of a personal preference what you define as a commit.  Say you try something with your track and want to remember what it sounds like, that might indicate a good time to take a snapshot.

It’s not perfect, but with Kaizen currently you can capture a version at these “checkpoints”.  Right now, these would be bounced to a single mp3, meaning you couldn’t really go back to the state of things in your Digital Audio Workstation (DAW). I’m unclear how much value there would be to bringing this kind of granualrity to things.  As long as you are still working within the same session, you should be able to undo/redo yourself back to where you’d like to be.

## Push

I would argue that the “push” is currently where Kaizen enters the picture. When coding, I typically push when I have made some tangible progress or am ready to get eyes on what I’ve been working on.  For a musician, this would be uploading a new version of their track to Kaizen.

## Release

Currently uploading a track and releasing it are nearly synonymous.  I could see this changing in the future to better identify something as a “release” vs. just an update.  In software, you could make several changes to your project over weeks, but only once they were all in together would you compile that into a release.  I think the same would be mostly true for music.

## Pull

The closest thing to a pull right now would be just downloading a version of a song.  Unfortunately, right now this wouldn’t give you access to things like the stems, or the workspace that the music was created in.  I’m still undecided as to whether this should be solved and, if so, how.  One possible option could be only storing a single audio file for each version, but then using AI to extract the stems if someone is looking to use them in some different way.  

## Branches

With code, branches make sense because it is reasonably feasible to manage merging text changes that have drifted apart.  I think something like branches would look quite different.  Instead of something like “feature” branches, it might look more like a branch to explore a possible song direction.  If this were true, branches would likely never get merged back in to some main branch.  Instead whatever branch was the preferred direction would be the one that is followed.  

An example of this could be a “sad piano” branch and an “upbeat acoustic” branch.  While the current status quo says that you need to pick one for your final release, I think the freedom to be able to simply have both wins.  You might like one better than the other, but fans might have their own preferences.  

## Fork

This is one of the more interesting concepts when mapped to music.  Forking a song could clarify where inspiration came from.  When forking software, it’s likely you are using most of the existing code that you are forking, I think this is less true of music.  You might fork for only a small sample or stem of a piece of music.  But I think the ability to give credit and show the ancestry of the music is special.

## Collaborators

I found it fascinating when I learned that the Postal Service came up with their name because they were essentially sending songs back and forth and incrementally updating them.  This seems like it would be quite common when working with a group of people rather than just yourself.  It would be great to be able to have Projects with multiple collaborators assigned that can each have access to upload new versions.  With both getting credit for being a part of the composition.

## Closing Thoughts

There are still many more thoughts swirling for me on this topic, but I think this is a good place to stop.  A larger topic that I didn’t get into is diffing audio files.  I will likely make that a subject of my next post and likely use it as an opportunity to put some kind of demo together for it.