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
- Add a header
- Move the text input to the bottom of the page
- Update the Submit button styling
- Update the styling of individual notes

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
            text-align: center;
            font-size: 36px;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
            color: white;
        }
    &lt;/style&gt;</span>
&lt;/head&gt;

&lt;body&gt;
    <span class="add">&lt;header&gt;Notes&lt;/header&gt;</span>
    &lt;input id=&quot;input&quot;/&gt;
    &lt;button id=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    &lt;div id=&quot;notes&quot;&gt;&lt;/div&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>

![](/assets/css-intro-01.png)

## Fixing Default Browser Styles

![](/assets/css-intro-02.png)

## Move the Text Input to the Bottom of the Page


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