---
layout: post
title:  "How to Set Up Server Side Rendering (SSR) With React"
permalink: /how-to-set-up-server-side-rendering-ssr-with-react
ext_image: https://cdn-images-1.medium.com/max/2000/0*OZr9Fph56IeYS2On.png
description: Tutorial for setting up SSR for a React app
tag: dev
---

## What is Server Side Rendering?

Client side web applications are all the rage of Web 2.0. They've helped make web applications more interactive by putting the user's browser in control of what information is shown on the page.

Unfortunately, this comes with some cons. A web page now needs to fetch an `index.html` file, parse the html file, then fetch one JavaScript file (often more than one), then parse the JavaScript, execute the JavaScript to figure out what to render on the page, and usually send several more requests to fetch the actual information required for the current page.

In this post I will use the 

Code for this tutorial can be found on [GitHub](https://github.com/adamjberg/react-ssr)

