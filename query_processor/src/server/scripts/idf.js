const idf = (term, n_i, N) => {
  const n = n_i[term] * 1.0;
  if (!n) {
    // unknown term
    return 0;
  }
  return 1 + Math.log(N / n);
};

export default idf;
