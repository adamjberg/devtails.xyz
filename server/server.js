const fs = require("fs");
const express = require("express");
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../assets')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

const app = express();

app.use(express.json())

app.get("/api/posts", (req, res, next) => {
  const posts = fs.readdirSync("../_posts");

  res.json({
    data: posts
  })
})

app.get("/api/posts/:id", (req, res, next) => {
  const post = fs.readFileSync(`../_posts/${req.params.id}`);

  res.json({
    data: post.toString()
  })
});

app.post("/api/posts/:id", (req, res, next) => {
  fs.writeFileSync(`../_posts/${req.params.id}`, req.body.body);

  res.sendStatus(200);
})

app.post("/api/upload", upload.single('image'), (req, res, next) => {
  res.json({
    data: req.file.filename
  });
});

app.use(express.static('static'));

app.get("*", (req, res, next) => {
  res.sendFile('index.html',  { root: '.' });
});

app.listen(4242);
