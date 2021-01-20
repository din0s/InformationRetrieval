import fs from "fs";
import retrieve from "./retrieve";
import { resolve } from "path";

const summariesDir = process.env.SUMMARIES_DIR || "../summaries/";
const summariesPath = resolve(process.cwd(), summariesDir);

export default (query, k) => {
  return retrieve(query, k)
    .filter((d) => d.score > 0)
    .sort((d1, d2) => d2.score - d1.score)
    .map((doc) => {
      const lines = fs
        .readFileSync(`${summariesPath}/${doc.d}`)
        .toString()
        .split("\n");
      const url = lines[0];
      let summary = lines.slice(1).join("");
      if (summary.length > 256) {
        const lastIndex = summary.lastIndexOf(" ");
        summary = summary.substring(0, lastIndex) + "...";
      }
      
      return { url, summary };
    });
};
