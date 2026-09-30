---
layout: post
title: Getting Started With PineTime Watch
author: adam
permalink: /adam/2023-pinetime-getting-started
description: 
image: 
tags: dev c++
---

When I first got this watch I was excited, but was immediately overwhelmed by the documentation to the point that I thought I wouldn't actually be able to reprogram it.  After pushing through I eventually narrowed down the information into what worked for me.  This post will go over how to build and install your own custom version of [InfiniTime](https://github.com/InfiniTimeOrg/InfiniTime.git) onto your PineTime watch.

## Clone InfiniTime Repo

```bash
git clone https://github.com/InfiniTimeOrg/InfiniTime.git
cd InfiniTime
git submodule update --init
```

## Build Project With Docker

This uses their image from Docker Hub that has all the dependencies you need to compile the source. See further explanation [here](https://github.com/InfiniTimeOrg/InfiniTime/blob/main/doc/buildWithDocker.md)

```bash
docker run --rm -it -v ${PWD}:/sources --user $(id -u):$(id -g) infinitime/infinitime-build
```

## Flash Using OpenOCD and STLink

Official docs [here](https://github.com/InfiniTimeOrg/InfiniTime/blob/main/doc/openOCD.md)

### Install openocd

```bash
brew install openocd
```

### Create File openocd-stlink.ocd

```
source [find interface/stlink.cfg]

gdb_flash_program enable
gdb_breakpoint_override hard

source [find target/nrf52.cfg]
```

### Create File flash_bootloader_app.ocd

```
init

program ./build/output/pinetime-mcuboot-app-image-1.13.0.bin verify 0x00008000

reset
```

### Connect STLinkV2

See screenshots [here](https://github.com/InfiniTimeOrg/InfiniTime/blob/main/doc/openOCD.md#connect-the-stlinkv2-to-the-pinetime) for correct orientation.  Pins should be connected to SWCLK, SWDIO, GND, and 3.3V on the ST-Link V2 side of things.  The wire coloring seems to be standard, so you should have:

Brown - SWCLK
Red - SWDIO
White - GND
Black - 3.3V

When plugging pins into PineTime, orient the programmable pins so they are on the far side from you and then the red pin should go in the left most pin.  

I tend to plug pins into the PineTime first before plugging in the USB portion.  If you flip the watch face over and rest it on the pins it seems to hold itself up while applying pressure on the pins so you can actually see what's happening without 

### Flash Using OpenOCD

```
openocd -f ./openocd-stlink.ocd -f ./flash_bootloader_app.ocd
```

## Flashing PineTime Over-The-Air (OTA)

This appears to be mostly smartphone driven, which is a bit confusing to imagine what kind of workflow one would use with that.  I managed to install [nRF Connect Mobile](https://apps.a pple.com/ca/app/nrf-connect-for-mobile/id1054362403) on my M1 Mac and started an OTA update.  It took a very look time and then at 99% said there was an errror.  The STLink method is so much faster and reliable that I probably won't explore this any further.

## Infinitime Simulator

[InfiniSim](https://github.com/InfiniTimeOrg/InfiniSim) seems to expect that you will be running on Linux.  I imagine it should be possible to get working on Mac, but the number of hours I have fought SDL2 and CMake to work correctly, I decided to just try it on Ubuntu.  Following their listed instructions on Ubuntu I was mostly able to get things going.  `lv_img_conv.py` gave a "SyntaxError: invalid syntax" at line 163 `match args.color_format:`.  I ended up just modifying the file to remove the match statement altogether and forcing one of the conditions.  I assume it's a python version issue, but didn't have the energy to figure out what the problem was.  Never ceases to amaze me how difficult reproducible builds are...

```bash
git clone --recursive https://github.com/InfiniTimeOrg/InfiniSim.git
cd InfiniSim
git submodule update --init --recursive

sudo apt install -y cmake libsdl2-dev g++ npm libpng-dev
npm install lv_font_conv@1.5.2

cmake -S . -B build
cmake --build build -j4
```