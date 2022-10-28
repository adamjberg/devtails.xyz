---
layout: post
title:  "How to Search HTML Using MongoDB Atlas Search"
author: adam
permalink: /how-to-search-html-using-mongodb-atlas-search
image: https://user-images.githubusercontent.com/1812989/198694853-d604637a-e15b-4e52-83f2-b7bf15eada03.png
description: Step by step instructions for how to add a custom htmlStrip analyzer to an MongoDB Atlas Search index
tag: dev
---

## Introduction

In this post we'll create a brand new MongoDB Atlas cluster and create a search index that uses a custome analyzer to strip html out from the collection field we are searching.

## Problem

By default, Atlas search will generate a standard english text index that will tokenize pretty much every character it finds.  This leads to higher disk usage, but more importantly causes search results to be polluted with html tags and attributes that you likely don't want to be searching.

## Solution

Atlas Search allows you to specify [custom analyzers](https://www.mongodb.com/docs/atlas/atlas-search/analyzers/custom/) for the fields you are indexing.  A Google search returned the [htmlStrip character filter](https://www.mongodb.com/docs/atlas/atlas-search/analyzers/character-filters/#htmlstrip), but it took me a few minutes to understand how to use.  With this filter enabled, all html tags get stripped from the index, reducing disk usage and improving search results.

## Creating a Cluster From Scrach

### Create Project

![image](https://user-images.githubusercontent.com/1812989/198688766-e2a829f1-f744-4bef-bb47-eac2436e171a.png)

### Create a database

![image](https://user-images.githubusercontent.com/1812989/198688955-7e742990-684e-44b6-9d03-b3f32c17881c.png)

### Select Free Shared Instance

![image](https://user-images.githubusercontent.com/1812989/198689059-171fa9c6-e41c-4fe7-9a2e-e1784e4170ca.png)

![image](https://user-images.githubusercontent.com/1812989/198689228-3a204b88-d76b-4ba4-93ab-fbeb9a1178ed.png)

![image](https://user-images.githubusercontent.com/1812989/198689334-c524f646-6899-4165-8560-9bba0d2b3987.png)

## Add Data

![image](https://user-images.githubusercontent.com/1812989/198689412-b12c3b37-e51f-4aa7-a393-be2e4ec19dad.png)

### Create Dummy Collection For Testing

![image](https://user-images.githubusercontent.com/1812989/198689567-5fb84bad-84dc-472a-9933-f98de652c05f.png)

## Create Search Index

![image](https://user-images.githubusercontent.com/1812989/198689956-b46fcb33-e3ce-4e74-a7ad-ce9817dc0538.png)


### JSON Editor

The visual editor does not allow adding custom analyzers from the visual editor, so we'll need to use the JSON editor.

![image](https://user-images.githubusercontent.com/1812989/198694092-a547723d-1d69-43ef-9ae4-726df596bf3c.png)

### Paste the Following JSON

The `analyzers` array defines a new analyzer that can be used by the index.  We then specificly attach that analyzer to the `body` field (This ensures that other fields that don't need this analyzer continue using the default).

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "body": {
        "analyzer": "htmlStrippingAnalyzer",
        "searchAnalyzer": "htmlStrippingAnalyzer",
        "type": "string"
      }
    }
  },
  "analyzers": [
    {
      "charFilters": [
        {
          "type": "htmlStrip"
        }
      ],
      "name": "htmlStrippingAnalyzer",
      "tokenFilters": [],
      "tokenizer": {
        "type": "standard"
      }
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/1812989/198694451-6f82f696-32ae-4204-8b3e-b4763b4c614b.png)

![image](https://user-images.githubusercontent.com/1812989/198694807-a76ac6ea-c651-4afa-a6e0-f279925db19d.png)

![image](https://user-images.githubusercontent.com/1812989/198694853-d604637a-e15b-4e52-83f2-b7bf15eada03.png)

## Run Some Tests

Now that you've successfully created the index with the htmlStrip analyzer, create some sample documents and confirm it behaves as expected.

### Insert a Test Document

```json
{
  "body": "<body><a href='https://devtails.xyz'>this</a> should exclude html</body>"
}
```

![image](https://user-images.githubusercontent.com/1812989/198697469-8ce2e790-8aa9-4c65-b0e9-6bf38fea1c3a.png)

### Run a Test Query

Try searching for "body" and notice that it doesn't show up in the results.

![image](https://user-images.githubusercontent.com/1812989/198697622-b16cbb7b-6214-4e4c-82d1-65301f120615.png)

Now search for something that is part of the text like "html" and confirm that Atlas Search returns the document.

![image](https://user-images.githubusercontent.com/1812989/198697797-4b4bc25d-ea6a-4f69-bf62-e30c4581c2b5.png)

## Conclusion

In this post we've covered adding a custom analyzer to an Atlas Search index to filter out html characters.  The documentation can be a bit difficult to parse at times, but once found Atlas Search generally supports what you probably want.