---
layout: post
title: How to Create a Waveform Video From Audio Using HTML Canvas and JavaScript
author: adam
permalink: /@adam/how-to-create-waveform-video-from-audio-using-html-canvas-and-javascript
description: Tutorial for how to render a waveform animation using the audio data from a sound file in the browser.
image: 
tags: dev js
---

This tutorial covers how to draw an audio waveform on an HTML canvas using JavaScript.  Once you understand the code below you can export the canvas to a video file by following [How to Save HTML Canvas to Mp4 Using WebCodecs API 10x Faster Than Realtime in the Browser](/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api) or [How to Record HTML Canvas using MediaRecorder and Export as Video](@adam/how-to-record-html-canvas-using-mediarecorder-and-export-as-video).  The first option renders more quickly, but you may find the canvas recording option has more consistent browser support.

## Demo

Below is an example of what this will look like:

<video src="/assets/video/reel-generator-sample.mp4" controls height="400px"></video>

The above was created using kaizen.place's [Audio to Waveform Video Reel Generator](https://kaizen.place/reel-generator?utm_medium=blog&utm_source=devtails.xyz&utm_content=textlink). This post is a simplified version of this tool to showcase how to convert audio data into a visual waveform representation.

## The Code

### Create index.html

```html
<!-- index.html -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audio to Waveform Video</title>
  <script src="index.js" defer></script>
</head>
<body>
  
</body>
</html>
```

### Create index.js

```js
async function run() {
  const audioBuffer = await loadAndDecodeAudio("sample.mp3");

  // For simplicity, only using the first channel of data
  const channelData = audioBuffer.getChannelData(0);

  // This tracks the maximum average seen across all chunks
  let max = 0;

  // How many milliseconds a chunk represents
  const msPerChunk = 100;

  // How many data points will be included in each chunk
  const chunkSize = Math.round((audioBuffer.sampleRate * msPerChunk) / 1000);

  // To get the average we need to sum up all values in the chunk
  let chunkTotalValue = 0;

  // As we compute chunk averages store them in this array
  let chunkAverages = [];

  // This primarily helps cover the final case where a chunk has fewer values
  // than the chunk size
  let currentChunkSize = 0;

  for (let i = 0; i < audioBuffer.length; i++) {
    // Channel data will be between -1 and 1
    // Absolute value ensures negatives don't just cancel out positives
    const value = Math.abs(channelData[i]);

    currentChunkSize++;

    chunkTotalValue += value;

    if (i > 0 && (i % chunkSize === 0 || i === audioBuffer.length - 1)) {
      const chunkAverage = chunkTotalValue / currentChunkSize;
      if (chunkAverage > max) {
        max = value;
      }
      chunkAverages.push(chunkAverage);
      chunkTotalValue = 0;
      currentChunkSize = 0;
    }
  }

  // Use the max average we found to normalize the averages to be between 0 and 1
  const normalizedChunkValues = chunkAverages.map((avg) => {
    return avg / max;
  });

  // Create a canvas and add to the document to draw on
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1280;

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  render({
    canvas,
    ctx,
    normalizedChunkValues,
    startTime: new Date().getTime(),
    msPerChunk,
  });
}

function render({ canvas, ctx, normalizedChunkValues, startTime, msPerChunk }) {
  // The elapsedTime allows us to know how far into the audio we are
  const elapsedTime = new Date().getTime() - startTime;

  // Clear the entire canvas to remove any drawings from previous frame
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFFFFF";

  const barWidth = 4;
  const barSpacing = 4;
  const maxBarHeight = 200;

  for (let i = 0; i < normalizedChunkValues.length; i++) {
    // normalizedChunkValues will be a float 0-1 - a percentage of max amplitude
    const value = normalizedChunkValues[i];
    // The highest amplitude part of audio will get a bar at the max height
    const barHeight = maxBarHeight * value;

    // This moves the bars based on how much time has passed
    const xOffset = (elapsedTime / msPerChunk) * (barWidth + barSpacing);

    // Spaces out the bars
    const x = i * (barWidth + barSpacing) - xOffset;

    // Centers the bars to the middle of the canvas
    const y = (canvas.height - barHeight) / 2;

    // Draws the bar at the calculated position and size
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  // Calls this function again at the start of the next frame
  // Typically this is 60fps, but will depend on the display rate of your monitor
  requestAnimationFrame(render.bind(this, ...arguments));
}

// Helper function to fetch and decode from a URL
async function loadAndDecodeAudio(audioURL) {
  const response = await fetch(audioURL);
  const arrayBuffer = await response.arrayBuffer();
  return decodeAudioData(arrayBuffer);
}

// Decodes the ArrayBuffer into an AudioBuffer
// This gives access to the raw channel data which we use to generate the waveform
// https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData
async function decodeAudioData(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

run();
```

### Try it out

#### Add sample.mp3

You can use whatever audio file you like.  If you don't have one you can grab a sample one from [here](https://file-examples.com/index.php/sample-audio-files/sample-mp3-download/).

#### Run http-server

```bash
npm i -g http-server
http-server .
```

#### Open Browser

Head to [http://localhost:8080](http://localhost:8080) and you should see the canvas animating through the waveform generated from the audio file.

### Next Steps

This creates a nice animation in the browser, but if you want to send this somewhere it is very likely you want to download this as a video file (specifically mp4).  You can either follow [How to Save HTML Canvas to Mp4 Using WebCodecs API 10x Faster Than Realtime in the Browser](/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api) or [How to Record HTML Canvas using MediaRecorder and Export as Video](@adam/how-to-record-html-canvas-using-mediarecorder-and-export-as-video) to take this canvas drawing and export a video file.  

Alternatively, if it suits your needs you can use the kaizen.place [Audio to Waveform Video Reel Generator](https://kaizen.place/reel-generator?utm_medium=blog&utm_source=devtails.xyz&utm_content=textlink).