---
layout: post
title: "Adding a REST API to Persist Data Between Browser Sessions"
---

## Pre-Requisites

- This assignment can be done independently from the earlier lessons
- A future assignment will handle linking the frontend application to this API

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
mkdir ~/code/api-intro
```

Change directory into this folder.

```bash
cd ~/code/api-intro
```

Create [npm](https://www.npmjs.com/) project

```bash
npm init
```

You can leave all the defaults here and just hit enter a few times to complete the setup.

npm is a package manager for JavaScript. It enables installing and managing dependencies for your project.

## Install Dependencies

The command below will install the express package. After running it, you will see a new folder created called `node_modules`. This new folder is managed by npm and stores all the external code from your dependencies and automatically includes it in the final build as needed.

```bash
npm i express
```
