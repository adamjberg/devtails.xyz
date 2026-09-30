---
layout: post
title:  "How to Use Path Aliases With Create React App (CRA), Webpack, and Typescript"
author: adam
permalink: /how-to-use-path-aliases-with-create-react-app-webpack-and-typescript
tags: dev
---

## Github Repository

[https://github.com/adamjberg/cra-ts-alias](https://github.com/adamjberg/cra-ts-alias)

## Setup

`npx create-react-app cra-ts-alias --template typescript`

## Create components/Button.tsx

```tsx
// components/Button.tsx
import React from "react";

type ButtonProps = {
  text: string;
}

export const Button: React.FC<ButtonProps> = ({ text }) => {
  return <button>{text}</button>
}
```

## Update tsconfig

```diff
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
+   "baseUrl": "./src",
+   "paths": {
+     "@components/*": [
+       "components/*"
+     ],
+   }
  },
  "include": [
    "src"
  ]
}
```

This tells Typescript how to resolve references to `import {} from "@components"`

## Add craco to modify webpack settings

### Install craco

```
yarn add craco
```

### Add craco config

```js
/* craco.config.js */
const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
};
```

This tells webpack how to resolve the aliased import.

### Use craco in package.json

```diff
"scripts": {
- "start": "npm start",
- "build": "npm build",
+ "start": "craco start",
+ "build": "craco build",
  "eject": "react-scripts eject"
},
```

## Import Button in App using new alias

```tsx
// App.tsx
import React from "react";
import { Button } from "@components/Button";

function App() {
  return <Button text="Click me!"/>;
}

export default App;
```

## Resources

[https://stackoverflow.com/questions/63067555/how-to-make-an-import-shortcut-alias-in-create-react-app](https://stackoverflow.com/questions/63067555/how-to-make-an-import-shortcut-alias-in-create-react-app)

[https://dev.to/larswaechter/path-aliases-with-typescript-in-nodejs-4353](https://dev.to/larswaechter/path-aliases-with-typescript-in-nodejs-4353)