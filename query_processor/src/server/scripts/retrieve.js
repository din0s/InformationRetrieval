import cosine from "./cosine";
import Heap from "heap";
import fs from "fs";
import { resolve } from "path";

const indexDir = process.env.INDEX_DIR || "../index/";
const indexPath = resolve(process.cwd(), indexDir, "index.json");
const docSizePath = resolve(process.cwd(), indexDir, "docSizes.json");

const index = {};
const n_i = {};

fs.readFile(indexPath, (err, data) => {
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
  });
});

let docSizes = {};
let docIds = [];
let N = 0;
fs.readFile(docSizePath, (err, data) => {
  docSizes = JSON.parse(data);
  docIds = Object.keys(docSizes);
  N = docIds.length;
});

export default (q, k) => {
  const scoredDocs = [];
  docIds.forEach((d) => {
    const score = cosine(q, d, { index, docSizes, n_i, N });
    scoredDocs.push({ d, score });
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
