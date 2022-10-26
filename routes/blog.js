const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  //use this `` to create  query over mulitple lines
  const query = `
    SELECT posts.*, authors.name AS author_name FROM posts 
    INNER JOIN authors ON posts.author_id = authors.id
    `;
  const [posts] = await db.query(query);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts(title, summary, body, author_id) VALUES (?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/post/:id", async function (req, res) {
  const postsId = req.params.id;
  const query = `
  SELECT posts.*, authors.name AS author_name FROM posts 
  INNER JOIN authors ON posts.author_id = authors.id
  `;
  const [posts] = await db.query(query);
  for (const post of posts) {
    if (post.id == postsId) {
      res.render("post-detail", { post: post })
    };
  }
//   return
//   res.status(404).render("404");
});

router.get("/update/:id", async function (req,res) {
    const postsId = req.params.id;
    const query = `
  SELECT * FROM posts 
  `;
  const [posts] = await db.query(query);
  for (const post of posts) {
    if (post.id == postsId) {
      res.render("update-post", { post: post })
    };
  }
})

router.post("/update/:id", async function (req, res) {
    const postsId = req.params.id;
    const data = [
      req.body.title,
      req.body.summary,
      req.body.content
    ];
    // console.log('postsID = '+ postsId)
    // console.log('data = '+ data)
    await db.query(
      "UPDATE posts SET title = (?), summary = (?), body = (?) WHERE id = (?)",
      [data[0], data[1], data[2], postsId]
    );
    res.redirect("/posts");
  });


  router.post('/delete_post', async function(req, res) {
    await db.query('DELETE FROM posts where id = (?)', postsId);
    res.redirect("/posts")
  })

module.exports = router;
