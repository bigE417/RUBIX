import { CubeController } from "../cube/cubeController";
import { runLayoutSelfTest } from "../cube/layoutSelfTest";
import { initSolver, solveFacelets } from "./index";
import { validateAndTranslate } from "./facelet";
import { applyMove, kociembaMoveEp, solvedCube } from "./cube";
import { cubeToFacelets } from "./faceletCube";

export function runSelfTest(): void {
  runLayoutSelfTest();
  initSolver();
  const probes = [6, 8, 12, 14, 15, 0];
  for (const m of probes) {
    const c = new CubeController();
    c.applyMoveIndex(m);
    const s = c.getFaceletString();
    const cube = solvedCube();
    const err = validateAndTranslate(s, cube);
    if (err) throw new Error(`move ${m} invalid: ${err}`);
    const res = solveFacelets(s);
    if (!res.ok) throw new Error(`move ${m} solve failed: ${res.error}`);
    console.log(`move ${m} -> ${res.algorithm} (${res.totalMoves})`);
  }

  const epF = [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11];
  const fMove = 12;
  let c0 = solvedCube();
  c0 = applyMove(c0, fMove);
  if (c0.ep.some((v, i) => v !== epF[i])) {
    console.log("applyMove(12) ep", [...c0.ep]);
    throw new Error("F move ep mismatch vs Kociemba");
  }
  let c4 = solvedCube();
  for (let i = 0; i < 4; i++) c4 = applyMove(c4, 12);
  const id = solvedCube();
  if (c4.ep.some((v, i) => v !== id.ep[i]) || c4.cp.some((v, i) => v !== id.cp[i])) {
    throw new Error("F^4 should be identity");
  }

  for (const [m, faceChar, start] of [
    [12, "F", 18],
    [6, "R", 9],
    [9, "L", 36],
    [15, "B", 45],
  ] as [number, string, number][]) {
    const c = new CubeController();
    c.applyMoveIndex(m);
    const slice = c.getFaceletString().slice(start, start + 9);
    const expected = faceChar.repeat(9);
    if (slice !== expected) {
      throw new Error(`after ${faceChar} move, ${faceChar} face should be ${expected}, got ${slice}`);
    }
  }
  console.log("side face turns keep uniform face colors: OK");
}

runSelfTest();
