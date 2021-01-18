module.exports = (term, doc, index) => {
  const occurences = index[term] || {};
  return occurences[doc] || 0;
};
