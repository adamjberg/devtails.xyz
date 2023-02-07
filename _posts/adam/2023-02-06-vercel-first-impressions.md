---
layout: post
title:  "Why You Should Think Twice About NextJS and Vercel"
author: adam
permalink: /@adam/why-you-should-think-twice-about-nextjs-and-vercel
image: 
description: 
tags: dev js engram
---

I've written enough articles about JavaScript to have had plenty of people tell me I should just use Next.js instead of learning how to do things myself.  I finally had some time to dive in to Next.js and Vercel and this article will lay out some of the issues and concerns I have that stop me from using either.  In about a week, I have built a deployment system [engram](https://engramhq.xyz/) that resolves these issues for me.  If you resonate with any of the problems identified below, please give it a go and send along any feedback you have.

## Vercel - Slow Deployment Times

![](/assets/img/vercel-deploy-300-ms.png)

Vercel's own homepage advertises: "Deploy content around the world and update it in 300ms." Perhaps they are referring to how long it takes to propagate your changes in their "Global Edge Network" once actually deployed.  But this is a far cry from the 20-30 seconds their own Next.js template takes to deploy.

![](/assets/img/vercel-slow-deploy.png)

Meanwhile the actual project I am experimenting with Vercel for has already ballooned to 40 seconds.

![](/assets/img/vercel-eventfare-deploy.png)

In an [interview with InfoWorld](https://www.infoworld.com/article/3653262/vercel-ceo-deployment-should-be-instantaneous.html), Vercel CEO Guillermo Rauch talks about how Vercel is making development instantaneous:

> "And third is the complete elimination of the provisioning of a development environment, making development instantaneous, real-time, and browser-focused. Next.js Live is a key component of that push."

This sounds great, we're now almost a year out from this interview and the only reference to Next.js Live I can find is the [original Next.js Live announcement on June 22, 2021](https://vercel.com/blog/nextjs-special-event-recap) and an [old Hacker News post](https://news.ycombinator.com/item?id=27517440).  

A quick hop in the [Wayback Machine](https://web.archive.org/web/20220801000000*/https://vercel.com/live) reveals something interesting.  In November of 2022, Vercel quietly replaced Vercel Live with the version of "previews" I am now frustrated with.  Trolling through the Vercel [changelog](https://vercel.com/changelog) and [blog](https://vercel.com/blog) I'm unable to find any information as to why Next.js Live was abandoned.

I can only assume chasing profits has diverted attention elsewhere.  The initial goal of instantaneous deployments is still one worth fighting for.  

This is one of the long term goals for [engram](https://engramhq.xyz/) that I have been learning and researching around.  The current version confirmed my suspicions that sub-second deployments is possible and I'm already seeing how it transforms the development process. 




With a weeks worth of effort I can successfully deploy my apps in under a second. 

## Next.js Slow Build Times

I took the same Next.js template and built it locally on my M1 mac and it takes 9 seconds to generate a "production" build.  That's 9 seconds for a landing page...What kind of processing is possibly happening for that long?  If that's the level of optimization I'm seeing for the most basic of projects, why would I have any hope that this isn't going to get worse and worse as I continue to add more and more pages?

## For a "platform for frontend developers" I'm Doing a Lot More DevOps Than I'd Like

About a month ago, I asked a frontend developer on my team to start a new project using Next.js and plan to deploy it using Vercel.  I was interested in seeing how accessible Vercel actually is.

The frontend Next.js app came together without much issue.  However, when it came time to deploy there were multiple issues.

Very early on, it became clear that our application would need some form of database.  Setting this up in the local environment was relatively smooth, but then previews and production deployments started failing.  We now needed to add a database to the mix.

This [Using Databases with Vercel](https://vercel.com/guides/using-databases-with-vercel) page would have most junior frontend developer headed for the hills.  As a "platform for frontend developers", I find it unacceptable to call it quits at the database layer.  If you have reached for a framework like Next.js, there is a near 100% chance you have a database of some kind.

I have plenty of experience in this realm and still ended up having multiple problems along the process of connecting my Vercel app to a databaase.  I decided to try Cloud SQL in Google Cloud Platform.  Where I accidentally picked a database instance that was far more expensive than I intended.  Then I had to figure out how to expose this database to all IPs (a security practice not recommended by many).  Finally, I managed to have it all working.

Except now I was seeing page load times of 300 - 500 ms.  It took a while to clue in to the fact that this was latency from Edge Functions to the database.  Mostly because we were only making a couple of queries, which even if in different locations should not have caused that much latency.

I was already set up in GCP, so I simply moved the Vercel serverless location closer to the database, which improved things, but still led to 150 ms - 240 ms response times.  Now that I'm aware that Vercel is hosted on AWS, I might be able to put it even closer.  But the point is that these are not concerns I should be thinking about when using a platform like Vercel.  