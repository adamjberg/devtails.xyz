---
layout: post
title:  "Tutorial: Deploy a React Server Side Rendered Application Using Bun on Engram"
permalink: /@adam/deploy-react-ssr-bun-engram
image: assets/img/bun-engram.png
author: adam
description: 
tags: dev javascript
---

![](/assets/img/bun-engram.png)

[Bun 1.0 is hot off the press](https://bun.sh/blog/bun-v1.0) and Tech Twitter can't stop talking about it.

For the last year or so, I have been building [engram.sh](https://engram.sh) on a quest to make preview environments that can be built and spun up in less than a second.  I have managed this with simpler applications, but as the number of dependencies grows, so do install and build times.  I'm hopeful that Bun can bring me closer to this goal for production sized applications.

In this post, we will create a server side rendered (SSR) React application that is run with the bun runtime (buntime) and finally deploy to Engram to see how close to achieving this sub-second deployment goal we are at.

## Install [Bun](https://bun.sh/)

```bash
curl -fsSL https://bun.sh/install | bash
```

## Initialize Bun Project

```bash
mkdir bun-react-ssr
cd bun-react-ssr
bun init
```

You can leave everything in the init wizard as the default.

## Add Start Script to package.json

```diff
{
  "name": "bun-react-ssr",
  "module": "index.ts",
  "type": "module",
+ "scripts": {
+   "start": "bun run index.ts"
+ },
  "devDependencies": {
    "bun-types": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## Install Dependencies

```bash
bun install react react-dom @types/react @types/react-dom
```

## Create React Component

```tsx
// MyComponent.tsx
export const MyComponent = () => {
  return (
    <div>
      <h1>Hello from Server-Side Rendered React Component!</h1>
    </div>
  );
};
```

## Create HTTP Server Using Bun

The code below uses the super fast [HTTP server from Bun](https://bun.sh/docs/api/http).

```ts
// index.ts
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MyComponent } from "./MyComponent";

Bun.serve({
  fetch(req) {
    const jsx = React.createElement(MyComponent);
    const html = ReactDOMServer.renderToString(jsx);

    return new Response(
      `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server-Side Rendering with React + Bun</title>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
  `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  },
  port: process.env.PORT || 3000,
});
```

## Start the Server

```bash
bun start
```

Visiting [http://localhost:3000](http://localhost:3000) should allow you to see your Bun powered React application.

## Init Git and Commit Changes

```bash
git init
git add .
git commit -m "Bun React SSR"
```

## Create Repository

You can do this from the [github.com](https://github.com) as well, but I have found the [Github CLI](https://cli.github.com/) a more enjoyable option lately.

```bash
gh repo create bun-react-ssr --public --source .
git push --set-upstream origin main
```

## Connect Repository to Engram

Engram supports autodetects and supports Bun out of the box.  All you need to do is [connect this repository to engram](https://engram.sh/api/docs/Getting%20Started/connect-existing-repository) and Engram will build and deploy the application.

## Deploy!

You can find this sample application deployed at [bun-react-ssr-main.engram.sh](https://bun-react-ssr-main.engram.sh).

![](/assets/img/engram-bun-deployed.png)

## Conclusion

As you can see, we're not quite at under a second.  Docker slows things down quite a bit, but a 3 second deploy isn't too bad.  Especially considering this should scale quite well as the application grows in size.  

Engram is currently in beta, if you are interested in seeing how Engram and Bun can supercharge your iteration times and collaboration please [join our waitlist](https://engram.sh) or shoot me an email.