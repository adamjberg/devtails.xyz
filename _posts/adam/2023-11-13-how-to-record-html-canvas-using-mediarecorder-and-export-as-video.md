---
layout: post
title:  "How to Record HTML Canvas using MediaRecorder and Export as Video"
permalink: /@adam/how-to-record-html-canvas-using-mediarecorder-and-export-as-video
image: assets/img/how-to-record-html-canvas-using-mediarecorder-and-export-as-video
author: adam
description: This post demonstrates how to create a basic animation on an HTML Canvas and export it to a video file
tags: dev js
---

## Why?

I'm building [kaizen.place](https://kaizen.place), a streaming platform for musicians to incrementally release their music. One feature I was keen to get was the ability to instantly share new uploads on social media in an engaging way.  This ultimately led me to explore creating an animation on the canvas and exporting as a video to be uploaded to a person's prefferred social media site.

## Create index.html

We will do most of our work using JavaScript, but we still need an index.html to load this up.

```html
<!-- index.html -->
<html lang="en">

<head>
  <script src="/index.js" defer></script>
</head>

<body>
</body>

</html>
```

## Create Canvas

```js
// index.js
const canvas = document.createElement("canvas");

canvas.width = 400;
canvas.height = 400;

document.body.appendChild(canvas);
```

## Add Render Loop

In order to draw some kind of animation to the canvas, we'll need some kind of rendering loop.  In the browser, [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) calls the callback function before the next repaint.  It's important to note, that the frequency will match your monitor's refresh rate.
 
```js
// index.js
const ctx = canvas.getContext("2d");

function render() {
  requestAnimationFrame(render);
}

render();
```

## Moving Rectangle

The `render` function is now called on every frame.  To create a simple animation, each frame we update the x and y positions by 1 pixel and draw a red rectangle with width and height of 40 pixels.

```js
// index.js
const ctx = canvas.getContext("2d");

let x = 0;
let y = 0;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(x, y, 40, 40);

  x += 1;
  y += 1;

  requestAnimationFrame(render);
}

render();
```

## Record Using Media Recorder and Save As Video

The following code uses the [HTMLCanvasElement captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) method and the [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

The code below starts recording after we've started the animation.  After 4 seconds, it stops recording and automatically starts downloading the file. 

**Important Note:** Different browsers support different file formats.  Chrome appears to only support "video/webm" and Safari only supports "video/mp4".  If you are using Safari, make sure to replace "webm" below with "mp4".

```js
const canvasStream = canvas.captureStream();
const mediaRecorder = new MediaRecorder(canvasStream, { type: "video/webm"});

let chunks = [];
mediaRecorder.ondataavailable = (e) => {
  chunks.push(e.data);
};

mediaRecorder.onstop = () => {
  const blob = new Blob(chunks);
  const recordedVideoUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.download = "video.webm";
  downloadLink.href = recordedVideoUrl;
  downloadLink.click();
};

mediaRecorder.start();

setTimeout(() => {
  mediaRecorder.stop();
}, 4000);
```

## Next Steps

If this is all you need, you're good, get out of here! For my needs (and possibly yours), ending with a webm file was insufficient.  Very few apps and sites accept webm and so you're left having to manually convert this before putting it anywhere.  

In a future post, I'll go over how to use ffmpeg.wasm to convert to mp4.