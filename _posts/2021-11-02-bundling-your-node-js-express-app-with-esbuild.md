---
layout: post
title:  "Bundling Your Node.js Express App with esbuild"
permalink: /bundling-your-node-js-express-app-with-esbuild
ext_image: https://cdn-images-1.medium.com/max/2000/0*OZr9Fph56IeYS2On.png
description: Tutorial for setting up esbuild to bundle an express.js app
tags: dev esbuild
---

When setting up a backend node project, I have almost always defaulted to setting up a TypeScript to build the app using the outDir property in tsconfig.json.

    // tsconfig.json
    {
      "compilerOptions": {
        ...
        "outDir": "./built",
        ...
      }
    }

This worked well for local development as the node_modules folder sits right there and running the built file is a simple node built/index.js.

This did not work so well when it came time to deploy the backend code to a server. In order to successfully run on the server all of the files in the built folder needed to be synced as well as the entire node_modules folder.

If you’re reading this article you have probably seen the following meme before:

![](https://cdn-images-1.medium.com/max/2000/0*OZr9Fph56IeYS2On.png)

On some of my projects, the node_modules folder tallies up to over 700 MB. Even a fairly basic express app is 155.6 MB. Every deploy now requires uploading almost a full GB of data, for what surely amounts to much less actual code necessary.

## Enter esbuild

[esbuild](https://esbuild.github.io/) is “*An extremely fast JavaScript bundler”.* You’re welcome to figure out how to bundle with webpack, but I have found esbuild to be unreasonably fast relative to webpack and a much simpler setup.

Add esbuild as a devDependency

    yarn add --dev esbuild

Add the following to your package.json

    {
      ...
      "scripts": {
        "start": "node built/index.js",
        "build": "esbuild index.ts --platform=node --bundle --minify --outfile=built/index.js"
      },
      ...
    }

esbuild index.ts - tells the bundler that index.ts is the entry file to start bundling from. With just that, esbuild is able to determine what other files and libraries are imported.

--platform=node - This specifies that you are building for node and not the browser.

--bundle - Specifies that you want to output a single bundle file

--minify - Minifies the output JavaScript code

--outfile=built/index.js - Specifies what file to bundle into

You should now be able to run yarn build and see something like the below

    yarn run v1.22.15
    $ esbuild index.ts --platform=node --bundle --minify --outfile=built/index.js

      built/index.js  8.2mb ⚠️

    Done in 0.21s.

Yes, you’re reading that correctly **0.21 seconds**. From here you can run yarn start and the bundle will get loaded up and executed.

## Deploying Your Bundle

I have now gone from a >150MB collection of thousands of files to a simple single file that needs to be copied over to my server. For most projects, deployment can be as simple as scp built/index.js username@xxx.xxx.xxx.xxx:~/project/built/index.js .

## A Final Note and Benefit

I had been planning out bundling server side code for a while for the above reasons of simplifying the deployment process. I recently dove in to [server side rendering for react](https://reactjs.org/docs/react-dom-server.html) (the React docs tell you next to nothing useful) and found this [article](https://www.digitalocean.com/community/tutorials/react-server-side-rendering) that specifies you essentially need a bundler in order to import your React App component onto your server. This is a topic to be covered in a future post.
