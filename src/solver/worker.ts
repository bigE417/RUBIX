import { initSolver, solveFacelets } from "./index";

export type WorkerIn =
  | { type: "init" }
  | { type: "solve"; facelets: string; id: number };

export type WorkerOut =
  | { type: "ready" }
  | { type: "solve"; id: number; result: ReturnType<typeof solveFacelets> };

self.onmessage = (ev: MessageEvent<WorkerIn>) => {
  const msg = ev.data;
  if (msg.type === "init") {
    initSolver();
    postMessage({ type: "ready" } satisfies WorkerOut);
    return;
  }
  if (msg.type === "solve") {
    const result = solveFacelets(msg.facelets);
    postMessage({ type: "solve", id: msg.id, result } satisfies WorkerOut);
  }
};
