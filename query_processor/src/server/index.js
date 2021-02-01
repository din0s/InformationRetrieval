import express from "express";
import feedback from "./scripts/feedback";
import mongoose from "mongoose";
import path from "path";
import { search, searchWithFreqs } from "./scripts/search";

const app = express();
const port = process.env.PORT || 4000;

const user = process.env.MONGO_USERNAME;
const pass = process.env.MONGO_PASSWORD;
const db = process.env.MONGO_DATABASE;

mongoose
  .connect(
    process.env.MONGO_URL ||
      `mongodb://${user}:${pass}@mongo:27017/${db}?authSource=admin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to database!"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.use(express.json());

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

app.post("/api/feedback", async (req, res) => {
  if (!req.body) {
    return res.status(400).send();
  }

  const { query, positives, negatives } = req.body;
  if (!query || !positives || !negatives) {
    return res.status(400).send();
  }

  const newQuery = await feedback(query, positives, negatives);
  const result = await searchWithFreqs(newQuery, 10, negatives);
  return res.json({ result });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
