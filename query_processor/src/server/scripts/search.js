import webpage from "../webpage";
import retrieve from "./retrieve";

const search = async (query, k) => {
  const freqs = {};
  query.split(/\s+/g).forEach((t) => {
    freqs[t] = 1;
  });
  return await searchWithFreqs(freqs, k, []);
};

const searchWithFreqs = async (query, k, excludedIds) => {
  return await Promise.all(
    (await retrieve(query, k, excludedIds))
      .filter((d) => d.score > 0)
      .sort((d1, d2) => d2.score - d1.score)
      .map(async (doc) => {
        const { _id } = doc;
        const page = await webpage.findById(_id);
        const { url, title } = page;
        let { summary } = page;

        if (summary.length > 512) {
          summary = summary.substring(0, 512);
          const lastIndex = summary.lastIndexOf(" ");
          summary = summary.substring(0, lastIndex) + "...";
        }

        return { _id, url, title, summary };
      })
  );
};

export { search, searchWithFreqs };
