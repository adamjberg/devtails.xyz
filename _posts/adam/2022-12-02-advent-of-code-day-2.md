---
layout: post
title:  "2022 Advent of Code Day 2: Rock Paper Scissors"
permalink: /@adam/advent-of-code/2022/day/2
image: 
author: adam
description:
tags: dev advent-of-code-2022
---

For day 2, I started exploring what I would like my own String library to look like.  Despite knowing what would need to be done, I've never really built a resizeable string in c. 

I tried to contain my changes to just what was needed.  By coincidence, I stumbled on a [C string library](https://news.ycombinator.com/item?id=33842981) post on HackerNews after completing this challenge.  

As usual, the comments section is spread from "love it" to "hate it".  Regardless, it was a useful thread to see different arguments about string libraries in general and common complaints.

In this puzzle, I mostly just focused on the struct.  You can see the initialization code duplicated twice across the two parts.  

As mentioned in my [day 1](/@adam/advent-of-code/2022/day/1) post, I am playing around with a slight focus on memory safety.  In the solution below, I still have raw array accesses.  After a few manual combs of the code, I can't see any possible buffer overruns.

It might be interesting to do a future advent of code puzzle in Rust to see if I ever run in to a memory safety error that is detected by the compiler.

## Final Solution

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

int partOne(String *contents) {
  int score = 0;
  for (int i = 0; i < contents->length; i += 4) {
    char opponent_char = contents->data[i];
    char my_char = contents->data[i + 2];

    int opponent_move_val = opponent_char - 'A' + 1;
    int my_move_val = my_char - 'X' + 1;

    score += my_move_val;

    // DRAW
    if (opponent_move_val == my_move_val) {
      score += 3;
    }
    if (opponent_char == 'A') {
      if (my_char == 'Y') {
        score += 6;
      }
    }
    if (opponent_char == 'B') {
      if (my_char == 'Z') {
        score += 6;
      }
    }
    if (opponent_char == 'C') {
      if (my_char == 'X') {
        score += 6;
      }
    }
  }

  return score;
}

int partTwo(String *contents) {
  int score = 0;
  for (int i = 0; i < contents->length; i += 4) {
    char opponent_char = contents->data[i];
    char my_char = contents->data[i + 2];

    int opponent_move_val = opponent_char - 'A' + 1;
    int my_move_val = 0;

    if (my_char == 'X') {
      if (opponent_char == 'A') {
        score += 3;
      } else if (opponent_char == 'B') {
        score += 1;
      } else {
        score += 2;
      }
    } else if (my_char == 'Y') {
      score += 3;

      if (opponent_char == 'A') {
        score += 1;
      } else if (opponent_char == 'B') {
        score += 2;
      } else {
        score += 3;
      }
    } else if (my_char == 'Z') {
      score += 6;

      if (opponent_char == 'A') {
        score += 2;
      } else if (opponent_char == 'B') {
        score += 3;
      } else {
        score += 1;
      }
    }
  }

  return score;
}

int main() {
  int total_elapsed = 0;

  struct timeval st, et;
  gettimeofday(&st,NULL);
  FILE *fp = fopen("input.txt", "r");
  String contents;

  contents.length = 0;
  contents.size = 10000;
  contents.data = malloc(contents.size);

  int num_read = fread(contents.data, 1, contents.size - contents.length, fp);
  contents.length = num_read;

  gettimeofday(&et,NULL);
  int elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  total_elapsed += elapsed;
  printf("Read: %d micro seconds\n",elapsed);

  
  printf("%d\n", partOne(&contents));
  gettimeofday(&et,NULL);
  elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  total_elapsed += elapsed;
  printf("Part One: %d micro seconds\n",elapsed);

  gettimeofday(&st,NULL);
  printf("%d\n", partTwo(&contents));
  gettimeofday(&et,NULL);
  elapsed = ((et.tv_sec - st.tv_sec) * 1000000) + (et.tv_usec - st.tv_usec);
  printf("Part Two: %d micro seconds\n",elapsed);

  total_elapsed += elapsed;

  printf("Total: %d micro seconds", total_elapsed);
}
```
