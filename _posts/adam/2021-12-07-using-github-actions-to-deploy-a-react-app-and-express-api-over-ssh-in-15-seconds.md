---
layout: post
title:  "Using Github Actions to Deploy a React App and Express API Over SSH in 15 seconds"
author: adam
permalink: /using-github-actions-to-deploy-a-react-app-and-express-api-over-ssh-in-15-seconds
tags: react devops
---

**The following post was created as part of the Github Actions Hackathon 2021 on [dev.to](https://dev.to/t/actionshackathon21).**

## Motivation

I've been looking to revamp the deployment process for several projects that I'm working on and start building towards my preferred method of deployment.

My biggest requirements are **simplicity** and **speed**.  I have used [Docker](https://www.docker.com/), [Kubernetes](https://kubernetes.io/), [Docker Swarm](https://docs.docker.com/engine/swarm/), and various other methods of deployment in the past. I recognize these tools have their advantages, but have found that for small to medium sized projects they are more effort than they are worth to maintain.

At the end of the day, all I need to do is build the code and copy the built files to the server. Before starting the project I told myself to get it under a minute, but I'm happy to report that Github Actions starts up much faster than Travis CI and brought this down to **15 seconds to deploy a React frontend and express.js backend**.

I've provided full instructions for how to recreate this entire project, but if you're just interested in the workflow part skip ahead to the [My Workflow](#my-workflow) section.

## Creating a Simple App to Demonstrate

![Simple App Screenshot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a7u0nszax2ql45ce1lfl.png)
 

Before I can demonstrate the workflow, we need to have something to deploy. Below are instructions for how the simple app is structured. Most of you are probably used to the templates provided by [Create React App](https://reactjs.org/docs/create-a-new-react-app.html), but here I provide some opinionated alternatives for how to structure the app. The same principles should be possible to transfer over to any existing setup.

### Creating a Basic React App

```
mkdir github-actions-tutorial
cd github-actions-tutorial
yarn init
yarn add react react-dom
yarn add --dev @types/react @types/react-dom
mkdir -p client/src
```

#### Create index.tsx

```
// client/src/index.tsx
import React from "react";
import ReactDom from "react-dom";
import { App } from "./App";

ReactDom.render(<App />, document.getElementById("root"));
```

#### Create App.tsx

```
// client/src/App.tsx
import React, { useEffect, useState } from "react";

export const App: React.FC = () => {
  return (
    <>
      <div>Hello Github Actions!</div>
    </>
  );
};
```

### Building React App with esbuild

Now that we have a simple React app we are going to output a minified production build using [esbuild](https://esbuild.github.io/).

#### Install esbuild

```
yarn add --dev esbuild
```

#### Add client:build script to package.json

```
// package.json
{
  "name": "github-actions-tutorial",
  "version": "1.0.0",
  "main": "index.js",
  "repository": "git@github.com:adamjberg/github-actions-tutorial.git",
  "author": "Adam Berg <adam@xyzdigital.com>",
  "license": "MIT",
  "scripts": {
    "client:build": "esbuild client/src/index.tsx --bundle --minify --outfile=built/app.js",
  },
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "@types/react": "^17.0.37",
    "@types/react-dom": "^17.0.11",
    "esbuild": "^0.14.1"
  }
}
```

You can test this is working correctly by running `yarn client:build` and you should see a `built/app.js` file in the folder tree with the minified output.

You are probably used to have a `yarn start` script as well, but for the purposes of this tutorial we're going to skip it and test this all out directly in "production".

#### Create `public/index.html`

```
<html>

<head>
  <script src="/js/app.js" defer async></script>
</head>

<body>
  <div id="root"></div>
</body>

</html>
```

This will be the file that is served by our nginx static file server when clients hit the `http://github-actions-tutorial.devtails.xyz` URL.

### Prepping a Server

I'm going to assume the reader has some knowledge about how to register a domain and create a server on some hosting platform. I already have a domain `devtails.xyz` with [Namecheap](https://namecheap.pxf.io/GjgG5V) and I have created a droplet with [Digital Ocean](https://m.do.co/c/4d01489e4069).

In the example below, I have mapped `github-actions-tutorial.devtails.xyz` to my Digital Ocean IP: `143.198.32.125`

As long as you have the ability to ssh into your server, the following instructions should suffice regardless of your hosting platform.

#### SSH into server

```
ssh root@143.198.32.125
```

#### Create github-actions-tutorial User

To prevent our Github Action from getting root access to our server, we will create a sub-user called `github-actions-tutorial`

```
useradd -s /bin/bash -d /home/github-actions-tutorial -m github-actions-tutorial
```

#### Install nginx

```
apt-get install nginx
```

#### Create Virtual Host File

```
# /etc/nginx/sites-available
server {
  listen 80;
  server_name github-actions-tutorial.devtails.xyz;

  location / {
    root /home/github-actions-tutorial/static;
  }
}
```

This tells nginx to route requests to the `github-actions-tutorial.devtails.xyz` subdomain to the `static` folder under our `github-actions-tutorial` user.

#### Create `static` folder on `github-actions-tutorial` user

```
su github-actions-tutorial
mkdir static
```

This allows us to avoid having our Github Action ssh into the server just to create this folder. This folder will house the `js/app.js` and `index.html`. The virtual host file set up previously tells nginx to serve files from the `static` folder.

### Creating a Basic Express REST API

#### Install express

```
yarn add express
yarn add @types/express
```

#### Create `server/src/server.tsx`

```
// server/src/server.tsx
import express from "express";

const app = express();

app.get("/api/message", (_, res) => {
  return res.json({
    data: "Hello from the server!",
  });
});

app.listen(8080);
```

This creates a basic REST API with a single `/api/message` route that we will use to demonstrate that it is running correctly.

#### Add server:build script to package.json

We will re-use the esbuild package to build a bundle for our server code as well. For more details on this approach please see [this post](https://devtails.xyz/bundling-your-node-js-express-app-with-esbuild).

```
"server:build": "esbuild server/src/server.ts --bundle --minify --outfile=built/server.js --platform=node"
```

Add this right below the `client:build` script. You can then run it to confirm working as expected with `yarn server:build`.  It should output a bundled file to `built/server.js`.

#### Add build script that runs both client and server builds

```
"build": "yarn client:build && yarn server:build"
```

### Prepare the Server to Run the API

There are a few one time configurations that need to be applied in order to prepare our server for deployment.

#### Switch to github-actions-tutorial user
```
su github-actions-tutorial
```

#### Install NVM

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Install Node

```
nvm install 16
```

#### Install [pm2](https://pm2.keymetrics.io/)

```
npm i -g pm2
```

#### Update Virtual Host File to Route to API

Again ssh into the `root` user and update `/etc/nginx/sites-available/github-actions-tutorial.devtails.xyz` file

```
# /etc/nginx/sites-available/github-actions-tutorial.devtails.xyz
upstream github-actions-tutorial-api {
  server localhost:8080;
}

server {
  listen 80;
  server_name github-actions-tutorial.devtails.xyz;

  location /api {
    proxy_pass http://localhost:8080;
  }

  location / {
    root /home/github-actions-tutorial/static;
  }
}
```

This tells nginx to route any URLs that start with `/api` to the express app that we added.

#### Bootstrapping the pm2 process

Before the final step `- run: ssh github-actions-tutorial "pm2 reload all"` can run, you must first manually start your server with pm2. 

After running the Github Action for the first time, it should have copied the built `server.js` file to `~/api/server.js`.  You can then start this process with `pm2 start api/server.js`.

Now that it is running, the `pm2 reload all` command will reload this server process so it can pick up the changes in your server code.

## My Workflow

Phew, with all that set up out of the way, we can now look at what our `Deploy` workflow does.

Below I'll break it down section by section

### Define workflow name and triggers

```
name: Deploy

on:
  push:
    branches: [ main ]
```

This creates a workflow called "Deploy" that will be run whenever a push is made to the `main` branch.

### Define build-and-deploy job

```
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
```

This creates a job called `build-and-deploy` that will run the latest ubuntu distribution.

```
env:
  SSH_KEY: ${{secrets.SSH_KEY}}
```

This adds a [Github Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to the environment. We will use this in a later step to allow us to rsync to our specified server.

```
steps:
  - uses: actions/checkout@v2
```

This checks out the code for the current commit.

```
- name: Use Node.js 16
  uses: actions/setup-node@v2
  with:
    node-version: 16
    cache: 'yarn'
```

This installs node 16 and specifies that the Workflow should cache files for yarn.  This cache ensures that if no packages are added or removed, `yarn install` won't have to do anything. This saves a significant amount of time.

```
- run: yarn install
- run: yarn build
```

These lines run the install and build which ultimately outputs all the files that we would like to deploy.

```
- run: mkdir ~/.ssh
- run: 'echo "$SSH_KEY" >> ~/.ssh/github-action'
- run: chmod 400 ~/.ssh/github-action
- run: echo -e "Host static\n\tUser github-actions-tutorial\n\tHostname 143.198.32.125\n\tIdentityFile ~/.ssh/github-action\n\tStrictHostKeyChecking No" >> ~/.ssh/config
```

This is the most complicated section.  What's happening here is that we are adding the `SSH_KEY` secret to the `~/.ssh/github-action` file.  The final line creates a `~/.ssh/config` file that looks like the following:

```
Host static
  User github-actions-tutorial
  IdentityFile ~/.ssh/github-action
  StrictHostKeyChecking No
```

With that set up, the rsync commands look quite simple:

```
- run: rsync -e ssh public static:~/static
- run: rsync -e ssh built/app.js static:~/static/js/app.js
- run: rsync -e ssh built/server.js static:~/api/server.js
```

The `-e ssh` specifies to use rsync over ssh. We copy over all files from the `public` folder. Then we copy over the `built/app.js` to `~/static/js/app.js`. Finally we copy `built/server.js` to `~/api/server.js`.

```
- run: ssh github-actions-tutorial "pm2 reload all"
```

This final line uses pm2 (which we installed earlier) to reload the server process.

## Conclusion

While I could get an even faster deployment just by running this on my local machine, having this run as a Github Action provides a big benefit for my open source projects.  In order to deploy a contributor's changes, I can simply merge their pull request in to the main branch without having to give direct server access to anyone else.

There's plenty more that could be tidied up or improved, but in the spirit of a hackathon, I'm calling this "done" for now.  I now have a baseline of how long I should expect an app to be built and deployed using Github Actions.


## Yaml File or Link to Code

```
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:

    runs-on: ubuntu-latest

    env:
      SSH_KEY: ${{secrets.SSH_KEY}}

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js 16
      uses: actions/setup-node@v2
      with:
        node-version: 16
        cache: 'yarn'
    - run: yarn install
    - run: yarn build
    - run: mkdir ~/.ssh
    - run: 'echo "$SSH_KEY" >> ~/.ssh/github-action'
    - run: chmod 400 ~/.ssh/github-action
    - run: echo -e "Host github-actions-tutorial\n\tUser github-actions-tutorial\n\tHostname 143.198.32.125\n\tIdentityFile ~/.ssh/github-action\n\tStrictHostKeyChecking No" >> ~/.ssh/config
    - run: rsync -e ssh public github-actions-tutorial:~/static
    - run: rsync -e ssh built/app.js github-actions-tutorial:~/static/js/app.js
    - run: rsync -e ssh built/server.js github-actions-tutorial:~/api/server.js
    - run: ssh github-actions-tutorial "pm2 reload all"
```

## Additional Resources / Info

The full code for this tutorial can be found on [Github](https://github.com/adamjberg/github-actions-tutorial)

[engram](https://github.com/adamjberg/engram) is an Open Source project where I first prototyped this style of deploy.  It currently takes 3-4 minutes to deploy, which is why I'll be switching over to a workflow closer to the one provided here. 