---
layout: post
title:  "Building a Promise Pool in TypeScript"
permalink: /@adam/building-a-promise-pool-in-typescript
image: 
author: adam
description: 
tags: dev
---

I have now worked with several programs that process large queues of objects. One hypothetical example could be a script that needs to send an email to all users in the database.  Below I'll dive into different methods of scaling this, culminating in a fairly simple PromisePool class that allows for continuous concurrent promise execution.

### Assumptions

- 1 million users
- Sending an email takes (on average) 500ms

### Send One by One

```ts
for (const email of emails) {
  await sendEmail(email);
}
```

The naive solution is to simply send each email one by one which will take 1,000,000 * 500ms which amounts to almost 6 days.

### Batch Send 100 Emails at a Time

```ts
let promises = [];
for (const email of emails) {
  if (promises.length < 100) {
    promises.push(sendEmail(email));
  } else {
    await Promise.all(promises);
    promises = [];
  }
}
```

With this solution we are sending 100 emails at a time.  If we assume this has no effect on the time to send an email (*hint* it probably does) this new method will take (1,000,000 / 100) * 500ms or ~83 minutes.

Unfortunately, in practice, this does not match up with the results you see.  The process, the network, and all kinds of other things can impact the performance of an individual request.  Our 500 millisecond response time is an average over all requests, but the actual time to send and email varies drastically.  In certain instances, an individual email send might take up to 60 seconds.  

As written above, all 99 other emails may have completed being sent, but no new ones will start until the slow 60 second one completes. 

With a concurrency of 100, 10,000 separate "batches" will be executed.  Let's now assume 1% of the time an email takes 60 seconds and 5% of the time an email takes 10 seconds.  To simplify the math we'll assume all other requests still take 500ms.  100 batches will now take a full minute and 500 batches will take 10 seconds.  (100 * 60) + (500 * 10) + ((10000 - 600) * .5 seconds) = ~262 minutes.  Our actual processing time is more than triple what it was supposed to be.

### Concurrently Process a Pool of Promises

The main problem with the previous solution is that all promises must complete before we move on.  What we instead want is to make sure there are always 100 emails concurrently being sent at a time.  This is where a "Promise Pool" comes in handy.  

```ts
class PromisePool {
  private concurrency: number;
  private items: Promise<void>[];

  constructor({
    concurrency
  }: { concurrency: number }) {
    this.concurrency = concurrency;
  }

  async add(asyncTaskFn: () => Promise<void>) {
    if (this.items.length >= this.concurrency) {
      // halt execution until fastest promise fulfills
      await Promise.race(this.items);
    }

    const newlyAddedPromise = asyncTaskFn();

    newlyAddedPromise.then(() => {
      // When promise resolves remove it from stored array of promises
      this.items = this.items.filter((filterItem) => {
        return filterItem !== newlyAddedPromise;
      });
    });

    this.items.push(newlyAddedPromise);
  }
}

let promisePool = new PromisePool({
  concurrency: 100
});
for (const email of emails) {
  await promisePool.add(sendEmail.bind(this, email))
}
```

The for loop now looks almost as simple as our simple one by one sending. As soon as a promise resolves, a new one will fill it's spot.

If we take the same assumptions where 1% of the time an email takes 60 seconds and 5% of the time an email takes 10 seconds, we'll find that this becomes a lot less relevant.  The calculation should start to average out to what we originally calculated: (1,000,000 / 100) * 500ms or ~83 minutes.  Every one in a hundred requests will take a full minute, but while that is held up, there are still 99 other requests being processed.