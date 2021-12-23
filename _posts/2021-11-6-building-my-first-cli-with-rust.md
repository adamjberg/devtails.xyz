---
layout: post
title:  "Building My First Command Line Interface (CLI) with Rust"
permalink: /building-my-first-command-line-interface-with-rust
image: https://cdn-images-1.medium.com/max/8064/1*4B_IJvXzRd0kyRjj-8lfJw.jpeg
description: After telling myself over and over that today is the day I start learning rust. I finally successfully built a command line app for engram.
tags: rust dev
nxt:
  url: /how-to-build-a-note-taking-command-line-application-with-rust
  title: "How to Build a Note Taking Command Line Application With Rust: Part 1"
---

![Rusting rustic truck down by the Skookumchuck](https://cdn-images-1.medium.com/max/8064/1*4B_IJvXzRd0kyRjj-8lfJw.jpeg)
<figcaption>Rusting rustic truck down by the Skookumchuck</figcaption>


**Update: I took some of my learnings from this write-up and started a more formal tutorial for [building CLI notes app with Rust](/how-to-build-a-note-taking-command-line-application-with-rust).**

After telling myself over and over that today is the day I start learning rust. I finally successfully built a (very small) [cli](https://github.com/adamjberg/engram/tree/main/clients/cli/eg) for [engram](https://engramhq.xyz).

This post will cover some of the things I learned along the way. I mostly from a TypeScript/Node background and will make comparisons between the two where applicable.

## Inventing Some Requirements

I have found that having a tangible end goal increases my odds of project completion by nearly 100%. In this case, the goal is to create a command line program that simply POSTs requests to my personal notes application engram.

This is not just a learning or for fun project as I recently realized that the command line is a great place for the input of quick notes. When I’m working, I sometimes find myself investigating something in the terminal and realize that I have a thought that I’d like to follow up on later, or a I’d like to store a command I just ran so I can remember what I did later on.

## Getting Started

Install rust with the command below found from their [Getting started page](https://www.rust-lang.org/learn/get-started)

    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

cargo new project-name creates a new folder called project-name with the bare minimum configuration for a rust project

### **Cargo.toml**

This is essentially the rust equivalent of a package.json file. Lists some metadata about the project and eventually allows you to specify any dependencies to be managed by the [cargo package manager](https://doc.rust-lang.org/cargo/).

    [package]
    name = "rust-new-project"
    version = "0.1.0"
    edition = "2021"

    # See more keys and their definitions at [https://doc.rust-lang.org/cargo/reference/manifest.html](https://doc.rust-lang.org/cargo/reference/manifest.html)

    [dependencies]

### **main.rs**

Who doesn’t love a good Hello, world! application?

    fn main() {
      println!("Hello, world!");
    }

## The Final Output

I find it helpful to see the whole picture at first. I will then break down each line of code and introduce the rust concepts that are used.

### **Cargo.toml**

    # Cargo.toml
    [package]
    name = "eg"
    version = "0.1.0"
    edition = "2021"

    # See more keys and their definitions at [https://doc.rust-lang.org/cargo/reference/manifest.html](https://doc.rust-lang.org/cargo/reference/manifest.html)

    [dependencies]
    reqwest = { version = "0.11", features = ["json", "cookies"] }
    tokio = { version = "1", features = ["full"] }

### **main.rs**

    # main.rs
    use std::io;

    use std::collections::HashMap;

    #[tokio::main]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
      let mut note = String::new();
      io::stdin().read_line(&mut note)?;

      let mut note_post_map = HashMap::new();
      note_post_map.insert("body", note);

      let client = reqwest::Client::new();
      let resp = client.post("https://engram.xyzdigital.com/api/notes")
        .json(&note_post_map)
        .send()
        .await?;

      if resp.status() != 200 {
        println!("failed to submit note");
        return Ok(());
      }

      Ok(())
    }

## Breaking it Down Line by Line

### **Get input from stdin**

In order to submit a new note, I need to be able to accept input from the command line. This can be achieved with the std::io package.

    use std::io;

    ...

    // Initializes a new string
    // the mut specifies that it is mutable (e.g. can be modified)
    let mut note = String::new();

    // Uses the stdin package to read a line from the input
    // The & denotes that we are passing a reference to the note variable
    // mut is required to specify that the reference can be mutated
    // The ? at the end propagates the error to the outer function
    // see [https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html#a-shortcut-for-propagating-errors-the--operator](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html#a-shortcut-for-propagating-errors-the--operator) for more details on rust errors
    io::stdin().read_line(&mut note)?;

Once you have added the above to the body of the main function, you will see a compiler error:
>  the `?` operator can only be used in a function that returns `Result` or `Option` (or another type that implements `std::ops::FromResidual`)
>  cannot use the `?` operator in a function that returns `()`

One option would be to simply remove the “?”. This instead throws the warning: unused std::result::Result that must be used . This is because the read_line function may fail and ignoring this error may have negative consequences for your application.

In order to fix the error without a warning we must update the return type of the main function to return the special rust [Result type](https://doc.rust-lang.org/std/result/).

    fn main() -> Result<(), Box<dyn std::error::Error>> {
      ...
      Ok(());
    }

The “()” type is called “[unit](https://doc.rust-lang.org/std/primitive.unit.html)”. And can be thought of like void in other languages.

The [Box](https://doc.rust-lang.org/std/boxed/index.html) is a pointer type for heap allocation. As I currently understand it, the Error that may be thrown has a dynamic size (e.g. the message passed along with the error could be variable length). Therefore the Box specifies that the Error will be some dynamically allocated memory. Without this you would see the error below:
>  the size for values of type `(dyn std::error::Error + ‘static)` cannot be known at compilation time
>  doesn’t have a size known at compile-time

Finally, we add an Ok(()) at the end of the main function. This fulfils the Result type with the () unit type.

### **Write a POST Request in rust**

**1. Install reqwest library**

A quick search pointed me to the [reqwest library](https://docs.rs/reqwest/0.11.6/reqwest/) for handling sending HTTP requests. Installing the library is accomplished by adding the following to the Cargo.toml file.

    # Cargo.toml
    ...
    [dependencies]
    reqwest = { version = "0.11", features = ["json", "cookies"] }

**2. Create HashMap with body property**

My server expects a json object that looks like { body: "note contents" } and so we use the std::collections::HashMap library to make what is essentially a JavaScript Object.

    use std::collections::HashMap;

    ...

    let mut note_post_map = HashMap::new();
    note_post_map.insert("body", note);

**3. POST JSON data with reqwest**

    let client = reqwest::Client::new();
    let res = client.post("http://engram.xyzdigital.com/api/notes")
        .json(&note_post_map)
        .send()
        .await**?**;

The await keyword is new here. This works similar to async/await in JavaScript. The function will not continue until the asynchronous result from the HTTP request has returned.

**4. Add async keyword to outer main function**

In order to support the use of await above, we need to add the async keyword to the main function

    async fn main() -> Result<(), Box<dyn std::error::Error>> {
      ...
    }

Unfortunately, this gives the following error
>  `main` function is not allowed to be `async`

This is where the [tokio library](https://github.com/tokio-rs/tokio) comes in to play. We add it to the Cargo.toml under [dependencies] .

    ...
    [dependencies]
    tokio = { version = "1", features = ["full"] }

Now we can add [[tokio::main](https://docs.rs/tokio/0.2.2/tokio/attr.main.html)] to our main function. From this [page](https://rust-lang.github.io/async-book/08_ecosystem/00_chapter.html), it appears an async runtime is required to actually execute async code. Tokio is one of the popular libraries that provides this async runtime.

    #[tokio::main]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
      ...
    }

**5. Checking the Result**

    if resp.status() != 200 {
      println!("failed to submit note");
      return Ok(());
    }

Finally some code that should look pretty understandable. The response object has a status method to extract the status code of the response. For now, I simple log out that it failed an exit the program.

## Wrap Up

I have started and stopped working with rust multiple times. Each time I stopped I noticed it was because I didn’t have a strong understanding of the syntax, which frustrated me. Writing this article has forced me to think a bit deeper about how it all works (I learned most of the terminology along the way). Hopefully something here clicks for you as well.

I plan to continue writing and learning more rust and will add new posts with relevant learnings along the way. Mostly so when I look back in 3 years I can laugh at how much I didn’t really understand 😂.
