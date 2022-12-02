---
layout: post
title:  "2022 Advent of Code Day 1: Calorie Counting"
permalink: /@adam/advent-of-code/2022/day/1
image: 
author: adam
description:
tags: dev
---

Repo can be found [here](https://github.com/adamjberg/advent-of-code-2022)

## Misc Security Thoughts

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

### Part One

I didn't really intend to write an article tonight.  But the articles above stirred my brain a bit.  I wrote up my first iteration and submitted my answer.  I intentionally didn't review my code to thoroughly and just blindly submitted what was spit out.

#### Iteration 1

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

#### Iteration 2

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

#### Iteration 3

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

### Part Two

I almost stopped here because I figured I'd need some kind of sort algorithm to do this nicely.  Sometimes my favorite part of writing C code is it forces you to be a bit scrappier.  Since we only need the top 3, it's not unreasonable to just manually handle the sorting algorithm.  When a new sum is calculated for an elf, we compare it against `max1` to see if this new sum is the largest we've seen yet.  If it is, we swap the existing `max1` to `max2` and set `max1` to the new max.

The code below managed to work for the submission, but is actually not 100% correct.  Walking through the following example we can see why:

```
1

2

3

4
```

```
max1: 1
max2: 0
max3: 0

max1: 2
max2: 1
max3: 0

max1: 3
max2: 2
max3: 0

max1: 4
max2: 3
max3: 0
```

The max1 conditional fails to swap `max2` with `max3`.  I don't feel like walking through the test data to see why the code below works, but I imagine the top 3 sums happen to appear in just the right order to ensure this problem is averted.

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
  FILE * fp = fopen ("input.txt", "r");

  char ch;
  char buffer[6];
  int pos = 0;

  int max1 = 0;
  int max2 = 0;
  int max3 = 0;

  int currentElfCalories = 0;
  while((ch = getc(fp)) != EOF)
  {
    if (ch == '\n') {
      if (pos != 0) {
        int calories;
        sscanf(buffer, "%d", &calories);
        memset(buffer, 0, sizeof(buffer));

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > max1) {
          max2 = max1;
          max1 = currentElfCalories;
        } else if (currentElfCalories > max2) {
          max3 = max2;
          max2 = currentElfCalories;
        } else if (currentElfCalories > max3) {
          max3 = currentElfCalories;
        }
        currentElfCalories = 0;
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  } 

  printf("%d", max1 + max2 + max3);
  
  return 0;
}
```

## Closing Thoughts

Despite trying to intentionally set myself up for a pretty classic C buffer failure in part one, I managed to accidentally land on a separate C string issue.

The C-haters will take this as evidence that C is bad, but let's keep in mind that I am by no means a professional C programmer.  Throughout this advent of code, I'd like to see if reflecting on these kinds of errors and learning from them can lead to coding patterns that eliminates these altogether.

In part two, I got the correct answer with flawed code.  This is just yet another example of how deceiving any code can be.  Languages and tools can help us, but I would argue we need to remain vigilant and alert at all times while coding.  This error here is non-critical as it is part of just programming for fun, but perhaps this was the code that determined the top 3 winners and automatically deposited funds to the detected winners.  A potential rightful winner may have been missed due to this error.

I'm already seeing how this Advent of Code is a great oppurtunity to incrementally build some helper functions and data structures as they become useful.  Thankfully, I was able to avoid them here and keep things pretty plain C.  I have been wanting to build a Vector in C and also a HashMap, both of which will probably be quite useful in future coding challenges.

## Addendum: Performance

Out of curiousity I wanted to compare runtime performance of different solutions. C might be "fast", but for problems like this one, usually it's the algorithm you choose that is most important. I compared my programs runtime with a JS one and a Rust one. The JS and Rust ones were not written by me, so it would be interesting to write these ones out following roughly the same algorithm to make this more of a fair comparison.

### C Changes

#### sscanf is slow

The JS solution ended up having a faster runtime than my C program which I knew meant something obvious was slowing my program down.  I ended up rewriting the file reading code as I suspected this was the issue.  I believe this still helped, but the final culprit ended up be `sscanf`.  Once I made these couple of changes my average run time dropped to around 120 microseconds.

There's likely a few more tricks that could be employed to speed things up further, but I like that the code is pretty straightforward C code.  

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>

struct String {
  char *data;
  int length;
  int size;
} typedef String;

int main() {
  struct timeval st, et;

  gettimeofday(&st,NULL);

  FILE * fp = fopen ("input.txt", "r");

  String contents;

  contents.length = 0;
  contents.size = 10375;
  contents.data = malloc(contents.size);

  int num_read = fread(contents.data, 1, contents.size - contents.length, fp);
  contents.length = num_read;

  printf("%d\n", contents.length);

  gettimeofday(&et,NULL);
  int elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  printf("Read: %d micro seconds\n", elapsed);

  int total_elapsed = elapsed;

  gettimeofday(&st,NULL);

  char buffer[6];
  int pos = 0;

  int max1 = 0;
  int max2 = 0;
  int max3 = 0;

  int currentElfCalories = 0;
  for (int i = 0; i < contents.length; i++)
  {
    char ch = contents.data[i];

    if (ch == '\n') {
      if (pos != 0) {
        buffer[pos] = 0;
        int calories = atoi(buffer);

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > max1) {
          max2 = max1;
          max1 = currentElfCalories;
        } else if (currentElfCalories > max2) {
          max3 = max2;
          max2 = currentElfCalories;
        } else if (currentElfCalories > max3) {
          max3 = currentElfCalories;
        }
        currentElfCalories = 0;
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  }

  gettimeofday(&et,NULL);
  elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  printf("Part 2: %d micro seconds\n",elapsed);

  total_elapsed += elapsed;
  printf("Total: %d micro seconds\n", total_elapsed);

  printf("%d", max1 + max2 + max3);
  
  return 0;
}
```

#### `fread` is slow

Moderately happy with performance I moved on to rewriting the rust solution to have a better comparison.  I added timings on the file read there and found it was taking roughly half as long as my C version (40 microseconds vs. about 80).  Not to be outdone, I did some googling for faster file reading mechanisms.

I ended up switching to `mmap` and now see about 20-30 microseconds to read the file.  That's better!

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/time.h>

struct String {
  char *data;
  int length;
  int size;
} typedef String;

int main() {
  struct timeval st, et;

  gettimeofday(&st,NULL);

  int fd = open("input.txt", O_RDONLY);

  struct stat statbuf;
  int err = fstat(fd, &statbuf);

  char *ptr = mmap(NULL,statbuf.st_size,
            PROT_READ,MAP_SHARED,
            fd,0);

  gettimeofday(&et,NULL);
  int elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  printf("Read: %d micro seconds\n", elapsed);

  int total_elapsed = elapsed;

  gettimeofday(&st,NULL);

  char buffer[6];
  int pos = 0;

  int max1 = 0;
  int max2 = 0;
  int max3 = 0;

  int currentElfCalories = 0;
  for (int i = 0; i < statbuf.st_size; i++)
  {
    char ch = ptr[i];

    if (ch == '\n') {
      if (pos != 0) {
        buffer[pos] = 0;
        int calories = atoi(buffer);

        currentElfCalories += calories;

        pos = 0;
      } else {
        if (currentElfCalories > max1) {
          max2 = max1;
          max1 = currentElfCalories;
        } else if (currentElfCalories > max2) {
          max3 = max2;
          max2 = currentElfCalories;
        } else if (currentElfCalories > max3) {
          max3 = currentElfCalories;
        }
        currentElfCalories = 0;
      }
      
    } else {
      buffer[pos] = ch;
      pos++;
    }
  }

  gettimeofday(&et,NULL);
  elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  printf("Part 2: %d micro seconds\n",elapsed);

  total_elapsed += elapsed;
  printf("Total: %d micro seconds\n", total_elapsed);

  printf("%d", max1 + max2 + max3);

  munmap(ptr, statbuf.st_size);
  close(fd);
  
  return 0;
}
```

### JavaScript

I wasn't sure what I expected to see when comparing my basic C solution to a JS solution that I pulled off the [Reddit submissions megathread](https://www.reddit.com/r/adventofcode/comments/z9ezjb/comment/iyh1ocu/?utm_source=share&utm_medium=web2x&context=3).  

I'd like to a more thorough deep dive, but the short version is that the following Node.js version came in at 565 microseconds vs. ~734 microseconds from my c program.  Interestingly, the Node.js timings seems quite consistent, whereas the C ones varied from 384 up to 2000, but generally hovered in the 700 ms range.

This most likely identifies that the file reading logic is inefficient.  It reads a single character at a time and then performs a small amount of processing whereas the JS version loads the entire file into memory first and then operates on it.  

```js
// Adapted from https://www.reddit.com/r/adventofcode/comments/z9ezjb/comment/iyh1ocu/?utm_source=share&utm_medium=web2x&context=3
const fs = require('fs');

const start = process.hrtime.bigint();

const data = fs.readFileSync('input.txt');

let [first, second, third] = String(data).replace(/(.*)(\r\n|\n|\r)/gm, '$1,').split(',,').map(elf => {
  return elf.split(',').reduce((prev, next) => prev + Number(next), 0)
}).sort((a,b) => b -a);

const end = process.hrtime.bigint();

// 571958n
console.log(end - start);

console.log(first + second + third);
```

### Rust

When I first saw the solution below I thought the `include_str!` was going to be severe cheating.  If I'm understanding correctly, this tells the compiler to embed the string in the output.  I figured most of the time delay was actually just reading the file from the file system.  When this still clocked in around 700 microseconds, I was puzzled.  

However, I suspected that `cargo run` was not running a release build.  Switching to `cargo build --release` brought me closer to what I expected.  64-120 microseconds.  For simplicity sake, I'll say that is is 5 times faster than the JavaScript implementation.  Unfortunately, as mentioned above, it's certainly cheating to not have to read the file from disk.  

```rust
// https://www.reddit.com/r/adventofcode/comments/z9ezjb/comment/iyk2rga/?utm_source=share&utm_medium=web2x&context=3
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
  let start = SystemTime::now();

  let mut input: Vec<usize> = include_str!("input.txt")
      .split("\n\n")
      .map(|b|
          b.lines()
              .map(|i| i.parse::<usize>().unwrap())
              .sum()
      )
      .collect();
      
  input.sort();
  input.reverse();
  input.truncate(3);
  let sum:usize = input.iter().sum();

  let since_the_epoch = SystemTime::now()
    .duration_since(start)
    .expect("Time went backwards");
  
  println!("{:?}", since_the_epoch);

  println!("sum {}", sum);
}
```

#### Rust Read From Disk

After updating the above code to read from disk, I ended up with a 160-180 microsecond run time, or a roughly 3 times speed up from the Node.JS version.

Conceptually speaking, the Rust code and JavaScript code are manipulating the data pretty similarly.  I'm sure there's room to optimize both, but I feel like this it seems reasonably fair to claim that for this solution Rust is running roughly 3x as fast as the JavaScript one.

### Performance Takeaways

My main takeaway for tomorrow's challenge is that I need to improve my file reading.  I intentionally avoided reading the entire file at once for this one because this requires generating a buffer with enough space allocated.  Higher level languages abstract these concepts away, but I find it interesting to have more direct access to how the file loading is actually performed.
