import { solvedCube } from "./cube";
import type { Cube } from "./types";
import { validateAndTranslate } from "./facelet";
import { initSolverTables } from "./tables";
import { allMovesToString, movesToString, solveCube } from "./search";

export interface SolveResult {
  ok: true;
  phase1: string;
  phase2: string;
  algorithm: string;
  totalMoves: number;
  executionTimeMs: number;
}

export interface SolveError {
  ok: false;
  error: string;
}

export type SolveResponse = SolveResult | SolveError;

let ready = false;

export function initSolver(): void {
  if (!ready) {
    initSolverTables();
    ready = true;
  }
}

export function isSolverReady(): boolean {
  return ready;
}

export function solveFacelets(faceletStr: string): SolveResponse {
  if (!ready) initSolver();

  const cube: Cube = solvedCube();
  const err = validateAndTranslate(faceletStr, cube);
  if (err) return { ok: false, error: err };

  const t0 = performance.now();
  const { phase1, phase2 } = solveCube(cube);
  const ms = performance.now() - t0;

  const alg = [...phase1, ...phase2];

  return {
    ok: true,
    phase1: phase1.length ? movesToString(phase1) : "(none)",
    phase2: phase2.length ? movesToString(phase2) : "(none)",
    algorithm: alg.length ? allMovesToString(phase1, phase2) : "",
    totalMoves: alg.length,
    executionTimeMs: ms,
  };
}

export { faceletNetString } from "./facelet";
export { MOVE_NAMES } from "./types";
