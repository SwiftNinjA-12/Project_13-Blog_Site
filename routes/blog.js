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
  SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts 
  INNER JOIN authors ON posts.author_id = authors.id
  WHERE posts.id = (?)
  `;
  const [posts] = await db.query(query, [postsId]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

router.get("/update/:id", async function (req, res) {
  const postsId = req.params.id;
  const query = `
  SELECT * FROM posts 
  WHERE id = ?
  `;
  const [posts] = await db.query(query, [postsId]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/update/:id", async function (req, res) {
  const query = `
UPDATE posts SET title = ?, summary = ?, body = ?
WHERE id = ?
`;
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  res.redirect("/posts");
});

// router.post("/update/:id", async function (req, res) {
//   const postsId = req.params.id;
//   const data = [req.body.title, req.body.summary, req.body.content];
//   // console.log('postsID = '+ postsId)
//   // console.log('data = '+ data)
//   await db.query(
//     "UPDATE posts SET title = (?), summary = (?), body = (?) WHERE id = (?)",
//     [data[0], data[1], data[2], postsId]
//   );
//   res.redirect("/posts");
// });

router.post("/delete_post/:id", async function (req, res) {
  await db.query("DELETE FROM posts where id = ?", [req.params.id]);
  res.redirect("/posts");
});

module.exports = router;
