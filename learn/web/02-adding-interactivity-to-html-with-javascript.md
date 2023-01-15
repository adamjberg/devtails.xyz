---
layout: post
title: "Adding Interactivity to HTML With JavaScript"
---

## Pre-Requisites

[How to Build Your First HTML Page](/learn/web/01-how-to-build-first-html-page)

## Summary

We will be adding the ability to gather input from a web page. After a user types a note into the text input, they can then press a "Submit" button and see their note added to the page.

## Adding an `<input>`

- Replace `h1` with an `input` element

<pre>
&lt;html lang=&quot;en&quot;&gt;
&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Notes&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    <span class="del">&lt;h1&gt;Hello World&lt;/h1&gt;</span>
    <span class="add">&lt;input/&gt;</span>
&lt;/body&gt;
&lt;/html&gt;
</pre>

If you open the `index.html` file again, (alternatively if it's already open you can just refresh the page) you can see the input element in the top left of the page. You can click into it and type to your hearts content.

![](/assets/js-intro-01.png)

## Adding a Submit Button

Below the input tag, insert the following:

```
<button>Submit</button>
```

Refresh the page and you should see a button with the text "Submit" on the page.

![](/assets/js-intro-02.png)

## Responding to a Click

In order to perform some action when the user clicks the Submit button, we must add some scripting code to to web page. This is where [JavaScript](https://en.wikipedia.org/wiki/JavaScript) comes in. All major browsers have a "JavaScript engine" that executes the code on the user's device.

### Finding the Submit Button

For the most part, the JS code that you write for the browser will be triggered by some kind of event. In this case, the event we are interested in is when the Submit button is clicked.

To keep things simple, we will add our script directly to the `index.html` file. In a later assignment, we will go over how to separate you JS code from your HTML code.

<pre>
&lt;html lang=&quot;en&quot;&gt;

&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Notes&lt;/title&gt;
    <span class="add">&lt;script&gt;
        var submitBtn = document.getElementById("submit");
        console.log(submitBtn);
    &lt;/script&gt;
    </span>
&lt;/head&gt;

&lt;body&gt;
    &lt;input /&gt;
    &lt;button <span class="add">id=&quot;submit&quot; </span>&gt;Submit&lt;/button&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>

Here we added a [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) element inside the `<head>` tag. When the browser loads the page, it will see this tag and parse the contents as JS and immediately run the code inside.

In order to identify the submit button, we have added an `id` attribute. Once an element has an `id` you can use `document.getElementById` to find that element. The `var` keyword specifies that we are defining a new variable named `submitBtn`. JS most often uses [`camelCase`](https://en.wikipedia.org/wiki/Camel_case) when defining variable names. This makes it easier to read multi word variable names. The full line `var submitBtn = document.getElementById("submit");` finds the `<button>` element by its `id` and stores a reference to this element in the `submitBtn` variable.

Programming can often feel difficult because it seems invisible. A common techinique in web development is to use the `console.log` function to log certain information out to the Developer Console. See [this page](https://balsamiq.com/support/faqs/browserconsole/) for instructions on how to view your browser console.

![](/assets/js-intro-03.png)

Unfortunately, the log we see reads `null`. [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null) represents the intentional absence of any object value. In this case, it means that the call to `document.getElementById("submit")` didn't find an element with that `id`.

### Waiting For the Page to Load

This happens because this code will run before any of the elements are actually on the page. The browser runs through the `index.html` file ands creates things as soon as it sees them. In this case the `<script>` tag comes before the `<button>` so when the script runs, no button exists on the page.

In order to solve this issue, we add an event handler to the `window.onload` event. The [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) object lives in the "global" namespace. This means that it is accessible from anywhere in your script.

<pre>
&lt;script&gt;
<span class="add">window.onload = function () {</span>
<span class="add">    </span>var submitBtn = document.getElementById("submit");
<span class="add">    </span>console.log(submitBtn);
<span class="add">}</span>
&lt;/script&gt;
</pre>

Here we have defined a `function` that will be executed when the browser fires the `onload` event.

In almost all programming languages it is common to indent the code inside a function. This increases legibility as you can more quickly determine what code is part of which function. In JS this is purely visual and having inconsistent spacing won't cause issues running the code.

Refresh the page and now you should see `<button id="submit">Submit</button>` printed out in the console. Despite this looking like just text in the Console, it is actually a reference to the element on the page. If you hover over the text in the Console, you should see that it highlights the element on the page.

![](/assets/js-intro-04.png)

### Adding an Event Listener

<pre>
var submitBtn = document.getElementById("submit");
<span class="del">console.log(submitBtn);</span>
<span class="add">submitBtn.addEventListener("click", function() {
    console.log("clicked");
});</span>
</pre>

Every HTML Element has an [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) function. There are an enormous amount of [possible event types](https://developer.mozilla.org/en-US/docs/Web/Events), but for now we'll just focus on the [`click`](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) event as it is one of the most commonly used ones.

Refresh the page and now you should see "clicked" show up in the console after clicking the submit button.

### Dynamically Adding an Element on Submit

Now that we can detect when the submit button is clicked, let's add an element to the page with the text that was entered in the `<input>`.

<pre>
&lt;html lang=&quot;en&quot;&gt;

&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Notes&lt;/title&gt;
    &lt;script&gt;
        window.onload = function () {
            var submitBtn = document.getElementById("submit");
            <span class="add">var inputElement = document.getElementById("input");
            var notesElement = document.getElementById("notes");</span>

            submitBtn.addEventListener("click", function () {
                <span class="del">console.log("clicked");</span>
                <span class="add">var div = document.createElement("div");
                div.innerText = inputElement.value;
                notesElement.appendChild(div);

                inputElement.value = "";</span>
            });
        }
    &lt;/script&gt;
&lt;/head&gt;

&lt;body&gt;
    &lt;input <span class="add">id=&quot;input&quot;</span>/&gt;
    &lt;button id=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    <span class="add">&lt;div id=&quot;notes&quot;&gt;&lt;/div&gt;</span>
&lt;/body&gt;

&lt;/html&gt;
</pre>

We first add an `id` attribute to the `input` tag and then add a new `div` at the bottom of the page with the `id` "notes". This notes `div` will be where we add notes when the user clicks the submit button.

`document.createElement("div")` is the JS way of creating an HTML element. In this example, it's not possible to add these `divs` to the initial HTML as we don't know how many there will be nor what content to put inside. This is referred to as **dynamic** content. Dynamic content is anything that changes depending on user interaction.

`div.innerText = inputElement.value;` sets the "innerText" of the `div` we just created. The innerText is simply the text that appears inside that `div`. `inputElement.value` grabs the current text inside the `input` element and the `=` assigns the `input` value to the `div` we created.

We then add the new `div` to the page with `notesElement.appendChild(div);`. This specifies to append the div to the end of the list of children of the `notesElement`.

Finally, now that we have stored the note we entered, we can clear the `input` element with `inputElement.value = "";`.

Refresh you page and check to see that everything works as it should.

![](/assets/js-intro-05.png)

## Wrap-Up

In this lesson you learned:

- how to use an input element
- how to add a button
- how to add a script to an html document
- how to find elements by id
- how to add a click listener to an HTML element
- how to dynamically add HTML elements to a document using JS

## Next

In the next assignment, we will introduce Cascading Style Sheets (CSS) in order to make our web app slightly more visually appealing.

[Sprucing up HTML with CSS](/learn/web/03-sprucing-up-html-with-css)
