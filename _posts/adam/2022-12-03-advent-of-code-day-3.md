---
layout: post
title:  "2022 Advent of Code Day 3: Rucksack Reorganization"
permalink: /@adam/advent-of-code/2022/day/3
image: 
author: adam
description:
tags: dev advent-of-code-2022
---

This one took me a bit longer as I played around with naming conventions and what I wanted out of a string library.

I'm probably more focused on the actual function names instead of actual optimization at the moment.  As long as I create the functions I need, it should always be possible to improve how they work internally.

I'm attempting to hide away any raw array access inside this library.  As this gets a bit more built it, this should allow checking how much runtime bounds checking would actually cost.

I would guess that relative to the speed performance of using C, the runtime bounds checking probably does not substantially impact the performance of the code (especially when compared with a non-compiled language).

I'd also love to explore the runtime [sanitizers that exist in LLVM](https://github.com/google/sanitizers), though I'd imagine using these would require knowing how to create the condition that causes the buffer overflow.  

## Final Solution

```c
// str.h
#ifndef _STR_H_
#define _STR_H_

#include <stddef.h>
#include <stdbool.h>
#include <stdarg.h>
#include <string.h>

typedef struct str_t
{
  char *data;
  size_t length;
  size_t capacity;
} str_t;

str_t *str_new(size_t capacity);
str_t *str_from_c_str(const char *c_str);
void str_clear(str_t *str);
void str_append_char(str_t *str, char c);
char str_char_at(str_t *str, size_t index);
void str_set_char_at(str_t *str, size_t index, char c);
void str_free(str_t *str);
#endif
```

```c
#include "str.h"
#include <stdio.h>
#include <stdlib.h>

str_t *str_new(size_t capacity)
{
  str_t *str = malloc(sizeof(str_t));

  str->length = 0;
  str->capacity = capacity;
  str->data = malloc(capacity);

  return str;
}

str_t *str_from_c_str(const char *c_str)
{
  int len = strlen(c_str);

  str_t *str = malloc(sizeof(str_t));
  str->length = len;
  str->capacity = len;
  str->data = malloc(len);

  for (int i = 0; i < len; i++) {
    str->data[i] = c_str[i];
  }

  return str;
}

void str_clear(str_t *str) {
  str->length = 0;
}

void str_append_char(str_t *str, char c) {
  if (str->length >= str->capacity - 1)
  {
    return;
  }
  str->data[str->length] = c;
  str->length++;
}

char str_char_at(str_t *str, size_t index)
{
  if (index >= str->length || index < 0)
  {
    return 0;
  }
  return str->data[index];
}

void str_set_char_at(str_t *str, size_t index, char c) {
  if (index >= str->length || index < 0)
  {
    return;
  }

  str->data[index] = c;
}

void str_free(str_t *str)
{
  free(str->data);
  free(str);
}
```

```c
// main.c
#include "str.h"
#include <stdio.h>
#include <stdlib.h>

str_t *str_new(size_t capacity)
{
  str_t *str = malloc(sizeof(str_t));

  str->length = 0;
  str->capacity = capacity;
  str->data = malloc(capacity);

  return str;
}

str_t *str_from_c_str(const char *c_str)
{
  int len = strlen(c_str);

  str_t *str = malloc(sizeof(str_t));
  str->length = len;
  str->capacity = len;
  str->data = malloc(len);

  for (int i = 0; i < len; i++)
  {
    str->data[i] = c_str[i];
  }

  return str;
}

void str_clear(str_t *str)
{
  str->length = 0;
}

void str_append_char(str_t *str, char c)
{
  if (!str)
  {
    printf("NULL String\n");
    return;
  }

  if (str->length >= str->capacity - 1)
  {
    return;
  }
  str->data[str->length] = c;
  str->length++;
}

char str_char_at(str_t *str, size_t index)
{
  if (index >= str->length || index < 0)
  {
    return 0;
  }
  return str->data[index];
}

void str_set_char_at(str_t *str, size_t index, char c)
{
  if (index >= str->length || index < 0)
  {
    return;
  }

  str->data[index] = c;
}

void str_free(str_t *str)
{
  free(str->data);
  free(str);
}
```
