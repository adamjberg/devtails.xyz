---
layout: post
title:  "How to Search HTML Using MongoDB Atlas Search"
author: adam
permalink: /how-to-search-html-using-mongodb-atlas-search
image: 
description: 
tag: dev
---

## Create Project

![image](https://user-images.githubusercontent.com/1812989/198688766-e2a829f1-f744-4bef-bb47-eac2436e171a.png)

## Create a database

![image](https://user-images.githubusercontent.com/1812989/198688955-7e742990-684e-44b6-9d03-b3f32c17881c.png)

## Select Free Shared Instance

![image](https://user-images.githubusercontent.com/1812989/198689059-171fa9c6-e41c-4fe7-9a2e-e1784e4170ca.png)

![image](https://user-images.githubusercontent.com/1812989/198689228-3a204b88-d76b-4ba4-93ab-fbeb9a1178ed.png)

![image](https://user-images.githubusercontent.com/1812989/198689334-c524f646-6899-4165-8560-9bba0d2b3987.png)

## Add Data

![image](https://user-images.githubusercontent.com/1812989/198689412-b12c3b37-e51f-4aa7-a393-be2e4ec19dad.png)

![image](https://user-images.githubusercontent.com/1812989/198689477-46ef0d94-f419-433e-b271-ab12f809ee6a.png)

![image](https://user-images.githubusercontent.com/1812989/198689567-5fb84bad-84dc-472a-9933-f98de652c05f.png)

![image](https://user-images.githubusercontent.com/1812989/198689956-b46fcb33-e3ce-4e74-a7ad-ce9817dc0538.png)


## Create Search Index Using JSON Editor

![image](https://user-images.githubusercontent.com/1812989/198694092-a547723d-1d69-43ef-9ae4-726df596bf3c.png)

![image](https://user-images.githubusercontent.com/1812989/198694451-6f82f696-32ae-4204-8b3e-b4763b4c614b.png)

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

![image](https://user-images.githubusercontent.com/1812989/198694807-a76ac6ea-c651-4afa-a6e0-f279925db19d.png)

![image](https://user-images.githubusercontent.com/1812989/198694853-d604637a-e15b-4e52-83f2-b7bf15eada03.png)
