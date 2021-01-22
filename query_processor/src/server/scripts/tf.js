const tf = (term, doc, index) => {
  const occurences = index[term] || {};
  return occurences[doc] || 0;
};

export default tf;
