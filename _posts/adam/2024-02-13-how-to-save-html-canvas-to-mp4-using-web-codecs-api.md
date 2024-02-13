---
layout: post
title: How to Save HTML Canvas to Mp4 Using WebCodecs API 10x Faster Than Realtime in the Browser
author: adam
permalink: /adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api
description: After using the MediaRecorder to capture a canvas as a video, I figured there was a better way.
image: assets/img/canvas-to-mp4.png
tags: dev js
---

## The Problem

In working on an Audio [Waveform Reel Generator](https://kaizen.place/reel-generator) for [kaizen.place](https://kaizen.place/), I found a few resources to record a canvas using the [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) API [[1](https://julien-decharentenay.medium.com/how-to-save-html-canvas-animation-as-a-video-421157c2203b)][[2](https://blog.theodo.com/2023/03/saving-canvas-animations/)], a method used for the initial implementation (I wrote about it [here](https://devtails.xyz/@adam/how-to-record-html-canvas-using-mediarecorder-and-export-as-video)). Unfortunately, the only browser that seemed to record directly to `mp4` was Safari.  Chrome would record as a `webm` file which Instagram doesn’t support.

We were able to bridge the gap by using [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) to convert our webm file to an mp4.  However, on top of a 60 second recording session, we now also had another step in the pipeline and a 30 MB download, slowing things down even more.  With some careful codec selection, it was possible in some browsers to record webm with a codec that could simply be copied over to an mp4 container, which brought things to a somewhat acceptable level.

The MediaRecorder quality wasn’t great and I knew the drawing operations couldn’t be taking more than a millisecond, which meant most of the time was spent just waiting. I knew there must be a better way.

## The Solution

The code presented below uses the [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) and the [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) npm package to encode a video from a canvas source up to 10 times faster than realtime.  A working demo of this code can be found [here](https://canvas-to-mp4-main-dev-tails.engram.sh/).

## Initialize Project

```bash
npm init
```

## Install [mp4-muxer](https://github.com/Vanilagy/mp4-muxer/tree/main)

```bash
npm i mp4-muxer
```

## Create Index.html

```bash
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas To MP4</title>
  <script src="index.js"></script>
</head>
<body>
  
</body>
</html>
```

## Install esbuild

```bash
npm i esbuild
```

## Update Build Command in package.json

```bash
"scripts": {
  "build": "esbuild src/index.ts --bundle --outfile=public/index.js"
},
```

## Add JavaScript

```jsx
import * as Mp4Muxer from "mp4-muxer";

async function run() {
  const canvas = new OffscreenCanvas(720, 1280);
  const ctx = canvas.getContext("2d", {
    // This forces the use of a software (instead of hardware accelerated) 2D canvas
    // This isn't necessary, but produces quicker results
    willReadFrequently: true,
    // Desynchronizes the canvas paint cycle from the event loop
    // Should be less necessary with OffscreenCanvas, but with a real canvas you will want this
    desynchronized: true,
  });

  const fps = 30;
  const duration = 60;
  const numFrames = duration * fps;

  let muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),

    video: {
      // If you change this, make sure to change the VideoEncoder codec as well
      codec: "avc",
      width: canvas.width,
      height: canvas.height,
    },

    // mp4-muxer docs claim you should always use this with ArrayBufferTarget
    fastStart: "in-memory",
  });

  let videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error(e),
  });

  // This codec should work in most browsers
  // See https://dmnsgn.github.io/media-codecs for list of codecs and see if your browser supports
  videoEncoder.configure({
    codec: "avc1.42001f",
    width: canvas.width,
    height: canvas.height,
    bitrate: 500_000,
    bitrateMode: "constant",
  });

  // Loops through and draws each frame to the canvas then encodes it
  for (let frameNumber = 0; frameNumber < numFrames; frameNumber++) {
    drawFrameToCanvas({
      ctx,
      canvas,
      frameNumber,
      numFrames
    });
    renderCanvasToVideoFrameAndEncode({
      canvas,
      videoEncoder,
      frameNumber,
      fps
    })
  }

  // Forces all pending encodes to complete
  await videoEncoder.flush();

  muxer.finalize();

  let buffer = muxer.target.buffer;
  downloadBlob(new Blob([buffer]));
}

// Animates a red box moving from top left to top right of screen
function drawFrameToCanvas({ canvas, ctx, frameNumber, numFrames }) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const x = (frameNumber / numFrames) * canvas.width;

  ctx.fillStyle = "red";
  ctx.fillRect(x, 0, 100, 100);
}

async function renderCanvasToVideoFrameAndEncode({
  canvas,
  videoEncoder,
  frameNumber,
  fps,
}) {
  let frame = new VideoFrame(canvas, {
    // Equally spaces frames out depending on frames per second
    timestamp: (frameNumber * 1e6) / fps,
  });

  // The encode() method of the VideoEncoder interface asynchronously encodes a VideoFrame
  videoEncoder.encode(frame);

  // The close() method of the VideoFrame interface clears all states and releases the reference to the media resource.
  frame.close();
}

function downloadBlob(blob) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "animation.mp4";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

run();
```

## Test it Out With http-server

```bash
npm i http-server
```

### Add Start Script to package.json

```json
"scripts": {
  "start": "http-server public"
},
```

### Run Server

```bash
npm start
```

By default, should be accessible at [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Resources

[1] [Saving Canvas Animations With Media Recorder](https://blog.theodo.com/2023/03/saving-canvas-animations/)

[2] **[How to save html canvas animation as a video](https://julien-decharentenay.medium.com/how-to-save-html-canvas-animation-as-a-video-421157c2203b)**