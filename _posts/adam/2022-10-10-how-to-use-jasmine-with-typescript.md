---
layout: post
title:  "How to Use Jasmine With TypeScript"
permalink: /@adam/how-to-use-jasmine-with-typescript
image: assets/img/how-to-use-jasmine-with-typescript.png
author: adam
description: Step by step instructions to add jasmine testing to your TypeScript node project
tags: dev
---

See [source code on Github](https://github.com/adamjberg/jasmine-with-typescript)

This post describes how to write and run jasmine tests in node when using TypeScript.  The general approach used here is to compile all TypeScript files to a `build` folder and then run jasmine out of the build folder.

### Initialize npm Project

```bash
npm init
```

### Install TypeScript, Jasmine, and Jasmine types Packages

```bash
npm i --save-dev typescript jasmine @types/jasmine
```

### Initialize Project for Typescript Usage

```bash
npx tsc --init
```

This will create a `tsconfig.json` file.  

### Update `outDir` in `tsconfig.json`

```diff
- // "outDir": "./", /* Specify an output folder for all emitted files. */
+ "outDir": "./build", /* Specify an output folder for all emitted files. */
```

This ensures that built files don't pollute your workspace.

### Add `build` command to package.json

```diff
{
  "name": "jasmine-with-typescript",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
+   "build": "tsc",
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/jasmine": "^4.3.0",
    "jasmine": "^4.4.0",
    "typescript": "^4.8.4"
  }
}
```

### Initialize Jasmine

```bash
npx jasmine init
```

This creates a file at `spec/support/jasmine.json`, make the following changes:

```diff
{
- "spec_dir": "spec",
+ "spec_dir": "build", // This tells jasmine to look in the build folder for the tests
  "spec_files": [
    "**/*[sS]pec.?(m)js"
  ],
  "helpers": [
    "helpers/**/*.?(m)js"
  ],
  "env": {
    "stopSpecOnExpectationFailure": false,
    "random": true
  }
}
```

### Add `test` script to `package.json`

```diff
{
  "name": "jasmine-with-typescript",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
+   "test": "jasmine",
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/jasmine": "^4.3.0",
    "jasmine": "^4.4.0",
    "typescript": "^4.8.4"
  }
}
```

### Create Simple TypeScript Function

```ts
// src/add.ts
export function add(a: number, b: number) {
  return a + b;
}
```

### Create Simple TypeScript Jasmine Spec

```ts
// src/add.spec.ts
import { add } from "./add";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### Run `build` Script

```bash
npm run build
```

### Run `test` Script

```bash
npm test
```

### Wrap up

One minor caveat of this approach is that after deleting any TypeScript specs, you will need to also clear them from the `build` folder.  Otherwise, these specs will continue to get picked up and run by jasmine.

### Resources

[https://jasmine.github.io/pages/getting_started.html](https://jasmine.github.io/pages/getting_started.html)
[https://jasmine.github.io/pages/faq.html#typescript](https://jasmine.github.io/pages/faq.html#typescript)