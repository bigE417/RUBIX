import { MOVE_NAMES } from "./types";

const FACE_BASE: Record<string, number> = {
  U: 0, D: 3, R: 6, L: 9, F: 12, B: 15,
};

export function parseMoveToken(token: string): number | null {
  const t = token.trim().toUpperCase();
  if (!t) return null;
  const face = t[0];
  const base = FACE_BASE[face];
  if (base === undefined) return null;
  if (t.includes("2")) return base + 1;
  if (t.includes("'")) return base + 2;
  return base;
}

export function parseAlgorithm(alg: string): number[] {
  const out: number[] = [];
  for (const token of alg.trim().split(/\s+/)) {
    const m = parseMoveToken(token);
    if (m !== null) out.push(m);
  }
  return out;
}

export function moveIndexToToken(m: number): string {
  return MOVE_NAMES[m] ?? "";
}
