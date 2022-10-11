---
layout: post
title:  "Publishing to Medium from Jekyll Using Medium API"
permalink: /@adam/publishing-to-medium-from-jekyll-using-medium-api
image: /assets/img/jekyll-medium
author: adam
description: Step by step instructions for using the Medium API to cross post to Medium
tags: dev
---

![](/assets/img/jekyll-medium.png)

All of my technical writing is originally written for [https://devtails.xyz/](https://devtails.xyz/). dev/tails is a blog hosted from Github Pages and built using the [jekyll](https://jekyllrb.com/) static site generator.

Up until now, I've relied on Medium's "Import a Story" feature to cross post to Medium.  Unfortunately, almost 100% of the time code blocks and other things get lost in translation making me significantly less likely to actually cross post an article.  

I'm writing this article as I craft a JavaScript program that will publish this article to Medium with little to no handholding along the way.

## Documentation

The documentation for the Medium API can be found [here](https://github.com/Medium/medium-api-docs).  The docs specify that "Users can request an access token by emailing yourfriends@medium.com. We will then grant access on the Settings page of their Medium account.", but upon heading to my settings page I already had the Integration tokens setting enabled.

## Create Integration Token

Head to the [Settings page](https://medium.com/me/settings) in Medium and then scroll down to the "Integration tokens" section.  Type in a name for your token and then click the "Get integration token" button.

## Testing Integration Token

```ts
async function run() {
  const token = "INSERT YOUR TOKEN HERE";
  const res = await fetch("https://api.medium.com/v1/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  console.log(await res.json())
}

run();
```

After running this, you should see an output like:

```json
{
  "data": {
    "id": "153c9e8a4fdeb3740507f08ecb43235618c83250367c37b99460885d02a51c614",
    "username": "devtails",
    "name": "Adam Berg",
    "url": "https://medium.com/@devtails",
    "imageUrl": "https://cdn-images-1.medium.com/fit/c/400/400/1*u_mf1m5mJY_XDpgyjLoYOg.jpeg"
  }
}
```

## Creating Our First Draft Post

Now that we've confirmed the integration token works, and we've got our user id, we can now proceed to create a draft post.  See the [Posts section in the API docs](https://github.com/Medium/medium-api-docs#33-posts) for all possible properties.

```ts
async function run() {
  const userId = "INSERT USER ID HERE";
  const token = "INSERT YOUR TOKEN HERE";
  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Hello World",
      contentFormat: "markdown",
      content: "# Hello World",
      publishStatus: "draft"
    })
  });
  
  console.log(await res.json())
}

run();
```

Now if you head to your [drafts](https://medium.com/me/stories/drafts) you should see the "Hello World" draft there.

## Reading Front Matter from Jekyll Post

The good news is that the Medium API allows you to send markdown.  The bad news is that jekyll expects you to have front matter and if you don't remove the front matter it will show in your Medium post.

The [front-matter](https://www.npmjs.com/package/front-matter) package on npm handles parsing markdown frontmatter.

```
npm i front-matter
```

Putting this all together we get:

```typescript
import fs from "fs";
import fm from "front-matter";

const filepath = process.argv[2];

async function run() {
  const postFileData = fs.readFileSync(filepath);

  const content = fm(postFileData.toString());

  const userId = "INSERT USER ID HERE";
  const token = "INSERT YOUR TOKEN HERE";
  const res = await fetch(
    `https://api.medium.com/v1/users/${userId}/posts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: (content.attributes as any)["title"],
        contentFormat: "markdown",
        content: content.body,
        canonicalUrl: `https://devtails.xyz${(content.attributes as any)["permalink"]}`,
        publishStatus: "draft",
      }),
    }
  );

  console.log(await res.json());
}

run();
```

## Wrap-Up

Writing this quick program probably took less time than manually cross posting one of my posts in the past.  Having this script should help me more consistently post my material on Medium.  I guess it's time to run this script on this post now.