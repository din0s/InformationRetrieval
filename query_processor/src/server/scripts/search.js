import fs from "fs";
import retrieve from "./retrieve";
import { resolve } from "path";

const docsDir = process.env.DOCS_DIR || "../docs/";
const docsPath = resolve(process.cwd(), docsDir);

export default (query, k) => {
  return retrieve(query, k)
    .filter((d) => d.score > 0)
    .sort((d1, d2) => d2.score - d1.score)
    .map((doc) => {
      const lines = fs
        .readFileSync(`${docsPath}/${doc.d}`)
        .toString()
        .split("\n");
      const url = lines[0];
      let content = lines.slice(1).join("");
      content = content.substring(0, Math.min(256, content.length));
      return { url, content };
    });
};
