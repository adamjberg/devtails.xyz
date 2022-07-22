---
layout: post
title:  "How to Deploy a Simple NodeJS Server to Linux VM"
author: adam
permalink: /how-to-deploy-a-simple-nodejs-server-to-linux-vm
image: assets/img/simple-nodejs-server.png
description: An introductory lesson on how to run a nodejs server on linux VM
tags: dev
---

# Simple Express Server

## Local Development

### Create index.js file

```javascript
// index.js
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
  res.end();
}).listen(8080);
```

### Run index.js

```bash
node index.js
```

You should then be able to access [http://localhost:8080](http://localhost:8080) in your browser and see the "Hello World!" message displayed.

## Linux VM

### SSH into VM

```bash
ssh username@xxx.xxx.xxx.xxx
```

Where `username` is the user you have access to and `xxx.xxx.xxx.xxx` is the IP Address of the remote server.

### Check if node is Installed

```bash
node -v
```

If this returns something along the lines of `v14.18.1`, then node is already installed.  If it says `Command 'node' not found` then you will need to install node.

### Install Node with Node Version Manager (NVM)

`nvm` is a script that helps manage multiple installations of node.  In my opinion, it is the easiest way to install and upgrade node versions.

#### Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

This script will add `nvm` as a command, but usually it does not become available to your current terminal session.  You can quit the current session with `Ctrl + D` and then ssh into the server again.  You can test that nvm is available with `nvm -v`.

#### Install node

```bash
nvm install node
```

This will install the latest version of node, if you need a specific version you can supply the version number instead. e.g. `nvm install 14`.  You can confirm it is installed by running `node -v`.

#### Create index.js with nano

`nano` is a text editor installed by default on pretty much all Linux machines. Once you have ssh'd in, you can run `nano index.js` to open the text editor.  This works a bit different than the GUI text editors you're probably used to, but is fairly simple to adjust to.  You can either re-type in the code for the node server, or you can paste it by copying and using `Ctrl + Shift + V` (Note that Ctrl + V doesn't paste in the terminal).

![Simple NodeJS Server Code in nano](/assets/img/simple-nodejs-server.png)

When you have the code in the file as desired, use `Ctrl+X` to exit nano.  It will then prompt you to "Save modifed buffer?" at the bottom of the terminal.

![Simple NodeJS Server Code in nano](/assets/img/simple-nodejs-server-1.png)

Type "y", and then it will prompt you to confirm the "File name to Write:".

![Simple NodeJS Server Code in nano](/assets/img/simple-nodejs-server-2.png)

Hit enter and this will close the `nano` editor and save the file.  You can confirm it exists by running `ls` which should show `index.js` as one of the files that exists in the current directory.

![Simple NodeJS Server Code in nano](/assets/img/simple-nodejs-server-3.png)

### Run node Server on VM

Running the script is the same on the VM.  `node index.js` should start it.  In order to access it, you will need to go to `http://xxx.xxx.xxx.xxx:8080` where `xxx.xxx.xxx.xxx` is the IP Address of your server.