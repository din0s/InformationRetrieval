import stopwords from "../stopwords.js";
import natural from "natural";

const preprocess = (query) => {
  const res = {};
  Object.keys(query).forEach((term) => {
    let processed = term.toLowerCase().replace(/[^\w]/g, "");
    if (!stopwords.includes(processed)) {
      processed = natural.PorterStemmer.stem(processed);
    }
    const prev = res[processed] || 0;
    res[processed] = prev + query[term];
  });

  return res;
};

export default preprocess;
