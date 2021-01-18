import express from "express";
import search from "./scripts/search";

const app = express();
const port = process.env.PORT || 4000;

app.get("/api/results", (req, res) => {
  const { q } = req.query;
  const result = search(q, 5);
  return res.json({ result });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
