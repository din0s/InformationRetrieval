import idf from "./idf";
import preprocess from "./preprocess";
import tf from "./tf";

const cosine = (query, d, { index, docSizes, n_i, N }) => {
  const terms = preprocess(query);

  let sum = 0;
  Object.keys(terms).forEach((t) => {
    const idf_t = idf(t, n_i, N);

    const tf_t_q = terms[t];
    const w_t_q = tf_t_q * idf_t;

    const tf_t_d = tf(t, d, index);
    const w_t_d = tf_t_d * idf_t;

    sum += w_t_q * w_t_d;
  });

  const L_q = Object.keys(terms).length;
  const L_d = docSizes[d];

  const cosine = sum / (L_q * L_d);
  return cosine;
};

export default cosine;
