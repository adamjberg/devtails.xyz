---
layout: post
title:  "How to Replace Webpack in Create React App"
permalink: /how-to-replace-webpack-in-create-react-app
image: assets/img/0-cra.png
description: 
tags: dev
---

The year is 2022 and all your web development friends tell you to learn React.  To make things simple, they tell you about this thing called [Create React App](https://github.com/facebook/create-react-app).  You see that in three commands you can have a fully configured React app running and rejoice.

```
npx create-react-app my-app
cd my-app
npm start
```

After about a minute of installing packages and a few seconds for `npm start` to start up, you're ready to go.

![Starter CRA Project](assets/img/0-cra.png)

Now that you have a base React app, you add several additional components and pages to build your dream React app.  Everything has gone smoothly so far and changes you make seem to magically appear on localhost.  

Finally it comes time to deploy this app to the world and share your creation.  You keep things simple by just running a `npm run build` and adding a command to `scp` the files to your server.  

This is the first time you've run `npm run build` and you find that it takes 20 seconds.  "This is the only time I'm going to be deploying", you tell yourself, and shrug off how long the build takes.

You load up your cool new website and realize that you have a typo.  You make a quick change and then re-deploy.  Another 20 seconds crawls by before your changes go live.

"Hm, maybe I should update the padding here."  "What if this was a different color?"  "I should add Google Analytics." All kinds of new ideas swarm your mind.  Each of them only take a single line of code to update.  Yet to get that code deployed it's going to take 20-30 seconds.

The problem worsens when you realize there's a critical bug that just got deployed and needs to be fixed.  The fix is simple, but we're again left with half a minute before a fix can go live.  

This isn't a made up story. This is my current situation with [Kaizen](https://kaizen.place), a music app I'm currently working on. 

On other projects, I've seen production build times balloon to over a minute. Sometimes taking twice as long when run on a slower build machine.

In the past, I've written about the importance of quick iteration times in [3 lines of code shouldn't take all day](https://devtails.xyz/3-lines-of-code-shouldnt-take-all-day).  This same principle carries over to deploying code.  Something cannot be claimed to be done until it has been fully verified in a production environment.  The slower this process is, the longer a person must wait to see if their code is working as expected.

This post demonstrates how to replace the webpack bundler installed by create-react-app with the much faster esbuild bundler.

I've previously written about [bundling your express app using esbuild](https://devtails.xyz/bundling-your-node-js-express-app-with-esbuild), which captures some of the benefits of esbuild.  

## Install esbuild

`npm i -D esbuild`

## Update Build Script in package.json

```
// package.json
"scripts": {
    "start": "react-scripts start",
    "build": "esbuild src/index.js --bundle --outfile=public/js/app.js --loader:.js=jsx",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
},
```

## Re-run Build

`npm run build`

With the default create-react-app application, you should see the following errors:

![esbuild errors](/assets/img/esbuild-errors.png)

## Enable JSX Syntax for js files

The first two errors suggest adding `--loader:.js=jsx` to the build command.  Esbuild does this by default for files with the `jsx` extension, but this is required to handle files with just the `.js` extension.

```
// package.json
"build": "esbuild src/index.js --bundle --outfile=build/js/app.js --loader:.js=jsx"
```

## Add Loader for SVG

The default app uses the import syntax to include an svg image.  esbuild does not handle this type of file by default.  In order to support these kinds of things esbuild comes with plugin support.  You can find a list of [community esbuild plugins here](https://github.com/esbuild/community-plugins).  In this case, we'll use [esbuild-plugin-inline-image](https://github.com/natrim/esbuild-plugin-inline-image) to inline our svg image.  As a bonus, this plugin will also handle future `img` needs.

`npm i -D esbuild-plugin-inline-image`

In order to load the new plugin we need to change our build command to use the esbuild JavaScript API.  

```
// build.js
const esbuild = require("esbuild");
const inlineImage = require("esbuild-plugin-inline-image");

esbuild.build({
  entryPoints: ["./src/index.js"],
  outfile: "./public/js/app.js",
  minify: true,
  bundle: true,
  loader: {
    ".js": "jsx",
  },
  plugins: [inlineImage()],
}).catch(() => process.exit(1));
```

```
// package.json
"build": "node build.js"
```

And with those changes, you should see a successful build when running `npm run build`.

![](/assets/img/esbuild-success.png)

On my computer this build command now takes ~60 milliseconds.  **Literally 100 times faster than the 6 second webpack build.**  But we're not done yet, we still need to actually be able to see and run these changes.

## Update index.html in `public` Folder

Create React App creates a `public` folder with several files pre-poulated.  The `index.html` included there is more of a template that then gets processed and output to the `build` folder when `react-scripts build` is run.

With our new esbuild build, there is no need for this file to be a template.  Remove the references to `%PUBLIC_URL%` and add a script tag pointing to our newly built `app.js` and `app.css` bundles.

```
// public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>React App</title>
    <script src="/assets/app.js" async defer></script>
    <link rel="stylesheet" href="/assets/app.css"/>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

You will also likely want to add `public/js` to your `.gitignore` as you likely don't want to be checking in the production build.

## Add serve.js Script to Automatically Rebuild Changes

```
// serve.js
const esbuild = require("esbuild");
const inlineImage = require("esbuild-plugin-inline-image");

esbuild
  .serve(
    {
      servedir: "public",
      port: 8000,
    },
    {
      entryPoints: ["./src/index.js"],
      outfile: "./public/js/app.js",
      bundle: true,
      loader: {
        ".js": "jsx",
      },
      plugins: [inlineImage()],
    }
  )
  .catch(() => process.exit());
```

## Replace npm start with serve.js

```
// package.json
"start": "node serve.js"
```

Running `npm start` will start a local development server on port 8000 so you can access via `http://localhost:8000`.  With this you should see the app working as expected and both the initial build and subsequent builds are lightning fast.

## Conclusion

In just a few steps, we have converted a 6 second build to a 60 millisecond one.  There are several things that could still be tidied up, but ultimately this should leave you with a good start for how to convert your webpack based React build to esbuild.  As mentioned earlier, I will be exploring this conversion further with the frontend code for [Kaizen](https://kaizen.place) and will write about any problems I experience in a larger project.

