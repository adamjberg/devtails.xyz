---
layout: post
title:  "2022 Advent of Code Day 1: Calorie Counting"
permalink: /@adam/advent-of-code/2022/day/1
image: 
author: adam
description:
tags: dev
---

# Misc Security Thoughts

I'm attempting to moderately participate in Advent of Code this year.  There are significant odds I don't keep up, but will do what I managed to have time to do.

Lately I have been circling back to the "basics" and remembering how to code in C.  I figured this would be a great opportunity to do this learning in an easy way.

Prior to starting the first day's puzzle I stumbled upon [this post](https://security.googleblog.com/2022/12/memory-safe-languages-in-android-13.html) on the Google Security Blog.  TLDR, the Android project has incorporated Rust (and other "memory safe" languages) and they show some stats on how the number of memory safety vulnerabilities has started to decrease over time.

I'm still in the information gathering phase of this debate.  I won't be shocked to find myself land on "team memory safe", but I need to explore and experiment in the realm to better understand why, as opposed to just blindly listening to random people shouting on the internet.

Shortly after, I spotted a new post about an [Android platform signing key compromised](https://news.ycombinator.com/item?id=33823946), which if I'm understanding correctly sounds like allows attackes to sign packages and essentially have them run as root.

It probably is a good thing to be reducing memory safety issues, but it kind of feels like we're dealing with a Hydra, where despite making progress an attacker just finds another way to circumvent the protections we invent.  

If you haven't seen the [LockPickingLawyer](https://www.youtube.com/@lockpickinglawyer/videos) on Youtube, have a quick peak.  Even some very expensive locks are being opened without a key in literally seconds.  I'm sure there's still research being done to enhance lock security, but if we haven't solved this problem...maybe we simply can't.

The original post from Android was definitely not stating "we have no more known vulnerabilities".  Instead, they are simply attempting to reduce the liklihood of having them.  But all it takes is a single vulnerability.  And at the current rate of things, I would probably guess **we will always have vulnerabilities**.

So what do we do about it?  For now, I don't have an informed enough answer to this question.  But I don't hold out hope for a magical future world where all of our software/hardware has 0 vulnerabilities.  However, I will say, that despite knowing someone could (and unfortunately has in the past) break into my home with relative ease, I have very little fear that this poses much more than an annoyance for me.  

Considering our software has been this insecure for 30 years, if someone wanted to steal all of your information, they already have.  But I bet for the majority of people, everything is still ok and funds from your bank account have not miraculously disappeared. 

This has been a long prologue to the actual code.  I mention it, because as part of this advent of code I'd like to be aware of the mistakes that are made.  I'll be writing in C to better understand how easy it is to make a memory safety error.  And I will reflect on whether simply using a different language like Rust would have helped me or if simply understanding the tools/paradigms better would allow me to avoid making such mistakes.

## --- Day 1: Calorie Counting ---

I didn't really intend to write an article tonight.  But the articles above stirred my brain a bit.  I wrote up my first iteration and submitted my answer.  I intentionally didn't review my code to thoroughly and just blindly submitted what was spit out.

### Iteration 1

My first answer came out as `82670259`.  I immediately felt like this sounded way too big, but I submitted nonetheless.  See below to see if you can spot the error.

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
  FILE * fp = fopen ("input.txt", "r");

  char ch;
  char buffer[6];
  int pos = 0;

  int maxElfCalories = 0;
  int currentElfCalories = 0;
  while((ch = getc(fp)) != EOF)
  {
    if (ch == '\n') {
      if (pos != 0) {
        int calories;
        sscanf(buffer, "%d", &calories);

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > maxElfCalories) {
          maxElfCalories = currentElfCalories;
        }
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  } 

  printf("%d", maxElfCalories);
  
  return 0;
}
```

### Iteration 2

I forgot to reset the `currentElfCalories` to 0 when reading a new block of calories, so that total was the sum of all numbers in the input file.  I made the quick fix and then submitted my new answer `707682`. This still felt pretty large, but it seemed like my file reading logic was sound so I went ahead an submitted.  Wrong again, still too large according to the submission page.

```diff
#include <stdio.h>
#include <stdlib.h>

int main() {
  FILE * fp = fopen ("input.txt", "r");

  char ch;
  char buffer[6];
  int pos = 0;

  int maxElfCalories = 0;
  int currentElfCalories = 0;
  while((ch = getc(fp)) != EOF)
  {
    if (ch == '\n') {
      if (pos != 0) {
        int calories;
        sscanf(buffer, "%d", &calories);

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > maxElfCalories) {
          maxElfCalories = currentElfCalories;
        }
+       currentElfCalories = 0;
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  } 

  printf("%d", maxElfCalories);
  
  return 0;
}
```

### Iteration 3

I re-read my code line by line and wasn't really seeing anything.  I decided to run through the debugger and see if anything stood out.

I had to get to the third "elf" before realizing what was going on.

```
2027
1630
4699
3860
5686
1178
4983
1075
5436
2522
4455
4808
3644
2344
1671

45637

5634
2755
3537
5047
1878
4820
5959
5412
6458
1544
3606
4374
2743
3946
```

The first block of numbers had no problems. As I manually cycled through each one, I started wondering if somehow the advent of code just had the wrong answer because it was clearly working exactly as I expected it to.

I made it to the second block and everything was reset correctly. The check for whether the max should be updated seemed fine.

I was almost ready to give up until I stumbled into the third block.  After succesfully parsing numbers this whole time, instead of `5634` it spat out `56347`.

Maybe you already see what happened here, but the funny thing is that I intentionally setup my buffer this way to experiment with what happens when I have an input number that has more digits than my buffer can hold.  I had pre-skimmed the file and determined that the max number of digits was 5, so a 6 character buffer was enough space for 5 digits and the all important null termination character `\0`.

If you don't know, in C strings, the way to determine you are at the end of a string is that the `char` stored there is `\0`.  My problem was that after reading a 5 digit number, reading future 4 digit numbers left the 5th digit as whatever was previously read.

And with that change, I landed on the correct answer.

```diff
#include <stdio.h>
#include <stdlib.h>
+ #include <string.h>

int main() {
  FILE * fp = fopen ("input.txt", "r");

  char ch;
  char buffer[6];
  int pos = 0;

  int maxElfCalories = 0;
  int currentElfCalories = 0;
  while((ch = getc(fp)) != EOF)
  {
    if (ch == '\n') {
      if (pos != 0) {
        int calories;
        sscanf(buffer, "%d", &calories);
+       memset(buffer, 0, sizeof(buffer));

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > maxElfCalories) {
          maxElfCalories = currentElfCalories;
        }
        currentElfCalories = 0;
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  } 

  printf("%d", maxElfCalories);
  
  return 0;
}
```

## Closing Thoughts

Despite trying to intentionally set myself up for a pretty classic C buffer failure, I managed to accidentally land on a separate C string issue.  

The C-haters will take this as evidence that C is bad, but let's keep in mind that I am by no means a professional C programmer.  Throughout this advent of code, I'd like to see if reflecting on these kinds of errors and learning from them can lead to coding patterns that eliminates these altogether.

I'm already seeing how this Advent of Code is a great oppurtunity to incrementally build some helper functions and data structures as they become useful.  I have been wanting to build a Vector in C and also a HashMap, both of which will probably be quite useful in future coding challenges.
