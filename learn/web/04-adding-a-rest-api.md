---
layout: post
title: "Adding a REST API to Persist Data Between Browser Sessions"
---

## Pre-Requisites

[Sprucing up HTML with CSS](/learn/web/03-sprucing-up-html-with-css)

## Assignment Summary

One of the ways to store data for a web application so that it can be accessed from multiple computers is to store the data on a server and create an [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) (HyperText Transfer Protocol) [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) (Representational state transfer) [API](https://en.wikipedia.org/wiki/API) (Application Programming Interface)

In this assignment, we will use [NodeJS](https://nodejs.org/en/) to create a simple web server. We will use a very common web framework called [express](https://expressjs.com/) to simplify the code that is written.

You will learn how to make CRUD (Create, Read, Update, and Delete) routes for our notes data.

At the end of the assignment, you will have a REST server that stores data on the server that can be accessed by making HTTP requests to the server.

## Installing NodeJS

[NVM](https://github.com/nvm-sh/nvm#install--update-script) is my preferred way to install node on my system.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

You likely need to close and re-open your terminal to ensure it can access the newly install `nvm` command.

```bash
nvm install node
```

Now you can confirm node is installed by running `node -v`.

## Initializing Project

Create a new directory called `api-intro`.

```bash
mkdir -p ~/code/api-intro
```

Change directory into this folder.

```bash
cd ~/code/api-intro
```

### Create [npm](https://www.npmjs.com/) project. 

npm is a package manager for JavaScript. It enables installing and managing dependencies for your project.


```bash
npm init
```

The default values are fine for our purposes so you can just keep hitting enter until it exits.  This command generates a `package.json` file that stores configuration of the project.

### Set type to module in package.json

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

Unfortunately, JavaScript has gone through some changes that has left multiple different ways of doing things.  This [StackOverflow](https://stackoverflow.com/questions/57492546/what-is-the-difference-between-js-and-mjs-files) question has some decent context to explain the difference between "CommonJS" and "ES6 Modules".  

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

### Start the server:

```bash
node index.js
```

### Test

Open a brower to [http://localhost:8080](http://localhost:8080) and you should see the "Hello World" message.

## Create, Read, Update, Delete (CRUD)

[CRUD are the four basic operations of persistent storage](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete).  We will add each of these operations one by one and, once complete, we will have a working API that persists data on the server.

REST defines several [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).  These are not necessarily mandatory to use, but over time it will become more clear why they exist.

CRUD to method mappings

| | |
|--|--|
| **CRUD** | **HTTP** |
|Create | POST, PUT if we have `id` or `uuid`|
|Read |	GET|
|Update | PUT|
|Delete | DELETE|

So far, our web application only needs Create and Read so we will begin with just these.

## Create

```js
// This enables JSON parsing of the request body
app.use(express.json());

// This variable will hold our notes
const notes = [];

// This defines a route on http://localhost:8000/notes for the POST method
app.post("/notes", (req, res) => {
  // The `req.body` property will have the data that was passed from the browser
  notes.push(req.body);

  console.log(notes);

  // HTTP uses Status Codes (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
  // to identify whether a request has been successfully completed
  // 200 specifies that the operation was a success
  res.sendStatus(200);
});
```

### Restart the server

If you left the server running from the first step, you can stop it by focusing on the terminal (e.g. clicking into it) and then hitting ctrl+c on you keyboard. This will stop the currently running command.

```bash
node index.js
```

### Test

There are many ways to test a REST API.  [curl](https://curl.se/) is an extremely popular command line client that is worth getting familiar with.  The command below constructs an HTTP POST request with a JSON body of:

```json
{
  "body": "Hello World"
}
```

```bash
curl -X POST -H "Content-Type: application/json" -d '{"body": "Hello World"}' http://localhost:8000/notes
```

The `-X POST` sets the HTTP method to "POST" (the default is "GET").

The `-H "Content-Type: application/json"` sets the "Content-Type" header to "application/json" which informs the server on how to parse this information.

The `-d '{"body": "Hello World"}'` attaches this data to the body of the request (this is what `req.body` will be set to).

The `http://localhost:8000/notes` portion specifies the URI that we are making the request to. This maps directly to the "/notes" route that we defined on this lin: `app.post("/notes", (req, res) => {`.

If successful, you should see `OK(base)` after the curl command and in the logs of your node server, you should see:

```js
[ { body: 'Hello World' } ]
```

## Read

Now that we have a route that can add notes, we need a new route to return the existing notes.  This will eventually be used by the client side browser application to load all existing notes when opening the web application.

```js
app.get("/notes", (req, res) => {
  // res.json handles converting the passed object to JSON and setting appropriate headers
  // It will also automatically set the HTTP status code to 200
  res.json(notes);
});
```

### Automatically reload your server

Every time you make a change to the `index.js` file, you need to reload it.  You can automate this process by running the server with:

```bash
node --watch index.js
```

This will automatically restart the process whenever the `index.js` file changes.

### Test

This one can be tested in the browser easily by navigating to [http://localhost:8000/notes](http://localhost:8000/notes).  Any notes created will get destroyed when the server restarts, so you will need to re-run the curl command from the previous section to add notes and confirm they are returned correctly.  The next assignment will introduce a database to prevent this from being a problem.

## Final Solution

```js
// index.js
import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const notes = [];

app.post("/notes", (req, res) => {
  notes.push(req.body);

  res.sendStatus(200);
});

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.listen(8000);
```

## Next

In the next assignment, we will hook up our existing frontend web application with these new backend REST API routes.  

[Connecting to REST API to Persist Data Between Browser Sessions](/learn/web/05-connecting-to-rest-api-to-persist-data-between-browser-sessions)