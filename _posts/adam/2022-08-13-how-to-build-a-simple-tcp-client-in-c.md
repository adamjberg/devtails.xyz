---
layout: post
title:  "How to Build a Simple TCP Client in C"
permalink: /@adam/how-to-build-a-simple-tcp-client-in-c
image: 
author: adam
description: 
tags: dev
---

In my last post, I went over [How to Build a Simple TCP Server in C](/@adam/how-to-build-a-simple-tcp-server-in-c).  This post is a follow-up that creates a TCP client in C that you can use to test out the TCP server.

# Implementation

```c
// client.c
#include <arpa/inet.h>  // inet_addr
#include <stdio.h>      // printf, fgets
#include <netinet/in.h> // sockaddr, sockaddr_in
#include <sys/socket.h> // socket, connect, AF_INET, SOCK_STREAM
#include <sys/types.h>  // htonl, htons
#include <unistd.h>     // read, write, close

#define MAX_MESSAGE_SIZE 256

int main()
{
  struct sockaddr_in server_sockaddr_in;

  server_sockaddr_in.sin_family = AF_INET;
  server_sockaddr_in.sin_addr.s_addr = inet_addr("127.0.0.1");
  server_sockaddr_in.sin_port = htons(8081);

  int socket_file_descriptor = socket(AF_INET, SOCK_STREAM, 0);

  // https://man7.org/linux/man-pages/man2/connect.2.html
  // connect() system call connects the socket socket_file_descriptor to the address specified by server_sockaddr_in
  connect(socket_file_descriptor, (struct sockaddr *)&server_sockaddr_in, sizeof(server_sockaddr_in));

  char buffer[MAX_MESSAGE_SIZE] = {};
  printf("Enter a message:\n");

  // https://www.tutorialspoint.com/c_standard_library/c_function_fgets.htm
  // fgets() reads a line from stdin and stores it in buffer up to a max of MAX_MESSAGE_SIZE characters
  fgets(buffer, MAX_MESSAGE_SIZE, stdin);

  write(socket_file_descriptor, buffer, sizeof(buffer));

  int num_read = read(socket_file_descriptor, buffer, sizeof(buffer));
  printf("Status: %d\n", buffer[0]);

  close(socket_file_descriptor);
}
```

# How to Build

```bash
cc client.c -o client
```

# Testing Client and Server

![](/assets/img/tcp-client-server-in-c.png)

1. Start the server created in the previous post with `./server`
2. Start the client created in this post with `./client`
3. Enter a message to send from the client to the server and press return
4. See the message printed to the console on the server
5. See the status 0 printed on the client
6. Both programs then close their open sockets and exit

# Closing Thoughts

In just under 100 lines of C, we have a functioning client and server.  In future posts, I will expand on this implmentation to show how this basic client / server architecture can quickly support the needs of the notes functionality of [engram](https://github.com/adamjberg/engram).