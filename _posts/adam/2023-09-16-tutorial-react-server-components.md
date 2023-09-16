---
layout: post
title:  "Tutorial: How to Use React Server Components (RSC) Without a Framework"
permalink: /@adam/tutorial-react-server-components
image: assets/img/rsc-thumbnail.jpeg
author: adam
description: I've attempted to reduce this all down to the simplest implementation possible to help understand how RSCs work
tags: dev js react
---

<iframe width="100%" height="400" src="https://www.youtube.com/embed/jLw40s2cgfo?si=K7An8DcVbI6YKkXF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

In this post, we’re going to take a look at creating a React app from scratch that uses React Server Components.  This follows an [example from the react team](https://github.com/reactjs/server-components-demo), but I have stripped out as much as possible and will walk through actually writing the code to show how this all comes together.  By the end of the we will be able to create asynchronous server components and use the `use client` syntax to specify that a component is a client component.

## Create index.html

This will be the main shell that loads our React application.

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="description" content="React with Server Components">
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>React Server Components</title>
  <script defer src="main.js"></script>
</head>

<body>
  <div id="root"></div>
</body>

</html>
```

## Create React Shell

For now this is mostly just to allow us to confirm everything is set up correctly.

```jsx
// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<Root />);

function Root() {
  return <h1>Hello World</h1>
}
```

## Add Build Script

For now this is just enough to bundle our basic React shell.  We will add a little more later in order to support the server components.

```js
// server/server.js
const path = require("path");

const webpack = require("webpack");

webpack(
  {
    entry: [path.resolve(__dirname, "../src/index.js")],
    output: {
      path: path.resolve(__dirname, "../public"),
      filename: "main.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
      ],
    },
  },
);
```

## Create Basic Express Server

This simply serves the index.html file and all other static files.

```js
// server/server.js
const path = require("path");
const { readFileSync } = require("fs");

const express = require("express");

const app = express();

app.get("/", (req, res) => {
  const html = readFileSync(
    path.resolve(__dirname, "../public/index.html"),
    "utf8"
  );
  res.send(html);
});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
```

## Create a Server Component

This component primarily demonstrates the ability to use async/await inside a React component.  Once everything has been pulled together, you will see that this component is rendered on the server and not sent to the frontend until the 1 second timeout resolves.

```js
// src/ServerComponent.js
export async function ServerComponent() {

  const beforeTime = new Date();

  await new Promise((res) => {
    setTimeout(res, 1000);
  });

  const afterTime = new Date();
  return (
    <>
      <div>Before: {beforeTime.toUTCString()}</div>
      <div>After: {afterTime.toUTCString()}</div>
    </>
  );
}
```

## Create a Client Component

Note the [use client](https://react.dev/reference/react/use-client) at the top of this file.  This indicates that this component executes on the client.  It's a bit of an oversimplification, but one of the key things this enables is the ability to maintain state inside this kind of component. You cannot use `useState` inside a server component.  As an exercise, try adding to the server component above and see what happens.

```js
// src/Counter.js
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return <button onClick={increment}>{count}</button>;
}
```

## Create React Entrypoint for React Server Components

We now bring our client and server components together in a top level component that the server will render.  The [Suspense](https://react.dev/reference/react/Suspense) will render the `fallback` component until the ServerComponent has completed rendering.

```js
// src/App.js
import { Suspense } from "react";
import { Counter } from "./Counter";
import { ServerComponent } from "./ServerComponent";

export default async function App() {
  return <div className="main">
    <Suspense fallback={<div>loading...</div>}>
      <ServerComponent />
    </Suspense>
    <Counter />
  </div>;
}
```

## Add React Server Component Support to Server

The `register()` and `babelRegister` calls globally modify what happens when our `App.js` is imported.  I won't dive into what `react-server-dom-webpack/node-register` is doing in this post (because I don't really know yet), but may follow up on this.

The `/react` route uses the `renderToPipeableStream` function to start building the component chain starting with the component we pass it.  The neat thing is that it will render the tree of components and then immediately pipe the rendered components to the frontend.  What this means is that if you have an asynchronous server component, any components that aren't waiting on some async operation can be sent back to the frontend immediately and displayed to the user.

I'm not sure why the code below breaks syntax highlighting...but that's a problem for another day.

```diff
+ const register = require("react-server-dom-webpack/node-register");
+ register();

const path = require("path");
const { readFileSync } = require("fs");

+ const babelRegister = require("@babel/register");

+ babelRegister({
+   ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
+   presets: [["@babel/preset-react", { runtime: "automatic" }]],
+   plugins: ["@babel/transform-modules-commonjs"],
+ });

+ const { renderToPipeableStream } = require("react-server-dom-webpack/server");
const express = require("express");

+ const React = require("react");
+ const ReactApp = require("../src/App").default;

const app = express();

app.get("/", (req, res) => {
  const html = readFileSync(
    path.resolve(__dirname, "../public/index.html"),
    "utf8"
  );
  res.send(html);
});

+ app.get("/react", (req, res) => {
+  const manifest = readFileSync(
+    path.resolve(__dirname, "../public/react-client-manifest.json"),
+    "utf8"
+  );
+  const moduleMap = JSON.parse(manifest);
+  const { pipe } = renderToPipeableStream(
+    React.createElement(ReactApp),
+    moduleMap
+  );
+  pipe(res);
+});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
```

## Update index.js to Stream Server Components

Here the `createFromFetch` does most of the heavy lifting.  Have a look at the response from the `/react` request to get a better sense of what this is doing.  I don't have an exact idea of what it's doing, but loosely seems to be pulling together the streamed React components and making sure they are rendered as they come in.

```js
// src/index.js
import { use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<Root />);

const cache = new Map();

function Root() {
  let content = cache.get("home");
  if (!content) {
    content = createFromFetch(fetch("/react"));
    cache.set("home", content);
  }

  return (
    <>
      {use(content)}
    </>
  );
}
```

## Add react-server-dom-webpack Plugin to the Build Script

This will create the `react-client-manifest.json` file that our server uses in the `/react` route along with some other files it likely uses as well.

```diff
// scripts/build,js
const path = require("path");

const webpack = require("webpack");
+ const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");

webpack(
  {
    entry: [path.resolve(__dirname, "../src/index.js")],
    output: {
      path: path.resolve(__dirname, "../public"),
      filename: "main.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
      ],
    },
+    plugins: [new ReactServerWebpackPlugin({ isServer: false })],
  }
);
```

## Update package.json

This contains all the dependencies from everything we have used so far as well as configures babel to use `@babel/preset-react`.

```json
{
  "name": "react-server-components",
  "babel": {
    "presets": [
      [
        "@babel/preset-react",
        {
          "runtime": "automatic"
        }
      ]
    ]
  },
  "dependencies": {
    "@babel/plugin-transform-modules-commonjs": "^7.22.15",
    "@babel/preset-react": "^7.22.15",
    "@babel/register": "^7.22.15",
    "babel-loader": "^9.1.3",
    "express": "^4.18.2",
    "react-server-dom-webpack": "18.3.0-next-1308e49a6-20230330",
    "webpack": "^5.88.2"
  }
}
```

## Run npm install

```bash
npm install
```

## Run Build Script

```bash
node scripts/build.js
```

## Run Server

```bash
node server/server.js
```

## Try Out Your Changes

You should now have working React Server Components running at [http://localhost:3000](http://localhost:3000)