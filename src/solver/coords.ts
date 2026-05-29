import type { Cube } from "./types";
import { applyMove } from "./cube";
import { solvedCube } from "./cube";
import { combRank12_4, combUnrank12_4, indexToPerm, permToIndex } from "./math";

export function getCO(c: Cube): number {
  let idx = 0;
  for (let i = 0; i < 7; i++) idx = idx * 3 + c.co[i];
  return idx;
}

export function getEO(c: Cube): number {
  let idx = 0;
  for (let i = 0; i < 11; i++) idx = (idx << 1) | c.eo[i];
  return idx;
}

export function getSliceCoord(c: Cube): number {
  const slicePos: number[] = [];
  for (let i = 0; i < 12; i++) if (c.ep[i] >= 8) slicePos.push(i);
  slicePos.sort((a, b) => a - b);
  const comb = combRank12_4(slicePos);
  const sliceEdgeOrder = slicePos.map((p) => c.ep[p] - 8);
  return comb * 24 + permToIndex(sliceEdgeOrder);
}

export function getCP(c: Cube): number {
  return permToIndex(Array.from(c.cp));
}

export function getEP8(c: Cube): number {
  return permToIndex(Array.from(c.ep.subarray(0, 8)));
}

export function getEP4(c: Cube): number {
  const ep4: number[] = [];
  for (let i = 8; i < 12; i++) ep4.push(c.ep[i] - 8);
  return permToIndex(ep4);
}

const permBuf: number[] = [];
const posBuf: number[] = [0, 0, 0, 0];

export function cubeFromCO(coIdx: number): Cube {
  const c = solvedCube();
  let tmp = coIdx;
  for (let i = 6; i >= 0; i--) {
    c.co[i] = tmp % 3;
    tmp = Math.floor(tmp / 3);
  }
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += c.co[i];
  c.co[7] = ((3 - (sum % 3)) % 3) as 0 | 1 | 2;
  return c;
}

export function cubeFromEO(eoIdx: number): Cube {
  const c = solvedCube();
  let tmp = eoIdx;
  for (let i = 10; i >= 0; i--) {
    c.eo[i] = tmp & 1;
    tmp >>= 1;
  }
  let x = 0;
  for (let i = 0; i < 11; i++) x ^= c.eo[i];
  c.eo[11] = x;
  return c;
}

export function cubeFromSlice(sliceIdx: number): Cube {
  const c = solvedCube();
  const comb = Math.floor(sliceIdx / 24);
  const perm = sliceIdx % 24;
  combUnrank12_4(comb, posBuf);
  indexToPerm(perm, 4, permBuf);
  const sliceSet = new Set(posBuf);
  for (let i = 0; i < 4; i++) c.ep[posBuf[i]] = 8 + permBuf[i];
  let idx = 0;
  for (let pos = 0; pos < 12; pos++) {
    if (!sliceSet.has(pos)) c.ep[pos] = idx++;
  }
  return c;
}

export function cubeFromCP(cpIdx: number): Cube {
  const c = solvedCube();
  indexToPerm(cpIdx, 8, permBuf);
  for (let i = 0; i < 8; i++) c.cp[i] = permBuf[i];
  return c;
}

export function cubeFromEP8_EP4(ep8Idx: number, ep4Idx: number): Cube {
  const c = solvedCube();
  indexToPerm(ep8Idx, 8, permBuf);
  for (let i = 0; i < 8; i++) c.ep[i] = permBuf[i];
  indexToPerm(ep4Idx, 4, permBuf);
  for (let i = 0; i < 4; i++) c.ep[8 + i] = 8 + permBuf[i];
  return c;
}

export function applyMoveIdx(c: Cube, m: number): Cube {
  return applyMove(c, m);
}
