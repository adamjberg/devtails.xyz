---
layout: post
title:  "How to Build a Simple Blog in JavaScript"
author: adam
permalink: /@adam/how-to-build-simple-blog-in-javascript
image: 
description: 
tags: dev js
---

In this post I will show how to build a very simple blog using Node.js. At the end of the tutorial you will be able to add new posts as html files and access them via a web browser.

## Initialize Node Project

```bash
npm init
```

The default values are fine for our purposes so you can just keep hitting enter until it exits.  This command generates a `package.json` file that stores configuration of the project.

## Set type to module in package.json

```diff
{
  "name": "@engramhq/blog",
+ "type": "module", 
  "version": "1.0.0",
  "main": "index.js",
  "repository": "git@github.com:engramhq/blog.git",
  "author": "Adam Berg <adam@xyzdigital.com>",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  }
}

```

Unfortunately JavaScript has gone through some changes that has left multiple different ways of doing things.  This [StackOverflow](https://stackoverflow.com/questions/57492546/what-is-the-difference-between-js-and-mjs-files) question has some decent context to explain the difference between "CommonJS" and "ES6 Modules".  

The primary difference is how code is imported and exported between files.  You'll see many examples when searching for Node.JS solutions that use `require` instead of `import`.  As far as I can tell, the `import` syntax should be preferred.

## Create Express Application

[express](https://expressjs.com/) is a very common javascript package that simplifies the creation of an HTTP server.

### Install express Package

```bash
npm i express
```
### Create `index.js` File

```js
// index.js
// imports the library using ES6 Module syntax
import express from "express";

// Creates a new express application
const app = express();

// Configures express to handle GET requests to "/"
app.get("/", (req, res) => {
  // Specifies the data to return to the browser for the specified route
  res.send("Hello World");
});

// Tells express to open the server on port 8080
app.listen(8080);
```

### Test

Open a brower to [http://localhost:8080](http://localhost:8080) and you should see the "Hello World" message.

## Read Files From File System

As mentioned at the start, our server will simply read html files off the file system and return them to the browser.

```js
// index.js
// This is the node library for dealing with the file system
import fs from "fs";
import express from "express";

const app = express();

// The :slug identifies a "param" that will be captured in the req.params object
app.get("/content/:slug", (req, res) => {
  // This is fun ES6 syntax that grabs the `slug` property from the `req.params` object
  const { slug } = req.params;
  
  // This reads the file that the slug points to
  // The "`" and ${slug} are part of a [Template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
  const html = fs.readFileSync(`_posts/${slug}`);
  
  // fs.readFileSync returns a Buffer so here we convert it to a string and have express send it back
  res.send(String(html));
});

app.listen(8080);
```

### Test

In order to test this new route create a new folder called `_posts`.  Then add a file inside of it called `hello-world.html`.  In your browser, access [http://localhost:8080/content/hello-world.html](http://localhost:8080/content/hello-world.html) and you should see the contents of that file.

```html
<html>
  <h1>Hello World</h1>
</html>
```

## List Files in _posts Folder

We will now update the home page to show a list of links to all of the files that are available in the `_posts` folder.

```js
import fs from "fs";
import express from "express";

const app = express();

app.get("/", (req, res) => {
  // readdirSync reads the directory that is passed in and returns the names of the files inside it
  const filenames = fs.readdirSync("_posts");

  res.send(`
    <html>
      // This syntax is a little bit confusing, but you'll encounter stuff like it pretty often in JavaScript
      // filenames is an array of strings
      // The map function iterates over each element and then returns a new array with whatever was returned inside the inner function
      ${filenames.map((filename) => {
        // For each file, we are returning an anchor html element (<a>) with the `href` set to the URL to go to when clicked
        return `<a href="/content/${filename}">${filename}</a>`;
      })}
    </html>
  `);
});

app.listen(8080);
```

### Test

Opening [http://localhost:8080](http://localhost:8080) should now show you a list of links.  If you bring back the route from the previous section, you should be able to click the link and have it open the post.

## Final Solution

Putting it altogether gives you a reasonably functional blogging platform.  When you want to create a new post you simply create a new file and add the HTML code to it that you would like to display.

```js
import fs from "fs";
import express from "express";

const app = express();

app.get("/content/:slug", (req, res) => {
  const { slug } = req.params;
  const html = fs.readFileSync(`_posts/${slug}`);
  res.send(String(html));
});

app.get("/", (req, res) => {
  const filenames = fs.readdirSync(`_posts`);

  res.send(`
    <html>
      ${filenames.map((filename) => {
        return `<a href="/content/${filename}">${filename.replace(
          ".html",
          ""
        )}</a>`;
      })}
    </html>
  `);
});

app.listen(8080);
```
