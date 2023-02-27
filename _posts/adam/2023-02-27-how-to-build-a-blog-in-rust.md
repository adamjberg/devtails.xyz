---
layout: post
title:  "Tutorial: How to Build a Blog in Rust - Static File Server"
permalink: /@adam/how-to-build-a-blog-in-rust
image: assets/img/blog-in-rust-static-file-server.png
author: adam
description: Step by step instructions for implementing an http server in rust that serves up static files
tags: dev rust
---

## Video Walkthrough

<iframe width="100%" style="aspect-ratio: 16 / 9;" src="https://www.youtube.com/embed/9uAy8skUVsc" title="How to Build a Blog in Rust" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Initialize Project

```bash
cargo new blog
```

## Listen on Port 8000 and Respond With 404

```rust
// main.rs
use std::{
    io::{prelude::*},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("[::]:8000").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let status_line = "HTTP/1.1 404 NOT FOUND";
    let contents = String::new();

    let length = contents.len();
    let response = format!(
        "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
    );

    stream.write_all(response.as_bytes()).unwrap();
}
```

### Run

```bash
cargo run
```

### Test

```bash
curl localhost:8000
```

Alternatively, you can open [http://localhost:8000](http://localhost:8000) in your browser.

## Parse Path From Request

### Add Regex to Cargo.toml

```diff
[package]
name = "http-server"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
+ regex = "1"
```

```diff
// main.rs
use std::{
-   io::{prelude::*},
+   io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};
+ use regex::Regex;

fn main() {
    let listener = TcpListener::bind("[::]:8000").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
+   let buf_reader = BufReader::new(&mut stream);
+   let request_line = buf_reader.lines().next().unwrap().unwrap();

+   let re = Regex::new(r"^(.*) (.*) (.*)$").unwrap();
+   let caps = re.captures(&request_line).unwrap();
+   let pathname = caps.get(2).map_or("", |m| m.as_str());
+
+   println!("{pathname}");

    let status_line = "HTTP/1.1 404 NOT FOUND";
    let contents = String::new();

    let length = contents.len();
    let response = format!(
        "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
    );

    stream.write_all(response.as_bytes()).unwrap();
}
```

### Check

Restart the program with `cargo run`. Now from a browser you can try different URL variations [http://localhost:8000](http://localhost:8000) and confirm they are printed correctly in the console.

## Read File to String and Return in Response

```diff
// main.rs
use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};
+use std::path::Path;
use regex::Regex;

fn main() {
    let listener = TcpListener::bind("[::]:8000").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let re = Regex::new(r"^(.*) (.*) (.*)$").unwrap();
    let caps = re.captures(&request_line).unwrap();
    let pathname = caps.get(2).map_or("", |m| m.as_str());
-   println!("{pathname}");
+   let mut filename = "index.html";
+   if pathname != "/" {
+       filename = &pathname[1..];
+   }

-   let status_line = "HTTP/1.1 404 NOT FOUND";
-   let contents = String::new();
+   let mut status_line = "HTTP/1.1 404 NOT FOUND";
+   let mut contents = String::new();

+   let full_file_path = format!("{}{}", "static/", filename);
+   if Path::new(&full_file_path).exists() {
+       status_line = "HTTP/1.1 200 OK";
+       contents = fs::read_to_string(&full_file_path).unwrap();
+   }

    let length = contents.len();
    let response = format!(
        "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
    );

    stream.write_all(response.as_bytes()).unwrap();
}
```

## Add Some HTML Pages

### Create static/index.html

```html
<!-- static/index.html -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home</title>
</head>
<body>
  <a href="/hello-world.html">Hello World</a>
</body>
</html>
```

### Create static/hello-world.html

```html
<!-- static/hello-world.html -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

## Wrap-Up

In this post, we've built a simple static file server using Rust.  Already this server is functional enough to be used for a blog.  All you would need to do is add new html pages with posts and update the index.html to allow people to discover them from the front page.

In a future post, we will build a simple markdown parser to allow us to write out posts in markdown.