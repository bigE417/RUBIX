import type { FaceId } from "./colors";
import { FACE_ORDER, FACE_HEX, UNPAINTED_CHAR } from "./colors";

export type StickerGrid = Record<FaceId, (FaceId | typeof UNPAINTED_CHAR)[]>;

export function emptyGrid(): StickerGrid {
  const g = {} as StickerGrid;
  for (const f of FACE_ORDER) {
    g[f] = Array(9).fill(UNPAINTED_CHAR);
    g[f][4] = f;
  }
  return g;
}

export function gridToFacelets(grid: StickerGrid): string {
  let s = "";
  for (const f of FACE_ORDER) {
    for (let i = 0; i < 9; i++) s += grid[f][i] || UNPAINTED_CHAR;
  }
  return s;
}

export function countColors(grid: StickerGrid): { unpainted: number; invalid: boolean } {
  const counts: Record<string, number> = {};
  let unpainted = 0;
  for (const f of FACE_ORDER) {
    for (let i = 0; i < 9; i++) {
      const c = grid[f][i];
      if (!c) {
        unpainted++;
        continue;
      }
      counts[c] = (counts[c] ?? 0) + 1;
    }
  }
  const invalid = Object.values(counts).some((n) => n !== 9);
  return { unpainted, invalid };
}

export function isComplete(grid: StickerGrid): boolean {
  const { unpainted, invalid } = countColors(grid);
  return unpainted === 0 && !invalid;
}

export function resetGrid(grid: StickerGrid): void {
  for (const f of FACE_ORDER) {
    for (let i = 0; i < 9; i++) grid[f][i] = i === 4 ? f : UNPAINTED_CHAR;
  }
}

export function randomScrambleMoves(n = 25): string {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const suffix = ["", "2", "'"];
  const moves: string[] = [];
  let last = "";
  for (let i = 0; i < n; i++) {
    let f: string;
    do {
      f = faces[Math.floor(Math.random() * faces.length)];
    } while (f === last);
    last = f;
    moves.push(f + suffix[Math.floor(Math.random() * 3)]);
  }
  return moves.join(" ");
}

export function applyAlgToGrid(grid: StickerGrid, alg: string): void {
  for (const token of alg.trim().split(/\s+/)) {
    if (!token) continue;
    const face = token[0] as FaceId;
    const prime = token.includes("'");
    const double = token.includes("2");
    const times = double ? 2 : 1;
    for (let t = 0; t < times; t++) rotateFace(grid, face, prime);
  }
}

function rotateFace(grid: StickerGrid, face: FaceId, ccw: boolean): void {
  const f = [...grid[face]];
  const rot = (arr: (FaceId | "")[], cw: boolean) => {
    const a = [...arr];
  if (cw) return [a[6], a[3], a[0], a[7], a[4], a[1], a[8], a[5], a[2]];
    return [a[2], a[5], a[8], a[1], a[4], a[7], a[0], a[3], a[6]];
  };
  grid[face] = rot(f, !ccw);

  const cycle = FACE_CYCLES[face];
  const strips = cycle.map(([fn, indices]) =>
    indices.map((i) => grid[fn][i]),
  );
  const n = strips.length;
  for (let i = 0; i < n; i++) {
    const src = ccw ? (i + 1) % n : (i - 1 + n) % n;
    const [fn, indices] = cycle[i];
    indices.forEach((idx, j) => {
      grid[fn][idx] = strips[src][j];
    });
  }
}

type CycleEntry = [face: FaceId, indices: number[]];

const FACE_CYCLES: Record<FaceId, CycleEntry[]> = {
  U: [
    ["F", [0, 1, 2]],
    ["R", [0, 1, 2]],
    ["B", [0, 1, 2]],
    ["L", [0, 1, 2]],
  ],
  D: [
    ["F", [6, 7, 8]],
    ["R", [6, 7, 8]],
    ["B", [6, 7, 8]],
    ["L", [6, 7, 8]],
  ],
  F: [
    ["U", [6, 7, 8]],
    ["R", [0, 3, 6]],
    ["D", [2, 1, 0]],
    ["L", [8, 5, 2]],
  ],
  B: [
    ["U", [0, 1, 2]],
    ["L", [0, 3, 6]],
    ["D", [8, 7, 6]],
    ["R", [8, 5, 2]],
  ],
  R: [
    ["U", [8, 5, 2]],
    ["B", [6, 3, 0]],
    ["D", [8, 5, 2]],
    ["F", [8, 5, 2]],
  ],
  L: [
    ["U", [0, 3, 6]],
    ["F", [0, 3, 6]],
    ["D", [0, 3, 6]],
    ["B", [8, 5, 2]],
  ],
};
