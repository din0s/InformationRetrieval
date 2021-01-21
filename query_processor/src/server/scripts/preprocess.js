import stopwords from "../stopwords.js";
import natural from "natural";

export default (query) => {
  return query
    .split(/\s+/g)
    .map((w) => w.toLowerCase())
    .map((w) => w.replace(/[^\w]/g, ""))
    .filter((w) => !stopwords.includes(w))
    .map((w) => natural.PorterStemmer.stem(w))
    .join(" ");
};
