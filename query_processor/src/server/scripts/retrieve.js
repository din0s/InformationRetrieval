import fs from "fs";
import Heap from "heap";
import path from "path";
import strToTuple from "./str-to-tuple";
import webpage from "../webpage";
import score from "./score";

const threadCount = process.env.THREADS || 1;

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
      const tuple = strToTuple(freq);
      const doc = tuple[0];
      const occurrences = tuple[1];
      index[term][doc] = occurrences;
    });
    n_i[term] = freqs.length;
  });
});

const docSizes = {};
const docIds = [];
let N = 0;
webpage.find().then((docs) => {
  N = docs.length;
  docs.forEach((doc) => {
    docSizes[doc._id] = doc.size;
    docIds.push(doc._id.toString());
  });
});

const retrieve = async (q, k, excludedIds) => {
  const chunks = [];
  const chunkSize = Math.ceil(N / threadCount);
  for (let i = 0; i < threadCount; ++i) {
    const base = i * chunkSize;
    chunks.push(
      docIds
        .slice(base, base + chunkSize)
        .filter((_id) => !excludedIds.includes(_id))
    );
  }

  const scoredDocs = (
    await Promise.all(
      chunks.map(async (chunk) => {
        return await score(q, chunk, { index, docSizes, n_i, N });
      })
    )
  ).flat();

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
