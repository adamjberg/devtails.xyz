---
layout: post
title:  "Tutorial: How to Send Web Push Notifications in iOS Safari"
permalink: /@adam/how-to-setup-web-push-notifications-in-ios-safari
image: assets/img/ios-notification.jpeg
author: adam
description: Step by step instructions for sending your first web push notification in iOS Safari
tags: dev js
---

![iOS Notification](/assets/img/ios-notification.jpeg)

## Code

The final code for this tutorial can be found [here](https://github.com/adamjberg/ios-push-notifications).

## Intro

The day is finally here. [Web push for web apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) will be made available in iOS 16.4. If you are impatient like me, you can get access to the iOS 16.4 Beta by signing up for the [Apple Beta Software Program](https://beta.apple.com/sp/betaprogram).  iOS 16.4 is expected to be released in March 2023, so you shouldn't have to wait much longer to get access to this newly added functionality.

Apple didn't provide a whole lot of information as to how to actually get this working, so I've gone through the effort of figuring it out put together the smallest example possible to get going.  The first part covers creating a notification using the Notification API exclusively from the client side.  The [next section](#server-side-push-notifications) will build off of that and show how to trigger a notification from a backend nodejs server.

## Client Side Notifications

### index.html

We start with a very basic html page to load up our script and manifest files and a button that will trigger the notification permission request. Safari requires user interaction in order to request this permission.

```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="manifest" href="/site.webmanifest">
  <script src="index.js" defer></script>
  <title>Notifications</title>
</head>
<body>
  <button id="subscribe">Subscribe</button>
</body>
</html>
```

### site.webmanifest

The notifications only work when your website is added to a user's home screen. This webmanifest file is a basic start that you can fill in with the required details for your application.  If you have an icon you'd like to use, you can use this [favicon generator](https://realfavicongenerator.net/) to create the required icon sizes and web manifest file.

```json
{
    "name": "Notification",
    "short_name": "Notification",
    "icons": [],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone"
}
```

### index.js

First we register a service worker (this is required by iOS Safari to send notifications).  Then we set up a click listener on the subscribe button. On click, we request permission to send the user notifications.  If the user grants access, we can immediately test the notification by calling `registration.showNotification`.

```js
async function run() {
  // A service worker must be registered in order to send notifications on iOS
  const registration = await navigator.serviceWorker.register(
    "serviceworker.js",
    {
      scope: "./",
    }
  );

  const button = document.getElementById("subscribe");
  button.addEventListener("click", async () => {
    // Triggers popup to request access to send notifications
    const result = await window.Notification.requestPermission();

    // If the user rejects the permission result will be "denied"
    if (result === "granted") {
      // You must use the service worker notification to show the notification
      // Using new Notification("Hello World", { body: "My first notification on iOS"}) does not work on iOS
      // despite working on other platforms
      await registration.showNotification("Hello World", {
        body: "My first notification on iOS",
      });
    }
  });
}

run();
```

### Create serviceworker.js File

It can be completely empty for now.  Just needs to exist in order to meet the service worker requirements.

### Testing This on Your Device

#### Enabling the Notifications Feature in iOS 16.4 Safari Beta

I struggled for a while to figure out why these notifications weren't working.  While this is in beta, it seems like Notifications are turned off in Safari by default.  You can enable them by going to Settings > Safari > Advanced > Experimental Features.  Scroll down to "Notifications" and turn the toggle to on if it is not already on.  I suspect this will be defaulted to on when iOS 16.4 is officially released, but if you are trying this out with the beta, it is likely you will need to perform this step.

#### HTTPS Connection

Testing this on a real device requires an https connection.  You will need to deploy your code in some way that allows it to be accessed from your phone with an https connection.

You can find a live example running [here](https://notification-adam.cloud.engramhq.xyz/).  Pressing the subscribe button won't do anything if you just have the page opened from your browser.  You will first need to click the share button and then "Add to Home Screen".  Open the app that now shows on your home screen and press the subscribe button. The app will ask for permission to send notifications and once granted immediately send the test notification.

## Server Side Push Notifications

### Create Express Application

#### Install Required Dependencies

```bash
yarn add express dotenv web-push
```

#### Generate Vapid Keys

```bash
./node_modules/.bin/web-push generate-vapid-keys
```

This will generate something like:

```
=======================================

Public Key:
[[Big long string]]

Private Key:
[[Slightly less long string]]

=======================================
```

#### Create .env File

Copy the public and private keys and paste them in a `.env` file.  The web-push also requires an email address, so add this as well.

```
VAPID_PUBLIC_KEY=[[Big long string from above]]
VAPID_PRIVATE_KEY=[[Slightly less long string from above]]
VAPID_MAILTO=your@email.com
```

#### server.mjs

I've boiled this down to the bare minimum, but it is likely you will have some concept of a database and need to store subscriptions specific to users, etc.  This basic API allows the client side to subscribe to notifications by POSTing to `/save-subscription` and then a notification can be triggered by making a GET request to `/send-notification`.

```js
import express from "express";
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

let subscriptionData = null;

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_MAILTO}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

app.get('/send-notification', (req, res) => {
  webpush.sendNotification(subscriptionData, "Hello World")
  res.sendStatus(200);
})

app.post("/save-subscription", async (req, res) => {
  subscriptionData = req.body;
  res.sendStatus(200);
});

app.use(express.static("./public"));

app.listen(8000);
```

### Update index.js

```js
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function run() {
  // A service worker must be registered in order to send notifications on iOS
  const registration = await navigator.serviceWorker.register(
    "serviceworker.js",
    {
      scope: "./",
    }
  );

  const button = document.getElementById("subscribe");
  button.addEventListener("click", async () => {
    // Triggers popup to request access to send notifications
    const result = await window.Notification.requestPermission();

    // If the user rejects the permission result will be "denied"
    if (result === "granted") {
      const subscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(
          "[[INSERT YOUR PUBLIC VAPID KEY HERE]]"
        ),
        userVisibleOnly: true,
      });

      await fetch("/save-subscription", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
    }
  });
}

run();
```

### Update serviceworker.js

Finally we add an event listener in the service worker to detect when a message has been pushed.  We pull off the title and body and call the same showNotification function used above.

```js
self.addEventListener("push", async (event) => {
  const { title, body } = await event.data.json();
  self.registration.showNotification(title, {
    body,
  });
});
```

## Wrap-up

This announcement is a big step for Progressive Web Apps (PWAs) on iOS.  Notifications were probably the number one cited reason companies reached for a native application.  Despite the plethora of news articles about this announcement, I couldn't find a single up to date resource on how to actually implement this.  So hopefully the time I spent putting this together saves you some time on the topic.

## Resources

[https://web.dev/push-notifications-subscribing-a-user](https://web.dev/push-notifications-subscribing-a-user/)