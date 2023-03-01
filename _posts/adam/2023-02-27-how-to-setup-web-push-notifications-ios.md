---
layout: post
title:  "Tutorial: How to Setup Web Push Notifications in iOS Safari"
permalink: /@adam/how-to-setup-web-push-notifications-in-ios-safari
image: /assets/img/ios-notification.jpeg
author: adam
description: Step by step instructions for creating your first web push notification in iOS Safari
tags: dev js
---

![iOS Notification](/assets/img/ios-notification.jpeg)

The day is finally here. [Web push for web apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) will be made available in iOS 16.4. If you are impatient like me, you can get access to the iOS 16.4 Beta by signing up for the [Apple Beta Software Program](https://beta.apple.com/sp/betaprogram).  iOS 16.4 is expected to be released in March 2023, so you shouldn't have to wait much longer to get access to this newly added functionality.

Apple's didn't provide a whole lot of information as to how to actually get this working, so I've gone through the effort of figuring out how to get this to work and have put together the smallest example possible to get you going.  The example we will cover will just be for creating a notification using the Notification API exclusively from the client side.  I will likely follow up with a separate post on how to use web-push to trigger notifications from your backend.

## index.html

We start with a very basic html page to load up our script and manifest files.  Then we add a simple button that we will use to trigger the notification permission request. Safari requires user interaction in order to request this permission.

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

## site.webmanifest

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

## index.js

Next we register a service worker, this is required by iOS Safari.  Then we setup a click listener on the subscribe button. On click we request permission to send the user notifications.  If the user grants access we can immediately test the notification by calling `registration.showNotification`.

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

## Testing This on Your Device

### Enabling the Notifications Feature in Safari

I struggled for a while to figure out why these notifications weren't working.  While this is in beta, it seems like Notifications are turned off in Safari by default.  You can enable them by going to Settings > Safari > Advanced > Experimental Features.  Scroll down to "Notifications" and turn the toggle to on if it is not already on.  I suspect this will be defaulted to on when iOS 16.4 is officially released, but if you are trying this out with the beta, it is likely you will need to perform this step.

### HTTPS Connection

Testing this on a real device requires an https connection.  You will need to deploy your code in some way that allows it to be accessed from your phone with an https connection.

You can find a live example running [here](https://notification-adam.cloud.engramhq.xyz/).  Pressing the subscribe button won't do anything if you just have the page opened from your browser.  You will first need to click the share button and then "Add to Home Screen".  Open the app that now shows on your home screen and pressing the subscribe button should ask for permission to send notifications and once granted immediately send the test notification.

## Wrap-up

This announcement is a big step for PWAs on iOS.  Notifications were probably the number one cited reason companies reached for a native application.  Despite the plethora of news articles about this announcement, I couldn't find a single up to date resource on how to actually implement this.  So hopefully the time I spent putting this together saves you some time on the topic.  