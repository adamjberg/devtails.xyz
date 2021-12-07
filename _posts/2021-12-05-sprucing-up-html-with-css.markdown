---
layout: post
title:  "Sprucing up HTML With Cascading Style Sheets (CSS)"
permalink: /sprucing-up-html-with-css
tags: learntocode assignment web css
---

## Pre-Requisites
- [Adding Interactivity to HTML With JavaScript](/adding-interactivity-to-html-with-javascript)

## Assignment Summary

So far, you have created an application that allows the user to input a note and displays all past notes. There has been very little focus on the design of the user interface. In this assignment, you will use CSS to make the application more visually appealing and functional.

In this assignment you will:
- Learn what Cascading Style Sheets are
- Add a header
- Load an Image
- Style the text input
- Style the submit button
- Style the notes

## Intro to Cascading Style Sheets

This is a topic better covered on places like [w3schools](https://www.w3schools.com/css/css_intro.asp) and [MDN Wed Docs](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS). It's worth giving those a quick read if you are unfamiliar with CSS. Put very simply, CSS styles allow you to control how elements on a page are displayed. Page layout, colors, fonts, sizing, and many more can be modified using CSS.

There is a lot of depth to CSS. This assignment will focus solely on creating specific designs. I highly recommend learning the different properties available in CSS as you realize you need them - instead of attempting to memorize everything available.  You will quickly see which ones are re-used often and spend more time working with those.

Final side note before we begin: I am not a designer nor a CSS master. The final user interface (UI) of this assignment is mostly used to introduce and demonstrate key concepts. In doing so, you will see some of the most common CSS properties and how they work. You are welcome and encouraged to vary the styling from what you see presented here.

## Adding a Header

It is common for websites and applications to have a header bar that helps brand the page. Usually it has some kind of color associated with your brand and the name of the product. You are welcome to choose your own app name and color. This project is based on my current project [engram](https://engramhq.xyz), so I will use this name and its primary color #3f51b5.

<pre>
&lt;html lang=&quot;en&quot;&gt;

&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Notes&lt;/title&gt;
    &lt;script&gt;
        window.onload = function () {
            var submitBtn = document.getElementById("submit");
            var inputElement = document.getElementById("input");
            var notesElement = document.getElementById("notes");

            submitBtn.addEventListener("click", function () {
                var div = document.createElement("div");
                div.innerText = inputElement.value;
                notesElement.appendChild(div);

                inputElement.value = "";
            });
        }
    &lt;/script&gt;
    <span class="add">&lt;style&gt;
        header {
            background-color: #3f51b5;
            height: 64px;
        }
    &lt;/style&gt;</span>
&lt;/head&gt;

&lt;body&gt;
    <span class="add">&lt;header&gt;&lt;/header&gt;</span>
    &lt;input id=&quot;input&quot;/&gt;
    &lt;button id=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    &lt;div id=&quot;notes&quot;&gt;&lt;/div&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>

The [`<style>` tag](https://www.w3schools.com/tags/tag_style.asp) allows you to define the CSS for the current document. 

The `header` part specifies that the text between the `{` and the `}` should be applied to all element tags called `header`.

`background-color` sets the background color of the element. CSS allows [several ways to specify colors](https://www.w3schools.com/colors/default.asp). Until you need the others, I recommend sticking with "hexadecimal" colors. 

`height` allows you to specify how many pixels tall the element should be.

![](/assets/img/css-intro/css-intro-01.png)

### Fixing Default Browser Styles

You should now see that the header isn't at the top of the page and doesn't expand fully to the left and right edges.  This is due to browsers having a "user agent stylesheet".

![](/assets/img/css-intro/css-intro-02.png)

If you open the Developer Tools and select the `<body>` element you'll see it has `margin: 8px` set by default. There are quite a few default styles applied to different HTML elements. In this assignment, we will manually reset any of these as it becomes necessary.

See this summary of the [CSS margin property](https://www.w3schools.com/css/css_margin.asp). The margin property is used to create space around elements.

<pre>
&lt;style>
<div class="add">    body {
        margin: 0;
    }</div>
    header {
      background-color: #3f51b5;
      height: 64px;
    }
&lt;/style>
</pre>

This removes any margins from the body element and then you can see it looks as it should.

![](/assets/img/css-intro/css-intro-03.png)

### Adding an Image to the Page

Images are one of the fundamental building blocks of a web site. Adding one is as simple as using the [`<img>` tag](https://www.w3schools.com/tags/tag_img.asp). 

The image we will be adding is a logo in the center of the header. Below is the current engram logo that you can right click and download, or you can use any other image you like.

![](/assets/img/css-intro/logo.png)

<pre>
&lt;header>
<span class="add">    &lt;img src="img/logo.png" width="48px" height="48px" /></span>
&lt;/header>
</pre>

![](/assets/img/css-intro/css-intro-04.png)

Our logo now shows up inside the header with a height and width of 48px.  Unfortunately, it's postioned incorrectly.

HTML Elements, by default, are positioned from top to bottom and left to right. 

In order to center it, we will use the [CSS Flexbox Module](https://www.w3schools.com/css/css3_flexbox.asp). This is a very powerful layout tool within CSS. It is worth giving that entire chapter a read to get introduced to some of the different kinds of things flexbox allows you to do.

<pre>
header {
    background-color: #3f51b5;
    height: 64px;
<span class="add">    display: flex;
    align-items: center;
    justify-content: center;</span>
}
</pre>

`display: flex;` tells the element to render with the flex layout. `align-items: center;` vertically aligns the image inside the header. `justify-content: center;` horizontally centers the image inside the header element. Try removing and re-adding each of these to see how this affects the rendering of the element.

![](/assets/img/css-intro/css-intro-05.png)

Centering content horizontally and vertically with CSS is often used as an interview question to determine whether someone has a firm grasp of CSS concepts. Prior to flexbox, it was a bit more difficult, but hopefully you can appreciate how simple the 3 lines of CSS above are.

And with that we have successfully completed our header.

## Move the Text Input to the Bottom of the Page

Now that we have introduced the `display: flex`, we will use it again to split the page into three main sections: header, content, and footer. The content will include the list of notes and the footer will have the text input fixed to the bottom of the page (much like the text box seen on most messaging apps).

<pre>
&lt;style>
    body {
      margin: 0;
    }

<span class="add">    #app {
      display: flex;
      flex-direction: column;
      height: 100%;
    }</span>

    header {
      background-color: #3f51b5;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

<span class="add">    #content {
      flex-grow: 1;
    }</span>
&lt;/style>

&lt;body>
<span class="add">  &lt;div id="app"></span>
    &lt;header>
      &lt;img src="img/logo.png" width="48px" height="48px" />
    &lt;/header>
<span class="add">    &lt;div id="content">
      &lt;div id="notes">&lt;/div>
    &lt;/div>
    &lt;div id="bottom-bar">
      &lt;input id="input" />
      &lt;button >Submit&lt;/button>
    &lt;/div>
  &lt;/div></span>
&lt;/body>
</pre>

The `#` is used to select an element by id in CSS. `#app` will thus tell the browser to apply the contained styles to the element with id `app`. `flex-direction: column;` specifies to render the component in a column (from to bottom) instead of the row default (left to right). `height: 100%;` makes it fill the entire available space.

The `flex-grow: 1;` for `#content` specifies that the #content element should grow to fill the remaining space between the header and the footer. 


![](/assets/img/css-intro/css-intro-06.png)
<figcaption>Text Input Now at Bottom of Page</figcaption>

## Styling the Text Input

<pre>
&lt;style>
    body {
      margin: 0;
    }

    #app {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    header {
      background-color: #3f51b5;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #content {
      flex-grow: 1;
    }

<span class="add">    #bottom-bar {
      background-color: #424242;
    }

    .input-wrapper {
      display: flex;
      padding: 16px 8px;
    }

    #bottom-bar input {
      flex-grow: 1;
      background-color: transparent;
      border: none;
      border-bottom: 1px white solid;
      color: white;
    }

    #bottom-bar input:focus-visible {
      border-bottom: 1px #3f51b5 solid;
      outline: none;
    }</span>
&lt;/style>

&lt;body>
  &lt;div id="app">
    &lt;header>
      &lt;img src="img/logo.png" width="48px" height="48px" />
    &lt;/header>
    &lt;div id="content">
      &lt;div id="notes">&lt;/div>
    &lt;/div>
    &lt;div id="bottom-bar">
      <span class="add">&lt;div class="input-wrapper">
        &lt;input id="input" />
        &lt;button >Submit&lt;/button>
      &lt;/div></span>
    &lt;/div>
  &lt;/div>
&lt;/body>
</pre>

![](/assets/img/css-intro/css-intro-07.png)

`#bottom-bar` simply gets a background-color attached to it.

`.input-wrapper` demonstrates a common HTML/CSS pattern where you "wrap" some inner elements in an additional div to provide some styling. In this case we add `display: flex` which will allow us to make the input take up as much horizontal space as possible.

`#bottom-bar input` is a new type of selector. These styles will only affect input elements that are a child of the element with an id of "bottom-bar".   `flex-grow: 1` causes it to grow horinzontally to fill in is `.input-wrapper` parent. `background-color: transparent` removes the default white background on the input field, making it blend in more with the background.  `border: none` removes the default border added all around input elements. `border-bottom: 1px white solid` adds a solid white border to just the bottom of the element with 1px thickness. `color: white` modifies the text so that the text a user inputs displays as white.

`#bottom-bar input:focus-visible` introduces one more concept with selectors: [psuedo-classes](https://www.w3schools.com/css/css_pseudo_classes.asp). Psuedo-classes are used to define a special state of an element. In this case, the psuedo-class is "focus-visible".  This is a special state the browser assigns to an element when the user has "focused" on it. By default, this is often a blue border around an element. In this example we use it to change the color of the bottom border. `border-bottom: 1px #3f51b5 solid` specifies a solid 1px wide bottom border with the hex color #3f51b5. It's important to note that this style will override the border-bottom that was already set on this element in the previous selector. 

![](/assets/img/css-intro/css-intro-08.png)

In the image above you can see that the developer tools shows the first `border-bottom` property stricken through. A single property can only be set once in CSS and if multiple selectors match an element the "most specific" selector will be used.  In this case the pseudo-class selector is more specific.

`outline: none` removes the default blue outline that should around focused elements. And with that, try out the input and see how it changes color when clicking on it and away from it (you can also use tab to focus on it). 


## Final Code

<pre>
&lt;html lang="en"&gt;

&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;Notes&lt;/title&gt;
    &lt;script&gt;
        window.onload = function () {
            var submitBtn = document.getElementById("submit");
            var inputElement = document.getElementById("input");
            var notesElement = document.getElementById("notes");

            submitBtn.addEventListener("click", function () {
                var div = document.createElement("div");
                div.innerText = inputElement.value;
                notesElement.appendChild(div);

                inputElement.value = "";
            });
        }
    &lt;/script&gt;
    &lt;style&gt;
        body {
            margin: 0;
            background-color: #303030;
            font-family: 'Courier New', Courier, monospace;
        }

        header {
            background-color: #3f51b5;
            text-align: center;
            font-size: 36px;
            font-weight: bold;
            color: white;
            height: 64px;
            line-height: 64px;
        }

        .container {
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
        }

        #bottom-bar {
            position: absolute;
            bottom: 0;
            width: 100%;
            background-color: #424242;
        }

        .input-wrapper {
            display: flex;
            padding: 16px 8px;
        }

        #bottom-bar input {
            flex-grow: 1;
            background-color: transparent;
            border: none;
            border-bottom: 1px white solid;
            color: white;
        }

        #bottom-bar input:focus-visible {
            border: none;
            border-bottom: 1px #3f51b5 solid;
            outline: none;
        }

        #bottom-bar button {
            margin-left: 8px;
        }
    &lt;/style&gt;
&lt;/head&gt;

&lt;body&gt;
    &lt;header&gt;Notes&lt;/header&gt;
    &lt;div id="notes"&gt;&lt;/div&gt;
    &lt;div id="bottom-bar"&gt;
        &lt;div class="container"&gt;
            &lt;div class="input-wrapper"&gt;
                &lt;input id="input"/&gt;
                &lt;button id="submit"&gt;Submit&lt;/button&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>