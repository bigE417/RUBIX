import { applyMove } from "./cube";
import {
  cubeFromCO,
  cubeFromCP,
  cubeFromEO,
  cubeFromEP8_EP4,
  cubeFromSlice,
  getCO,
  getCP,
  getEO,
  getEP4,
  getEP8,
  getSliceCoord,
} from "./coords";
import { combRank12_4 } from "./math";
import {
  N_CO,
  N_CP,
  N_EO,
  N_EP4,
  N_EP8,
  N_EP_COMB,
  N_SLICE,
  P2_MOVES,
} from "./types";

export const coMove = new Uint16Array(N_CO * 18);
export const eoMove = new Uint16Array(N_EO * 18);
export const sliceMove = new Uint16Array(N_SLICE * 18);
export const cpMove = new Uint16Array(N_CP * 10);
export const ep8Move = new Uint16Array(N_EP8 * 10);
export const ep4Move = new Uint16Array(N_EP4 * 10);

export const coDist = new Uint8Array(Math.ceil(N_CO / 2));
export const eoDist = new Uint8Array(Math.ceil(N_EO / 2));
export const sliceDist = new Uint8Array(Math.ceil(N_SLICE / 2));
export const cpDist = new Uint8Array(Math.ceil(N_CP / 2));
export const epCombDist = new Uint8Array(Math.ceil(N_EP_COMB / 2));

let initialized = false;

export function getNibble(table: Uint8Array, idx: number): number {
  return (table[idx >> 1] >> ((idx & 1) << 2)) & 0x0f;
}

function setNibble(table: Uint8Array, idx: number, val: number): void {
  const shift = (idx & 1) << 2;
  const i = idx >> 1;
  table[i] = (table[i] & ~(0x0f << shift)) | ((val & 0x0f) << shift);
}

function bfs(
  size: number,
  neighbors: (u: number) => Iterable<number>,
  distTable: Uint8Array,
  goals?: number[],
): void {
  const dist = new Uint8Array(size);
  dist.fill(255);
  const q: number[] = [];
  if (goals) {
    for (const g of goals) {
      dist[g] = 0;
      q.push(g);
    }
  } else {
    dist[0] = 0;
    q.push(0);
  }
  let head = 0;
  while (head < q.length) {
    const u = q[head++];
    const nd = dist[u] + 1;
    for (const v of neighbors(u)) {
      if (dist[v] === 255) {
        dist[v] = nd;
        q.push(v);
      }
    }
  }
  for (let i = 0; i < size; i++) setNibble(distTable, i, Math.min(dist[i], 15));
}

export function initSolverTables(): void {
  if (initialized) return;

  for (let co = 0; co < N_CO; co++) {
    const c = cubeFromCO(co);
    for (let m = 0; m < 18; m++) coMove[co * 18 + m] = getCO(applyMove(c, m));
  }
  for (let eo = 0; eo < N_EO; eo++) {
    const c = cubeFromEO(eo);
    for (let m = 0; m < 18; m++) eoMove[eo * 18 + m] = getEO(applyMove(c, m));
  }
  for (let sl = 0; sl < N_SLICE; sl++) {
    const c = cubeFromSlice(sl);
    for (let m = 0; m < 18; m++) sliceMove[sl * 18 + m] = getSliceCoord(applyMove(c, m));
  }
  for (let cp = 0; cp < N_CP; cp++) {
    const c = cubeFromCP(cp);
    for (let i = 0; i < 10; i++) cpMove[cp * 10 + i] = getCP(applyMove(c, P2_MOVES[i]));
  }
  for (let ep8 = 0; ep8 < N_EP8; ep8++) {
    const c = cubeFromEP8_EP4(ep8, 0);
    for (let i = 0; i < 10; i++) ep8Move[ep8 * 10 + i] = getEP8(applyMove(c, P2_MOVES[i]));
  }
  for (let ep4 = 0; ep4 < N_EP4; ep4++) {
    const c = cubeFromEP8_EP4(0, ep4);
    for (let i = 0; i < 10; i++) ep4Move[ep4 * 10 + i] = getEP4(applyMove(c, P2_MOVES[i]));
  }

  bfs(N_CO, (u) => {
    const out: number[] = [];
    for (let m = 0; m < 18; m++) out.push(coMove[u * 18 + m]);
    return out;
  }, coDist);

  bfs(N_EO, (u) => {
    const out: number[] = [];
    for (let m = 0; m < 18; m++) out.push(eoMove[u * 18 + m]);
    return out;
  }, eoDist);

  const goalComb = combRank12_4([8, 9, 10, 11]);
  const sliceGoals: number[] = [];
  for (let perm = 0; perm < 24; perm++) sliceGoals.push(goalComb * 24 + perm);

  bfs(N_SLICE, (u) => {
    const out: number[] = [];
    for (let m = 0; m < 18; m++) out.push(sliceMove[u * 18 + m]);
    return out;
  }, sliceDist, sliceGoals);

  bfs(N_CP, (u) => {
    const out: number[] = [];
    for (let i = 0; i < 10; i++) out.push(cpMove[u * 10 + i]);
    return out;
  }, cpDist);

  bfs(N_EP_COMB, (u) => {
    const ep8 = Math.floor(u / 24);
    const ep4 = u % 24;
    const out: number[] = [];
    for (let i = 0; i < 10; i++) {
      out.push(ep8Move[ep8 * 10 + i] * 24 + ep4Move[ep4 * 10 + i]);
    }
    return out;
  }, epCombDist);

  initialized = true;
}

export function isInitialized(): boolean {
  return initialized;
}
