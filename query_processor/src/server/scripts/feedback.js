import strToTuple from "./str-to-tuple";
import webpage from "../webpage";

const B = 0.8;
const C = 0.1;

const countTerms = async (collection, constant) => {
  const multiplier = constant / collection.length;
  const terms = {};
  const pages = await webpage
    .find({ _id: { $in: collection } })
    .select("terms");

  pages.forEach((p) => {
    p.terms.forEach((termTuple) => {
      const tuple = strToTuple(termTuple);
      const term = tuple[0];
      const freq = tuple[1] * multiplier;
      if (terms[term]) {
        terms[term] += freq;
      } else {
        terms[term] = freq;
      }
    });
  });

  return terms;
};

const feedback = async (query, positives, negatives) => {
  const positiveTerms = await countTerms(positives, B);
  const negativeTerms = await countTerms(negatives, C);

  const originalTerms = {};
  query.split(/\s+/g).forEach((term) => {
    originalTerms[term] = 1;
  });

  const allTerms = new Set(
    [
      Object.keys(positiveTerms),
      Object.keys(negativeTerms),
      Object.keys(originalTerms),
    ].flat()
  );

  const newTerms = {};
  allTerms.forEach((term) => {
    const o = originalTerms[term] || 0;
    const p = positiveTerms[term] || 0;
    const n = negativeTerms[term] || 0;

    if (o === 0 && p === 0) {
      return;
    }

    const freq = o + p - n;
    if (freq > 0) {
      newTerms[term] = freq;
    }
  });

  return newTerms;
};

export default feedback;
