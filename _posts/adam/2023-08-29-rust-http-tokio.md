---
layout: post
title:  "Tutorial: How to Use Tokio with Rust to Make an HTTP Server"
permalink: /@adam/how-to-use-tokio-with-rust-to-make-an-http-server
image: 
author: adam
description: Instructions for creating a basic http server with Rust using the async tokio runtime
tags: dev rust
---

## Tokio

[Tokio](https://tokio.rs/) is an asynchronous runtime for Rust.  In this post we'll use Tokio to create a simple HTTP server.

## Initialize Project

```bash
cargo init rust-tokio-http
```

## Add the required dependencies to your `Cargo.toml` file:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

## Update main.rs

```rust
// src/main.rs
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = TcpListener::bind(&addr).await?;

    println!("Listening on: http://{}", addr);

    loop {
        let (mut stream, _) = listener.accept().await?;

        tokio::spawn(async move {
            let mut buffer = [0; 1024];
            let _ = stream.read(&mut buffer).await;

            let contents = "<h1>Hello, world!</h1>";
            let content_length = contents.len();
            let response = format!("HTTP/1.1 200 OK\r\nContent-Length: {content_length}\r\n\r\n{contents}");
            let _ = stream.write_all(response.as_bytes()).await;
        });
    }
}
```