import { applyMove } from "./cube";
import type { Cube } from "./types";
import { getCO, getCP, getEO, getEP4, getEP8, getSliceCoord } from "./coords";
import {
  coDist,
  coMove,
  cpDist,
  cpMove,
  eoDist,
  eoMove,
  ep4Move,
  ep8Move,
  epCombDist,
  getNibble,
  sliceDist,
  sliceMove,
} from "./tables";
import { MOVE_NAMES, P2_MOVES } from "./types";

function phase1H(co: number, eo: number, sl: number): number {
  return Math.max(getNibble(coDist, co), getNibble(eoDist, eo), getNibble(sliceDist, sl));
}

function phase2H(cp: number, ep8: number, ep4: number): number {
  return Math.max(getNibble(cpDist, cp), getNibble(epCombDist, ep8 * 24 + ep4));
}

function isRedundant(move: number, lastFace: number): boolean {
  return lastFace >= 0 && Math.floor(move / 3) === lastFace;
}

function searchPhase1(
  co: number,
  eo: number,
  sl: number,
  g: number,
  bound: number,
  lastFace: number,
  path: number[],
): boolean {
  const h = phase1H(co, eo, sl);
  if (g + h > bound) return false;
  if (h === 0) return true;

  const scored: { h: number; move: number; nco: number; neo: number; nsl: number }[] = [];
  for (let m = 0; m < 18; m++) {
    if (isRedundant(m, lastFace)) continue;
    const nco = coMove[co * 18 + m];
    const neo = eoMove[eo * 18 + m];
    const nsl = sliceMove[sl * 18 + m];
    scored.push({ h: phase1H(nco, neo, nsl), move: m, nco, neo, nsl });
  }
  scored.sort((a, b) => a.h - b.h);

  for (const node of scored) {
    path.push(node.move);
    if (searchPhase1(node.nco, node.neo, node.nsl, g + 1, bound, Math.floor(node.move / 3), path)) {
      return true;
    }
    path.pop();
  }
  return false;
}

function searchPhase2(
  cp: number,
  ep8: number,
  ep4: number,
  g: number,
  bound: number,
  lastFace: number,
  path: number[],
): boolean {
  const h = phase2H(cp, ep8, ep4);
  if (g + h > bound) return false;
  if (h === 0) return true;

  const scored: { h: number; move: number; ncp: number; nep8: number; nep4: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const m = P2_MOVES[i];
    if (isRedundant(m, lastFace)) continue;
    const ncp = cpMove[cp * 10 + i];
    const nep8 = ep8Move[ep8 * 10 + i];
    const nep4 = ep4Move[ep4 * 10 + i];
    scored.push({ h: phase2H(ncp, nep8, nep4), move: m, ncp, nep8, nep4 });
  }
  scored.sort((a, b) => a.h - b.h);

  for (const node of scored) {
    path.push(node.move);
    if (searchPhase2(node.ncp, node.nep8, node.nep4, g + 1, bound, Math.floor(node.move / 3), path)) {
      return true;
    }
    path.pop();
  }
  return false;
}

export function solveCube(scramble: Cube): { phase1: number[]; phase2: number[] } {
  const co = getCO(scramble);
  const eo = getEO(scramble);
  const sl = getSliceCoord(scramble);
  const p1Path: number[] = [];
  let bound = phase1H(co, eo, sl);

  while (bound <= 20) {
    if (searchPhase1(co, eo, sl, 0, bound, -1, p1Path)) break;
    bound++;
  }
  if (p1Path.length === 0 && phase1H(co, eo, sl) > 0) {
    return { phase1: [], phase2: [] };
  }

  let curr = scramble;
  for (const m of p1Path) curr = applyMove(curr, m);

  const cp = getCP(curr);
  const ep8 = getEP8(curr);
  const ep4 = getEP4(curr);
  const p2Path: number[] = [];
  bound = phase2H(cp, ep8, ep4);

  while (bound <= 22) {
    if (searchPhase2(cp, ep8, ep4, 0, bound, -1, p2Path)) break;
    bound++;
  }

  return { phase1: p1Path, phase2: p2Path };
}

export function movesToString(moves: readonly number[]): string {
  return moves.map((m) => MOVE_NAMES[m]).join(" ");
}

export function allMovesToString(p1: readonly number[], p2: readonly number[]): string {
  const all = [...p1, ...p2];
  return movesToString(all);
}
