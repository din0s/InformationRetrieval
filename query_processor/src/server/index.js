import express from "express";
import mongoose from "mongoose";
import path from "path";
import search from "./scripts/search";

const app = express();
const port = process.env.PORT || 4000;

const user = process.env.MONGO_USERNAME;
const pass = process.env.MONGO_PASSWORD;
const db = process.env.MONGO_DATABASE;

mongoose
  .connect(`mongodb://${user}:${pass}@mongo:27017/${db}?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database!"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

if (process.env.NODE_ENV === "production") {
  console.log("App starting in production mode.");
  app.use(express.static(path.join(__dirname, "..", "..", "build")));
  app.get(/^\/(?!api[/$]).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "build", "index.html"));
  });
}

app.get("/api/results", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).send();
  }
  const result = await search(q, 10);
  return res.json({ result });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
