import fs from "fs";
import Heap from "heap";
import path from "path";
import webpage from "../webpage";
import cosine from "./cosine";

let indexPath = process.env.INDEXER_PATH || "indexer/index.json";
indexPath = path.resolve(process.cwd(), "..", indexPath);

const index = {};
const n_i = {};

fs.readFile(indexPath, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const file = JSON.parse(data);
  Object.keys(file).forEach((term) => {
    const freqs = file[term];
    index[term] = {};
    freqs.forEach((freq) => {
      const tuple = JSON.parse(freq.replace(/\(/g, "[").replace(/\)/g, "]"));
      const doc = tuple[0];
      const occurrences = tuple[1];
      index[term][doc] = occurrences;
    });
    n_i[term] = freqs.length;
  })
})

const docSizes = {};
const docIds = [];
let N = 0;
webpage.find().then(docs => {
  N = docs.length;
  docs.forEach(doc => {
    docSizes[doc._id] = doc.size;
    docIds.push(doc._id);
  })
});

const retrieve = (q, k) => {
  const scoredDocs = [];
  docIds.forEach((_id) => {
    const score = cosine(q, _id, { index, docSizes, n_i, N });
    scoredDocs.push({ _id, score });
  });

  const heap = new Heap((r1, r2) => r1.score - r2.score);
  for (let i = 0; i < k; ++i) {
    heap.insert(scoredDocs[i]);
  }

  for (let i = k; i < scoredDocs.length; ++i) {
    const root = heap.peek();
    if (scoredDocs[i].score > root.score) {
      heap.replace(scoredDocs[i]);
    }
  }

  return heap.toArray();
};

export default retrieve;
