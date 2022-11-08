---
layout: post
title:  "Building a Simple Database in Javascript"
author: adam
permalink: /@adam/building-a-simple-database-in-javascript
image: assets/img/building-a-simple-database-in-javascript.png
description: Tutorial for building a MongoDB like database in Javascript
tags: dev javascript engram
---

![](/assets/img/building-a-simple-database-in-javascript.png)

I have been using [MongoDB](https://www.mongodb.com/atlas/database) since about 2015.  I have enjoyed the flexibility of not defining schemas and constantly running migrations.  Particularly when it comes to prototyping and experimenting.  

As part of my project, [https://github.com/engramhq/engram](engram), I am re-learning, exploring, and sharing how different parts of web development are built.  Nowadays, it's easy to pull someone else's code or program and call it a day.  But I find this usually leaves us lacking understanding of how it actually works and limiting what is possible.

This post will go through creating a simple NoSQL database that persistently stores data in `json` files.

We will incrementally develop it getting each one of the CRUD (Create, Read, Update, Delete) acronym working before moving on to the next, as each one builds off of the previous.

I have recorded a video of the process from start to finish.  I may eventually add verbal explanation on top, but for now if you crank it to 2x speed it should be possible to see it all come together and work alongside it.  There are marked chapters that correspond to the headings of this tutorial.

<iframe width="100%" height="400" src="https://www.youtube.com/embed/dCWFLN1i9Ss" title="Building a Simple Database in Javascript Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Building TCP Server

Generally speaking most databases communicate over a TCP connection.  We will use the `net` package built into node to create a server that listens for connections and echoes back whatever the client sent to it.

```js
// server.js
const net = require('net')

const port = 3939;
const hostname = '127.0.0.1'

const server = net.createServer()
server.listen(port, hostname, () => {
  console.log("listening on port", port)
})

server.on('connection', (sock) => {
  sock.on('data', (data) => {
    console.log("Received", String(data));
    sock.write(data);
  })
})
```

## Building Hello World Client

In order to test the server we need a separate client program.  This one uses a socket to connect to the specific host ("127.0.0.1") and port (3939) that the server was created on.  It uses the `write` method to write a message to the server and upon receiving data back logs it out to the console.  

```js
// client.js
const net = require('net')

const port = 3939;
const hostname = '127.0.0.1'

const socket = new net.Socket();

socket.connect(port, hostname, () => {
  socket.write("Hello World!")
  socket.on('data', (data) => {
    console.log(String(data));
  })
})
```

### Testing Hello World Client

```bash
node server.js
node client.js
```

You must start the server first in order for it to be ready to accept connections from the client.  

## Create - Implementing insertOne

Now that we have some basic communication between a server and a client, it's time to add our first command `insertOne`.  This lays the groundwork for everything else after it so this is an important piece of the puzzle.  

The first design decision that can be seen pretty quickly is that the format of data between server and client transitions to JSON strings.  This makes structuring data extremely simple.  In a larger database system the waste of using the JSON format might be an issue, but for our purposes it won't be remotely noticeable that we aren't sending information over a binary protocol.

To further simplify things, the `_id` property is generated simply as a timestamp of the number of milliseconds from unix epoch.  This means that creating two documents within the same millisecond would give us duplicate _ids, which would lead to all kinds of problems.  In practical usage of this database for engram notes, it would be extremely difficult for me to manually generate two items in the same millisecond, so this is an acceptable limitation for now.

The actual data is stored in a JavaScript object `collections`.  Another object is created for each collection to house the "documents" in that specific collection.

Below is what the `collections` variable would look like after a single document is added to the `notes` collection.

```js
{
  "notes": {
    "1667863798986": {
      _id: "1667863798986",
      body: "Hello World!"
    }
  }
}
```

I would like this data to persist even after the database server has stopped running which means this data need to be written to disk at some point.  For now, I decided that this will be written as a `json` file for each collection.  Any time there is an update to a collection, that entire collection will get stringified and written to disk.  At high volumes this could be inefficient in many ways, but this makes understanding everything extremely simple.

### server.js

```js
const net = require("net");
const fs = require("fs");

const collections = {};

const port = 3939;
const hostname = "127.0.0.1";

const server = net.createServer();
server.listen(port, hostname, () => {
  console.log("listening on port", port);
});

server.on("connection", (sock) => {
  sock.on("data", (data) => {
    const jsonData = JSON.parse(data);
    const collection = getCollection(jsonData.collection);
    let response = "1";

    if (jsonData.insertOne) {
      const _id = new Date().getTime();

      collection[_id] = {
        ...jsonData.insertOne,
        _id
      }

      saveToFile(jsonData.collection)

      response = JSON.stringify({ insertedId: _id });
    }

    sock.write(response);
  });
});

function getCollection(collectionName) {
  if (!collections[collectionName]) {
    collections[collectionName] = {};
  }
  return collections[collectionName];
}

function saveToFile(collectionName) {
  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(getCollection(collectionName)));
}
```

### client.js

```js
const net = require('net')

const port = 3939;
const hostname = '127.0.0.1'

const socket = new net.Socket();

socket.connect(port, hostname, () => {
  socket.write(JSON.stringify({
    collection: "blocks",
    insertOne: {
      body: "Hello World!"
    }
  }))
  socket.on('data', (data) => {
    console.log(String(data));
  })
})
```

## Read - Implementing findOne

Now that we are able to create documents, the natural next step is to be able to fetch these documents.  For now, I only care to fetch them by _id and so I've implemented a `findOne` operation.  

Now that we have two possible operations, it was necessary to create helper functions for the different operations.  While the old `client.js` was able to just log out the data when it was returned, I've promisified the request / responses so that I can grab the `insertedId` from the newly created document.  With this, I'm able to query for the specific document that was just created.

### server.js

```js
// server.js
const net = require("net");
const fs = require("fs");

const collections = {};

const port = 3939;
const hostname = "127.0.0.1";

const dbFolderName = 'db'

try {
  fs.statSync(dbFolderName)
} catch(err) {
  fs.mkdirSync(dbFolderName)
}

const filenames = fs.readdirSync(dbFolderName);
for (const filename of filenames) {
  const collectionName = filename.split('.')[0]
  const collectionFileContents = fs.readFileSync(`${dbFolderName}/${filename}`);
  if (collectionFileContents) {
    collections[collectionName] = JSON.parse(collectionFileContents)
  }
}

const server = net.createServer();
server.listen(port, hostname, () => {
  console.log("listening on port", port);
});

server.on("connection", (sock) => {
  sock.on("data", (data) => {
    const jsonData = JSON.parse(data);
    const collection = getCollection(jsonData.collection);
    let response = "1";

    if (jsonData.insertOne) {
      const _id = new Date().getTime();

      collection[_id] = {
        ...jsonData.insertOne,
        _id,
      };

      saveToFile(jsonData.collection);

      response = JSON.stringify({ insertedId: _id });
    } else if (jsonData.findOne) {
      const filter = jsonData.findOne.filter;
      if (filter._id) {
        const data = collection[filter._id];

        response = JSON.stringify(data);
      }
    }

    sock.write(response);
  });
});

function getCollection(collectionName) {
  if (!collections[collectionName]) {
    collections[collectionName] = {};
  }
  return collections[collectionName];
}

function saveToFile(collectionName) {
  fs.writeFileSync(
    `${dbFolderName}/${collectionName}.json`,
    JSON.stringify(getCollection(collectionName))
  );
}
```

### client.js

```js
const net = require("net");

async function run() {
  const port = 3939;
  const hostname = "127.0.0.1";

  const socket = new net.Socket();

  socket.connect(port, hostname, async () => {
    const { insertedId } = await insertOne(socket, {
      collection: "blocks",
      data: {
        body: "Hello World!",
      },
    });

    const note = await findOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId,
      },
    });

    console.log(note);
  });
}

function insertOne(socket, { collection, data }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        insertOne: data,
      })
    );
  });
}

function findOne(socket, { collection, filter }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        findOne: {
          filter,
        },
      })
    );
  });
}

run();
```

## Update - Implementing updateOne

The updateOne follows what we did with the findOne operation.  The only difference is it now sends a `data` property along with the request so the server can update the existing document.

### server.js

```js
const net = require("net");
const fs = require("fs");

const collections = {};

const port = 3939;
const hostname = "127.0.0.1";

const dbFolderName = 'db'

try {
  fs.statSync(dbFolderName)
} catch(err) {
  fs.mkdirSync(dbFolderName)
}

const filenames = fs.readdirSync(dbFolderName);
for (const filename of filenames) {
  const collectionName = filename.split('.')[0]
  const collectionFileContents = fs.readFileSync(`${dbFolderName}/${filename}`);
  if (collectionFileContents) {
    collections[collectionName] = JSON.parse(collectionFileContents)
  }
}

const server = net.createServer();
server.listen(port, hostname, () => {
  console.log("listening on port", port);
});

server.on("connection", (sock) => {
  sock.on("data", (data) => {
    const jsonData = JSON.parse(data);
    const collectionName = jsonData.collection;
    const collection = getCollection(collectionName);
    let response = "1";

    if (jsonData.insertOne) {
      const _id = new Date().getTime();

      collection[_id] = {
        ...jsonData.insertOne,
        _id,
      };

      saveToFile(collectionName);

      response = JSON.stringify({ insertedId: _id });
    } else if (jsonData.findOne) {
      const filter = jsonData.findOne.filter;
      if (filter._id) {
        const data = collection[filter._id];

        response = JSON.stringify(data);
      }
    } else if (jsonData.updateOne) {
      const filter = jsonData.updateOne.filter;
      if (filter._id) {
        collection[filter._id] = {
          ...collection[filter._id],
          ...jsonData.updateOne.data
        };

        saveToFile(collectionName);

        response = "0";
      }
    }

    sock.write(response);
  });
});

function getCollection(collectionName) {
  if (!collections[collectionName]) {
    collections[collectionName] = {};
  }
  return collections[collectionName];
}

function saveToFile(collectionName) {
  fs.writeFileSync(
    `${dbFolderName}/${collectionName}.json`,
    JSON.stringify(getCollection(collectionName))
  );
}
```

### client.js

```js
const net = require("net");

async function run() {
  const port = 3939;
  const hostname = "127.0.0.1";

  const socket = new net.Socket();

  socket.connect(port, hostname, async () => {
    const { insertedId } = await insertOne(socket, {
      collection: "blocks",
      data: {
        body: "Hello World!",
      },
    });

    await updateOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId
      },
      data: {
        body: "Goodbye World!"
      }
    })

    const note = await findOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId,
      },
    });

    console.log(note);
  });
}

function insertOne(socket, { collection, data }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        insertOne: data,
      })
    );
  });
}

function findOne(socket, { collection, filter }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        findOne: {
          filter,
        },
      })
    );
  });
}

function updateOne(socket, { collection, filter, data }) {
  return new Promise((resolve) => {
    socket.once("data", () => {
      resolve();
    });

    socket.write(
      JSON.stringify({
        collection,
        updateOne: {
          filter,
          data
        },
      })
    );
  });
}

run();
```

## Delete - Implementing deleteOne

Now that we've done a few operations, the deleteOne should be fairly straightforward to understand or even implement on your own without following.  It simply deletes the object from the collection and resaves the json file to disk.

### server.js

```js
// server.js
const net = require("net");
const fs = require("fs");

const collections = {};

const port = 3939;
const hostname = "127.0.0.1";

const dbFolderName = "db";

try {
  fs.statSync(dbFolderName);
} catch (err) {
  fs.mkdirSync(dbFolderName);
}

const filenames = fs.readdirSync(dbFolderName);
for (const filename of filenames) {
  const collectionName = filename.split(".")[0];
  const collectionFileContents = fs.readFileSync(`${dbFolderName}/${filename}`);
  if (collectionFileContents) {
    collections[collectionName] = JSON.parse(collectionFileContents);
  }
}

const server = net.createServer();
server.listen(port, hostname, () => {
  console.log("listening on port", port);
});

server.on("connection", (sock) => {
  sock.on("data", (data) => {
    const jsonData = JSON.parse(data);
    const collectionName = jsonData.collection;
    const collection = getCollection(collectionName);
    let response = "1";

    if (jsonData.insertOne) {
      const _id = new Date().getTime();

      collection[_id] = {
        ...jsonData.insertOne,
        _id,
      };

      saveToFile(collectionName);

      response = JSON.stringify({ insertedId: _id });
    } else if (jsonData.findOne) {
      const filter = jsonData.findOne.filter;
      if (filter._id) {
        const data = collection[filter._id];

        response = JSON.stringify(data);
      }
    } else if (jsonData.updateOne) {
      const filter = jsonData.updateOne.filter;
      if (filter._id) {
        collection[filter._id] = {
          ...collection[filter._id],
          ...jsonData.updateOne.data,
        };

        saveToFile(collectionName);

        response = "0";
      }
    } else if (jsonData.deleteOne) {
      const filter = jsonData.deleteOne.filter;
      if (filter._id) {
        delete collection[filter._id];

        saveToFile(collectionName);

        response = "0";
      }
    }

    sock.write(response);
  });
});

function getCollection(collectionName) {
  if (!collections[collectionName]) {
    collections[collectionName] = {};
  }
  return collections[collectionName];
}

function saveToFile(collectionName) {
  fs.writeFileSync(
    `${dbFolderName}/${collectionName}.json`,
    JSON.stringify(getCollection(collectionName))
  );
}
```

### client.js

```js
// client.js
const net = require("net");

async function run() {
  const port = 3939;
  const hostname = "127.0.0.1";

  const socket = new net.Socket();

  socket.connect(port, hostname, async () => {
    const { insertedId } = await insertOne(socket, {
      collection: "blocks",
      data: {
        body: "Hello World!",
      },
    });

    await updateOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId
      },
      data: {
        body: "Goodbye World!"
      }
    })

    const note = await findOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId,
      },
    });

    await deleteOne(socket, {
      collection: "blocks",
      filter: {
        _id: insertedId
      }
    })
  });
}

function insertOne(socket, { collection, data }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        insertOne: data,
      })
    );
  });
}

function findOne(socket, { collection, filter }) {
  return new Promise((resolve) => {
    socket.once("data", (data) => {
      resolve(JSON.parse(String(data)));
    });

    socket.write(
      JSON.stringify({
        collection,
        findOne: {
          filter,
        },
      })
    );
  });
}

function updateOne(socket, { collection, filter, data }) {
  return new Promise((resolve) => {
    socket.once("data", () => {
      resolve();
    });

    socket.write(
      JSON.stringify({
        collection,
        updateOne: {
          filter,
          data
        },
      })
    );
  });
}

function deleteOne(socket, { collection, filter }) {
  return new Promise((resolve) => {
    socket.once("data", () => {
      resolve();
    });

    socket.write(
      JSON.stringify({
        collection,
        deleteOne: {
          filter
        },
      })
    );
  });
}

run();
```

## Wrap Up

I have toyed around with the idea of building a database for many years.  I've started and stopped these projects a few times now.  I think the only way to really dive deep into it is to just start using it in a real application.  From here I will be converting my existing [engram](https://github.com/engramhq/engram) application to use this database instead of it's current mongodb.  I'm hoping that doing so will naturally introduce some of the challenges that exist when building a database so I can better learn what's really happening behind the scenes.