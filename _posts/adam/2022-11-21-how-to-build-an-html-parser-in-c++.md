---
layout: post
title:  "How to Build an HTML Parser in C++"
permalink: /@adam/how-to-build-an-html-parser-in-c++
image: assets/img/html-parser-c++.png
author: adam
description: Step by step instructions for implementing a basic html parser in c++
tags: dev
---

![](/assets/img/html-parser-c++.png)

## Intro

I've started [building a web browser](https://devtails.xyz/@adam/building-a-web-browser-with-sdl-in-c++) and initially set it up with a relatively hacky regex to "parse" the HTML.  This had no regard for nested structures and very likely had all kinds of other issues.  

The google search results for "build html parser in c++" turn up only [one tutorial](https://www.geeksforgeeks.org/html-parser-in-c-cpp/) that only covers parsing one line of html at a time.  I would probably like to make some modifications to what I have as I get a bit further into this project, but at the moment the code below has served my basic needs.

## Final Product

I find it helpful to see everything at once to get a broad view of how everything comes together.  The following sections will break it down a bit further.

```cpp
#include <string>
#include <vector>
#include <cassert>

using namespace std;

class HTMLElement
{
public:
  string tagName;
  vector<struct HTMLElement *> children;
  struct HTMLElement *parentElement;
  string textContent;
};

enum State
{
  STATE_INIT,
  STATE_START_TAG,
  STATE_READING_TAG,
  STATE_READING_ATTRIBUTES,
  STATE_END_TAG,
  STATE_BEGIN_CLOSING_TAG
};

bool isWhitespace(char c)
{
  return c == ' ';
}

HTMLElement *HTMLParser(string input)
{
  HTMLElement *root = new HTMLElement();

  State state = STATE_INIT;
  HTMLElement *lastParent = root;
  string tagName = "";

  for (auto c : input) {
    if (c == '<') {
      state = STATE_START_TAG;
    } else if (state == STATE_START_TAG) {
      if (c == '/') {
        state = STATE_BEGIN_CLOSING_TAG;
      } else if (!isWhitespace(c)) {
        state = STATE_READING_TAG;
        tagName = c;
      }
    } else if (state == STATE_READING_TAG) {
      if (isWhitespace(c)) {
        state = STATE_READING_ATTRIBUTES;
      } else if(c == '>') {
        state = STATE_END_TAG;

        auto parent = new HTMLElement(); 
        parent->tagName = tagName;
        parent->parentElement = lastParent;

        lastParent->children.push_back(parent);
        lastParent = parent;
      } else {
        tagName += c;
      }
    } else if(state == STATE_READING_ATTRIBUTES) {
      if (c == '>') {
        state = STATE_END_TAG;

        auto parent = new HTMLElement(); 
        parent->tagName = tagName;
        parent->parentElement = lastParent;

        lastParent->children.push_back(parent);
        lastParent = parent;
      }
    } else if (state == STATE_END_TAG) {
      lastParent->textContent += c;
    } else if (state == STATE_BEGIN_CLOSING_TAG) {
      if (c == '>') {
        lastParent = lastParent->parentElement;
      }
    }
  }

  return root;
}

int main()
{
  HTMLElement *el = HTMLParser("<h1>Hello World!</h1>");

  assert(el->children.size() == 1);

  return 0;
}
```

## HTMLElement

I've followed the property naming conventions of the [DOM Element](https://www.w3schools.com/jsref/dom_obj_all.asp). This should make it look familiar if you are used to working with the DOM in JavaScript.  This process also helped me understand how some of these properties work on DOM elements.

```cpp
class HTMLElement
{
public:
  string tagName;
  vector<struct HTMLElement *> children;
  struct HTMLElement *parentElement;
  string textContent;
};
```

## State Machine

Like I said at the beginning, I didn't really find a good resource to work off of, so ended up charting the course myself. A state machine ended up being the simplest way for me to visualize and work with.  I wanted to walk through the html text a single character at a time. The state machine allowed the code to keep track of where in the parsing process it was and (at least to me) makes it easier to understand what's happening.

```cpp
enum State
{
  STATE_INIT,
  STATE_START_TAG,
  STATE_READING_TAG,
  STATE_READING_ATTRIBUTES,
  STATE_END_TAG,
  STATE_BEGIN_CLOSING_TAG
};
```

### STATE_INIT
  ```cpp
  // Detects when a new html tag has begun (whenever "<" is detected we enter this state)
  if (c == '<') {
    state = STATE_START_TAG;
  }
  ```
### STATE_START_TAG
  ```cpp
  if (state == STATE_START_TAG) {
    // Ignore any whitespace characters until we hit a real character
    if (!isWhitespace(c)) {
      state = STATE_READING_TAG;
      tagName = c;
    }
  }
  ```
### STATE_READING_TAG
  ```cpp
  // Once we have detected the start of a tag, we proceed to read any characters that follow and this forms the `tagName` property
  if (state == STATE_READING_TAG) {
    // Once we hit a whitespace character we transition to STATE_READING_ATTRIBUTES
    if (isWhitespace(c)) {
      state = STATE_READING_ATTRIBUTES;
    }
    // If we hit a > this indicates that we're done reading the start of the tag, so we create a new HTMLElement with the tagName we read 
    else if(c == '>') {
      state = STATE_END_TAG;

      auto parent = new HTMLElement(); 
      parent->tagName = tagName;
      parent->parentElement = lastParent;

      lastParent->children.push_back(parent);
      lastParent = parent;
    } else {
      tagName += c;
    }
  }
  ```
### STATE_READING_ATTRIBUTES
  ```cpp
  // [TODO] I've avoided actually reading attributes for now
  if(state == STATE_READING_ATTRIBUTES) {
    // For now, it is good enough to move to STATE_END_TAG once a ">" is detected
    if (c == '>') {
      state = STATE_END_TAG;

      auto parent = new HTMLElement(); 
      parent->tagName = tagName;
      parent->parentElement = lastParent;

      lastParent->children.push_back(parent);
      lastParent = parent;
    }
  }
  ```
### STATE_END_TAG
  ```cpp
  // This state will be exited when the next "<" is detected and we return to STATE_START_TAG
  if (state == STATE_END_TAG) {
    // Once in this state, we extract any characters into the `textContent` property
    lastParent->textContent += c;
  }
  ```
### STATE_START_TAG
  ```cpp
  // At this point, the html is either closing out a tag or starting a new nested element
  if (state == STATE_START_TAG) {
    // If it's closing one, the "/" character moves us to STATE_BEGIN_CLOSING_TAG
    if (c == '/') {
      state = STATE_BEGIN_CLOSING_TAG;
    } 
    // If it's not a closing tag, the process begins and we start reading a new html element with the previous node as the `parentElement`
    else if (!isWhitespace(c)) {
      state = STATE_READING_TAG;
      tagName = c;
    }
  }
  ```
### STATE_BEGIN_CLOSING_TAG
  ```cpp
  if (state == STATE_BEGIN_CLOSING_TAG) {
    // When a tag has been closed, we set the `lastParent` to its parent
    if (c == '>') {
      // This ensures each sibling gets the correct `parentElement` attached
      lastParent = lastParent->parentElement;
    }
  }
  ```

## Conclusion

There are probably several cases this doesn't work for.  However, using this starting point, it should be fairly easy to identify what needs to be added to fix issues as they come up.

I've replaced the regex version of this in my browser with this, and so far it appears to be working as expected.