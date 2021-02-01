const strToTuple = (str) => {
  return JSON.parse(str.replace(/\(/g, "[").replace(/\)/g, "]"));
};

export default strToTuple;
