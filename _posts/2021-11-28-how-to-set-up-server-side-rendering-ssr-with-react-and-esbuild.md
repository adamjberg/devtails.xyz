---
layout: post
title:  "How to Set Up Server Side Rendering (SSR) With React"
permalink: /how-to-set-up-server-side-rendering-ssr-with-react-and-esbuild
description: Tutorial for setting up SSR for a React app with esbuild
tag: dev react esbuild
---

## Table of Contents

[What is Server Side Rendering?](#what-is-server-side-rendering)

[Why use Server Side Rendering?](#why-use-server-side-rendering)

[How to Implement Server Side Rendering with React](#how-to-implement-server-side-rendering-with-react)

## What is Server Side Rendering?

Server side rendering is the ability for the server to immediately return a fully rendered HTML page for the client. A simple static file server might return the exact contents of an `index.html` file on the server. 

A common practice is to have some kind of template language/engine (e.g. [Markdown](https://daringfireball.net/projects/markdown/), [pug](https://pugjs.org/api/getting-started.html), or [jinja](https://jinja.palletsprojects.com/en/3.0.x/)) that allows for more advanced control over the html text that is output.

With client side libraries like React, generally a simple `index.html` file is returned regardless of what URL is accessed.

```
<!-- index.html -->

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Side Rendering With React</title>
    <script src="app.js" async defer></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

Once the `app.js` script above gets loaded, it immediately fires up the React library which in turn bootstraps itself using the `#root` element.

```
// index.tsx

import ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

The above code tells React to render the `App` component beneath the `#root` div.  You will also likely use [`react-router`](https://reactrouter.com/) to handle navigating to different URLs. With this method, react-router prevents the browser from fetching a new page from the server whenever a link is clicked on the page.

In the context of React, server side rendering means that when accessing a specific URL the html that is returned is already populated with what the page should display.

Take a very simple React application:

```
// App.ts
import React from "react";

export const App: React.FC = () => {
    return <h1>Hello from the server!</h1>
}
```

When server side rendering is properly implemented, instead of the `index.html` we saw above, the server would instead return:

```
<!-- index.html -->

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Side Rendering With React</title>
    <script src="app.js" async defer></script>
</head>
<body>
    <div id="root">
        <h1 data-reactroot="">Hello from the server!</h1>
    </div>
</body>
</html>
```

Now that I've explained what server side rendering is let's go over why and when you should use it and finally how to actually implement.

## Why use Server Side Rendering?

Client side web applications are all the rage of Web 2.0. They've helped make web applications more interactive by putting the user's browser in control of what information is shown on the page.

Unfortunately, this comes with some cons. A web page now needs to fetch an `index.html` file, parse the html file, then fetch one JavaScript file (often more than one), then parse the JavaScript, execute the JavaScript to figure out what to render on the page, and usually send several more requests to fetch the actual information required for the current page.

In this post, I will use a simple blog website as an example. When using a client side library like React for building a blog, there are a few implications regarding site performance and search engine optimization that can be improved with server side rendering.

### Page Performance

This is one of the top reasons to implement SSR. With SSR the very first request a browser makes returns the exact html that should be displayed. This saves potentially mutliple round trips of fetching other resources and further speeds things up because your bundled JavaScript code does not need to parse and execute in order to determine what to show on the page.  

For pages with dynamic content based on individual users, adding server side rendering potentially puts quite a bit of strain on your server(s) as every request requires the server to generate a unique response.  The bigger gains come from instances where the rendered html will be the same for multiple clients. In our blog example, this is exactly the case.  A single post is the same for everyone that goes to view it. We won't cover this in this post, but it would then be possible to cache the rendered html so that it doesn't need to be re-rendered on every request.

### Support Browsers With JavaScript Disabled

There is a small group of Internet users that either disables JavaScript or accesses the Internet with a device that has limited computing capabilities. Pre-rendering content with server side rendering makes it possible for these users to still access the content of you application in some cases (albeit without some of the interactive bits).

### Search Engine Optimization (SEO)

Web Crawlers also fall in this category as they generally do not run client side javascript when crawling a web page. If your page requires JavaScript to view the content these crawlers will be unable to index you web page. This can negatively impact your Search Engine Optimization, causing your website to not show up in search results.

### Link Previews on Social Media

Most social media websites use the [Open Graph protocol](https://ogp.me/) to determine how to show those fancy preview images whenever you share a link on social media. Without server side rendering, it's not possible to have this information populate dynamically. For our blog example, this means that the link preview for a specific post will return the same meta information as the home page. So instead of a nice preview showcasing the specific post we are linking to, it instead displays generic information about the website.  In a future post, I will go into more details about how to add these link previews on top of the server side rendering we're implementing here.

## How to Implement Server Side Rendering with React

### Initialize Project

Create a new folder to house this project:

`mkdir react-ssr`

Change directory

`cd react-ssr`

Initialize an npm package

`npm init`

### Create Simple React Application

Install react and react-dom

`npm i react react-dom`

Create a folder to house the React client code

`mkdir -p client/src`

Create a file called `index.tsx` in `client/src`

```
// index.tsx
import ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

Create App Component `App.tsx` in `client/src`

```
import React from "react";

export const App: React.FC = () => {
    return <h1>Hello from the server!</h1>
}
```

### Bundle the React App with esbuild

Install esbuild

`npm i --dev esbuild`

Add build script to `package.json`

```
{
  "name": "react-ssr",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "client:build": "esbuild client/src/index.tsx --bundle --outfile=built/app.js",
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "esbuild": "^0.14.0",
  }
}
```

### Create Starter Express.js Application

Create a folder to house the express.js application

`mkdir -p server/src`

Create a file called `server.tsx` in `server/src`

```
import express from "express";

const app = express();

app.use(express.static("./built"));

app.listen(4242);
```

Code for this tutorial can be found on [GitHub](https://github.com/adamjberg/react-ssr)

