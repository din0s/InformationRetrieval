import express from "express";
import search from "./scripts/search";
import path from "path";

const app = express();
const port = process.env.PORT || 4000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "..", "build")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "build", "index.html"));
  })
}

app.get("/api/results", (req, res) => {
  const { q } = req.query;
  const result = search(q, 5);
  return res.json({ result });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
