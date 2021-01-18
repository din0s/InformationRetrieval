import cosine from "./cosine";
import Heap from "heap";
import fs from "fs";
import { resolve } from "path";

const indexJson = process.env.INDEX_JSON || "../index.json";
const docSizeJson = process.env.DOC_SIZE_JSON || "../docSize.json";

const indexPath = resolve(process.cwd(), indexJson);
const docSizePath = resolve(process.cwd(), docSizeJson);

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
