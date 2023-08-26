---
layout: post
title:  "Reviving My Debut Game: How Ruffle.rs Breathed New Life Into My First Gaming Creation"
permalink: /@adam/reviving-isolated-with-ruffle
image: assets/img/i_solate-preview.png
author: adam
description: A year ago I couldn't even compile my flash game. Now it's available to play online thanks to ruffle.rs
tags: dev games
---

## i_solated

<div id="swf-container"></div>

<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
<script>
    window.RufflePlayer = window.RufflePlayer || {};
    window.addEventListener("load", (event) => {
        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();
        player.style.width = "100%";
        player.style.minHeight = "555px";
        const container = document.getElementById("swf-container");
        container.appendChild(player);
        player.load("/assets/swf/i_solated-2023-08-26.swf");
    });
</script>

## Description

Guide this curious, lonely character through desolate lands and pensive atmospheres searching for a means to continue and for answers.

Use puzzle solving skills in this 2d sidescroll point and click adventure.

## How We Got Here

Over a year ago I wrote about how I was [no longer even able to compile this game](/i-can-no-longer-compile-my-first-flash-game).  Thanks to some helpful readers I was able to start compiling new swfs, but still had no method of making available in the browser. 

I have been following along with [ruffle.rs](https://ruffle.rs/) ever since and heard that recently some major progress was made on ActionScript 3 support.  Their site currently lists this at 70% implemented.  Just before hopping on a plane I decided I would attempt to get this running again.

By the end of the flight, I was able to playthrough the entire game. Interestingly, an issue I was seeing when playing in the Flash Player Projector that made the third level completely unplayable, all of a sudden wasn't an issue. I did have a couple new graphical issues, but the game actually became more playable!

Unfortunately, the sound APIs have still not been implemented.  The gameplay of i_solated is truthfully not that great.  Despite this, between the background music and a couple well animated scenes, there is quite a bit of emotion that can be felt when playing the game.  I am very much looking forward to the day when I can post the full version with working audio as well.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">The sound APIs haven&#39;t been implemented yet, but after commenting out anything requiring them, the game was 100% playable. A couple graphical glitches here and there.<br><br>Excited to put this back up on a website. Apple&#39;s killing of flash should never have been allowed. <a href="https://t.co/nbFI851ETL">pic.twitter.com/nbFI851ETL</a></p>&mdash; Adam Berg (@devtails) <a href="https://twitter.com/devtails/status/1691805194051564028?ref_src=twsrc%5Etfw">August 16, 2023</a></blockquote> 

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Thank You Ruffle

I can't even begin to imagine what an undertaking the Ruffle project has been.  Flash is a fundamental piece of web development history and it's a shame we just let it die without a proper method to preserve history.  I am thankful Ruffle came together to fill this void and wish them luck on their journey to full AS3 support.

