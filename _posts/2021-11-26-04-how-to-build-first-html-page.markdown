---
layout: post
title:  "How to Build Your First HTML Page"
permalink: /how-to-build-your-first-html-page
tags: learntocode assignment
---

## Pre-Requisites
[How to Setup Your Development Environment](/how-to-setup-your-development-environment)

## Intro the HTML

HTML stands for [HyperText Markup Language](https://developer.mozilla.org/en-US/docs/Web/HTML). If you have never used it before you should read about the [HTML Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics).

## Creating Your First HTML Document

- Open VS Code
- Select File > Open Folder
- Create a new folder called `code` in your home directory
- Create another new folder inside the `code` folder called `html-intro`

![](/assets/html-intro-01.png)

- Click Open

![](/assets/html-intro-02.png)

- Tick the Trust the authors of all files in the parent folder 'code' checkbox
- Click Yes, I trust the authors

- Create a new file using one of the following methods
    - Click New File
    - File -> New File
    - CMD + N or CTRL + N

![](/assets/html-intro-03.png)

- Type the code below into the file that was opened
    - When working through a tutorial, I like to keep the tutorial open on one screen and VS code open on another.  If you only have one screen, split your screen in half and have the tutorial on one half and VS Code on the other.

Read the Anatomy of an [HTML Document section](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics#anatomy_of_an_html_document) to learn what each of these tags does.

```
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Notes</title>
</head>
<body>
    
</body>
</html>
```

![](/assets/html-intro-04.png)

Notice the little white circle next to the tab at the top of the window.  This indicates that the file you are editing has unsaved changes.

- Save the file
    - Click File -> Save
    - CMD + S or CTRL + s

![](/assets/html-intro-05.png)

- Name the file `index.html`
- Click Save

![](/assets/html-intro-06.png)

You should now see the `index.html` file show up in the file explorer pane on the left. The tab of the file you were editing should also update now to show the `index.html` file name and the white circle is replaced with an "x" icon.  Clicking this icon will close the file from editing. If you close a file, you can open it back up again by clicking the file from the file explorer on the left.

## Updating the `index.html` File

Add a `h1` tag with the content set to "Hello World".

<!-- <html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Notes</title>
</head>
<body>
    **<h1>Hello World</h1>**
</body>
</html> -->
<pre>
&lt;html lang=&quot;en&quot;&gt;
&lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Notes&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    <b>&lt;h1&gt;Hello World&lt;/h1&gt;</b>
&lt;/body&gt;
&lt;/html&gt;
</pre>

## Viewing Your HTML File

- Right click `index.html` in file explorer
- Select "Reveal in Finder" or "Open Containing Folder"
- Double click `index.html` file

This should open the file in your default browser. If it doesn't for some reason or opens not in the browser you wanted, you can drag the file in to Safari, Edge, or Chrome and it will open the page there.

![](/assets/html-intro-07.png)

## Wrap-up

In this assignment you have learned:
- the basics of HTML
- to create and modify files in VS
- how to view html files in your browser

In the next assignment, we will introduce JavaScript to add interactivity to the page by creating a web application that can store notes.