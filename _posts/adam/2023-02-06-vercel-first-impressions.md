---
layout: post
title:  "Why I am Struggling to get Behind Next.js and Vercel"
author: adam
permalink: /@adam/why-i-am-struggling-to-get-behind-nextjs-and-vercel
image: assets/img/sunk-boat.jpg
description: In this article I lay out concerns I have with Next.js and Vercel that stop me from committing to either
tags: dev js engram
---

![](/assets/img/sunk-boat.jpg)

<figcaption>Sometimes a little floaty is more effective than a big boat</figcaption>

I've written enough articles about JavaScript to have had plenty of people tell me I should just use Next.js instead of learning how to do things myself.  I finally had some time to dive in to Next.js and Vercel and this article will lay out some of the concerns I have that stop me from committing to either.  

As part of my investigation, I built my own deployment tool to get a better understanding of what should be possible from a serverless platform like Vercel. In about a week, I created [engram](https://engramhq.xyz/), a deployment platform that has already started to address some of the issues I faced with Vercel.  If you resonate with any of the problems identified below, please give it a go and send along any feedback you have.

## Vercel - Slow Deployment Times

![](/assets/img/vercel-deploy-300-ms.png)

Vercel's own homepage advertises: "Deploy content around the world and update it in 300ms." Perhaps they are referring to how long it takes to propagate your changes in their "Global Edge Network" once actually deployed.  But this is a far cry from the 20-30 seconds their own Next.js template takes to deploy.

![](/assets/img/vercel-slow-deploy.png)

Meanwhile the actual project I am experimenting with Vercel for has already ballooned to 40 seconds.

![](/assets/img/vercel-eventfare-deploy.png)

In an [interview with InfoWorld](https://www.infoworld.com/article/3653262/vercel-ceo-deployment-should-be-instantaneous.html), Vercel CEO Guillermo Rauch talks about how Vercel is making development instantaneous:

> "And third is the complete elimination of the provisioning of a development environment, making development instantaneous, real-time, and browser-focused. Next.js Live is a key component of that push."

This sounds great, but we're now almost a year out from this interview and the only reference to Next.js Live I can find is the [original Next.js Live announcement on June 22, 2021](https://vercel.com/blog/nextjs-special-event-recap) and an [old Hacker News post](https://news.ycombinator.com/item?id=27517440).  

A quick hop in the [Wayback Machine](https://web.archive.org/web/20220801000000*/https://vercel.com/live) reveals something interesting.  In November of 2022, Vercel quietly replaced Vercel Live with the version of "previews" I am now frustrated with.  Trolling through the Vercel [changelog](https://vercel.com/changelog) and [blog](https://vercel.com/blog) I'm unable to find any information as to why Next.js Live was abandoned.

## Next.js - Slow Build Times

While there's some additional overhead on the Vercel preview side of things, I was kind of shocked to see how much time the `next build` step was taking.

I took the same Next.js template and built it locally on my M1 mac and it takes 9 seconds to generate a "production" build.  **That's 9 seconds to build a static landing page.** What kind of processing is possibly happening for that long?  If that's the level of optimization I'm seeing for the most basic of projects, why would I have any hope that this isn't going to get worse and worse as I continue to add more and more pages?

## For a "platform for frontend developers" I'm Doing a Lot More DevOps Than I'd Like

About a month ago, I asked a frontend developer on my team to start a new project using Next.js and deploy it using Vercel.  I was interested in seeing how accessible Vercel actually is.

The frontend Next.js app came together without much issue.  However, when it came time to deploy, there were multiple issues.

Very early on, it became clear that our application would need some form of database.  Setting this up in the local environment was relatively smooth, but then previews and production deployments started failing.  We now needed to add a database to the mix.

This [Using Databases with Vercel](https://vercel.com/guides/using-databases-with-vercel) page would have most junior frontend developer headed for the hills.  As a "platform for frontend developers", I find it unacceptable to call it quits at the database layer.  If you have reached for a framework like Next.js, there is a near 100% chance you have a database of some kind.

I have plenty of experience in this realm and still ended up having multiple problems along the process of connecting my Vercel app to a databaase.  I decided to try Cloud SQL in Google Cloud Platform.  Where I accidentally picked a database instance that was far more expensive than I intended.  Then I had to figure out how to expose this database to all IPs, a security practice not recommended by Google (though [Vercel downplays this](https://vercel.com/guides/how-to-allowlist-deployment-ip-address)).  Finally, I managed to have it all working.

Except now I was seeing page load times of 300 - 500 ms.  It took a while to clue in to the fact that this was latency from Edge Functions to the database.  Mostly because we were only making a couple of queries, which even if in the functions and database were in different locations should not have caused that much latency.

I was already set up in GCP, so I simply moved the Vercel serverless location closer to the database, which improved things, but still led to 150 ms - 240 ms response times.  Now that I'm aware that Vercel is hosted on AWS, I might be able to put it even closer.  But the point is that these are not concerns I should be thinking about when using a platform like Vercel.

## What Does an Alternative Look Like?

I struggle a bit to understand what kind of developer Vercel is for.  It seems to force a frontend developer to learn multiple DevOps related things while getting in the way of an experienced DevOps developer.  Judging by their amount of funding and landing page, I would guess that they're focus has shifted towards big corporations (their home page lists Adobe, ebay, loop, and The Washington Post) as some of the companies using Vercel.

For these mega-corps, 20 seconds to deploy is probably lightning fast relative to the pace of change within the company.  However, when you scale this down to a single developer or a small team, all of a sudden 20-40 seconds is a lifetime.  I'll catch a bug from a deployment and have the fix made in a second, but with Vercel it would be nearly a full minute before that fix actually goes live.

Over the last couple of years, I have witnessed the bloat of JavaScript packages/frameworks reach unsustainable territory.  I believe that the future isn't growing layers of complexity, but instead stripping down to only what is required.  The most efficient and easy to use system should be incredibly simple.

My current version of [engram](https://engramhq.xyz/) is already able to deploy any of my applications in less than a second.  With future optimizations, I believe the local development environment can be replaced entirely by a faster and more collaborative cloud based system.  I've already seen the current version transform and accelerate my building of new applications and look forward to making further improvments.

At this point, it's safe to say I'm not looking back.  I know I can build a better, more accessible deployment platform and that's what I'm going to do.  As usual, I'll share my learnings along the way.