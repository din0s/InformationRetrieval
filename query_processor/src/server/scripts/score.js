import { isMainThread, parentPort, Worker } from "worker_threads";
import cosine from "./cosine";

if (isMainThread) {
  // supervisor
  const workerCount = process.env.THREADS || 1;
  const allWorkers = [];
  let rrIndex = 0;

  // create worker pool
  for (let i = 0; i < workerCount; ++i) {
    allWorkers.push(new Worker(__filename));
  }

  module.exports = (query, docIds, data) => {
    return new Promise((resolve, reject) => {
      const task = { query, docIds, data };

      // assign work
      const worker = allWorkers[rrIndex];
      worker.postMessage(task);

      // round robin
      rrIndex = ++rrIndex % workerCount;

      // receive work results
      worker.on("message", (scores) => {
        resolve(scores);
      });

      // errors
      worker.on("error", reject);

      // exit codes
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker exited with ${code}!`);
        }
      });
    });
  };
} else {
  // worker
  parentPort.on("message", (task) => {
    const { query, docIds, data } = task;
    const scores = docIds.map((_id) => {
      const score = cosine(query, _id, data);
      return { _id, score };
    });
    // post work results
    parentPort.postMessage(scores);
  });
}
