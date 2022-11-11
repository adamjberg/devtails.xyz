---
layout: post
title:  "Pitch Detection in Javascript"
author: adam
permalink: /@adam/pitch-detection
image: 
description: 
tags: dev javascript
---

Very much a work in progress.  Pitch detection algorithm from [cwilso/PitchDetect](https://github.com/cwilso/PitchDetect).  I'll hopefully take some time to digest it a bit more in the future.

<div id="pitch-detect"></div>

<script>
  let audioContext;
  let analyser = null;
  let startTime = null;

  const root = document.getElementById('pitch-detect');

  const btnStart = document.createElement("button");
  btnStart.innerText = "Start";
  root.append(btnStart);

  const btnStop = document.createElement("button");
  btnStop.innerText = "Stop";
  root.append(btnStop);

  const btnClear = document.createElement("button");
  btnClear.innerText = "Clear";
  root.append(btnClear);

  const txtFreq = document.createElement("div");
  root.append(txtFreq);

  const table = document.createElement("table");
  root.append(table);

  let listening = false;

  btnStart.addEventListener("click", () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      alert("getUserMedia doesn't exist");
    } else {
      audioContext = new AudioContext();

      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(function (stream) {
          const source = audioContext.createMediaStreamSource(stream);

          analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;

          source.connect(analyser);

          startTime = new Date().getTime();
          listening = true;

          updatePitch();
        })
        .catch(function (err) {
          console.error(err);
          alert(err.message);
        });
    }
  });

  btnStop.addEventListener("click", () => {
    listening = false;
  });

  btnClear.addEventListener("click", () => {
    pitches = [];
    table.innerHTML = "";
  });

  let pitches = [];

  function updatePitch() {
    if (!listening) {
      return;
    }

    const buflen = 2048;
    let buf = new Float32Array(buflen);
    analyser.getFloatTimeDomainData(buf);

    const pitch = autoCorrelate(buf, audioContext.sampleRate);
    pitches.push(pitch);

    if (pitch !== -1) {
      const pitchString = pitch.toFixed(2);
      txtFreq.innerText = pitchString;

      const tr = document.createElement("tr");

      const tdTime = document.createElement("td");
      const timeElapsed = new Date().getTime() - startTime;
      tdTime.innerText = timeElapsed;

      const tdPitch = document.createElement("td");
      tdPitch.innerText = pitchString;

      tr.append(tdTime);
      tr.append(tdPitch);

      table.append(tr);
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }

    window.requestAnimationFrame(updatePitch);
  }

  function autoCorrelate(buf, sampleRate) {
    // Implements the ACF2+ algorithm
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01)
      // not enough signal
      return -1;

    let r1 = 0,
      r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    for (let i = 1; i < SIZE / 2; i++)
      if (Math.abs(buf[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
      maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    const x1 = c[T0 - 1],
      x2 = c[T0],
      x3 = c[T0 + 1];

    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }

</script>