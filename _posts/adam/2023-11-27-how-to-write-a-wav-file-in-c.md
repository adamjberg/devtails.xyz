---
layout: post
title:  "Tutorial: How to Write a Wav File in C"
permalink: /@adam/how-to-write-a-wav-file-in-c
image: assets/img/how-to-write-a-wav-file-in-c.png
author: adam
description: 
tags: dev music
---

TODO: Insert link to Youtube Video

## Wav File Format

Head [here](https://docs.fileformat.com/audio/wav/) for a breakdown of the WAV File Format

## Create Wav Struct

```c
struct wav_header
{
  char riff[4];           /* "RIFF"                                  */
  int32_t flength;        /* file length in bytes                    */
  char wave[4];           /* "WAVE"                                  */
  char fmt[4];            /* "fmt "                                  */
  int32_t chunk_size;     /* size of FMT chunk in bytes (usually 16) */
  int16_t format_tag;     /* 1=PCM, 257=Mu-Law, 258=A-Law, 259=ADPCM */
  int16_t num_chans;      /* 1=mono, 2=stereo                        */
  int32_t srate;          /* Sampling rate in samples per second     */
  int32_t bytes_per_sec;  /* bytes per second = srate*bytes_per_samp */
  int16_t bytes_per_samp; /* 2=16-bit mono, 4=16-bit stereo          */
  int16_t bits_per_samp;  /* Number of bits per sample               */
  char data[4];           /* "data"                                  */
  int32_t dlength;        /* data length in bytes (filelength - 44)  */
};
```

## Populate Wav Struct

```c
// main.c
#include <string.h>

struct wav_header wavh;

const int sample_rate = 8000;
const int duration_seconds = 10;
const int buffer_size = sample_rate * duration_seconds;
short int buffer[buffer_size] = {};

int main(void)
{
  strncpy(wavh.riff, "RIFF", 4);
  strncpy(wavh.wave, "WAVE", 4);
  strncpy(wavh.fmt, "fmt ", 4);
  strncpy(wavh.data, "data", 4);

  wavh.chunk_size = 16;
  wavh.format_tag = 1;
  wavh.num_chans = 1;
  wavh.srate = sample_rate;
  wavh.bits_per_samp = 16;
  wavh.bytes_per_sec = wavh.srate * wavh.bits_per_samp / 8 * wavh.num_chans;
  wavh.bytes_per_samp = wavh.bits_per_samp / 8 * wavh.num_chans;

  wavh.dlength = buffer_size * wavh.bytes_per_samp;
  wavh.flength = wavh.dlength + header_length;
}
```

## Writing Wav File to Disk

```c
#include <stdio.h>

FILE *fp = fopen("test.wav", "w");
fwrite(&wavh, 1, header_length, fp);
fwrite(buffer, 2, buffer_size, fp);
```

## Playing a C Note

```c
#include <math.h>

for (int i = 0; i < buffer_size; i++) {
  buffer[i] = (short int)((cos((2 * M_PI * MIDDLE_C * i) / sample_rate) * 1000));
}
```

## Full Source Code

```c
// main.c
#include <string.h>
#include <stdio.h>
#include <math.h>

struct wav_header
{
  char riff[4];           /* "RIFF"                                  */
  int32_t flength;        /* file length in bytes                    */
  char wave[4];           /* "WAVE"                                  */
  char fmt[4];            /* "fmt "                                  */
  int32_t chunk_size;     /* size of FMT chunk in bytes (usually 16) */
  int16_t format_tag;     /* 1=PCM, 257=Mu-Law, 258=A-Law, 259=ADPCM */
  int16_t num_chans;      /* 1=mono, 2=stereo                        */
  int32_t srate;          /* Sampling rate in samples per second     */
  int32_t bytes_per_sec;  /* bytes per second = srate*bytes_per_samp */
  int16_t bytes_per_samp; /* 2=16-bit mono, 4=16-bit stereo          */
  int16_t bits_per_samp;  /* Number of bits per sample               */
  char data[4];           /* "data"                                  */
  int32_t dlength;        /* data length in bytes (filelength - 44)  */
};

struct wav_header wavh;

const float MIDDLE_C = 256.00;

const int sample_rate = 8000;
const int duration_seconds = 10;
const int buffer_size = sample_rate * duration_seconds;
short int buffer[buffer_size] = {};

const int header_length = sizeof(struct wav_header);

int main(void)
{
  strncpy(wavh.riff, "RIFF", 4);
  strncpy(wavh.wave, "WAVE", 4);
  strncpy(wavh.fmt, "fmt ", 4);
  strncpy(wavh.data, "data", 4);

  wavh.chunk_size = 16;
  wavh.format_tag = 1;
  wavh.num_chans = 1;
  wavh.srate = sample_rate;
  wavh.bits_per_samp = 16;
  wavh.bytes_per_sec = wavh.srate * wavh.bits_per_samp / 8 * wavh.num_chans;
  wavh.bytes_per_samp = wavh.bits_per_samp / 8 * wavh.num_chans;

  for (int i = 0; i < buffer_size; i++) {
    buffer[i] = (short int)((cos((2 * M_PI * MIDDLE_C * i) / sample_rate) * 1000));
  }

  wavh.dlength = buffer_size * wavh.bytes_per_samp;
  wavh.flength = wavh.dlength + header_length;

  FILE *fp = fopen("test.wav", "w");
  fwrite(&wavh, 1, header_length, fp);
  fwrite(buffer, 2, buffer_size, fp);
}
```