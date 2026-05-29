import { FACELET_GRID } from "./faceletLayout";
import { Facelet } from "./faceletEnum";
import type { FaceId } from "./colors";
import { runEdgeSelfTest } from "./layoutEdgeTest";
import { runOctantSelfTest } from "./layoutOctantTest";

const CORNER_CHECKS: [Facelet, Facelet, Facelet][] = [
  [Facelet.U9, Facelet.R3, Facelet.F1],
  [Facelet.U7, Facelet.F3, Facelet.L1],
  [Facelet.U1, Facelet.L3, Facelet.B1],
  [Facelet.U3, Facelet.B3, Facelet.R1],
  [Facelet.D3, Facelet.F9, Facelet.R9],
  [Facelet.D1, Facelet.L9, Facelet.F7],
  [Facelet.D7, Facelet.B9, Facelet.L7],
  [Facelet.D9, Facelet.R7, Facelet.B7],
];

function findFacelet(id: Facelet): { face: FaceId; row: number; col: number } {
  for (const face of Object.keys(FACELET_GRID) as FaceId[]) {
    const grid = FACELET_GRID[face];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (grid[row][col] === id) return { face, row, col };
      }
    }
  }
  throw new Error(`facelet ${id} missing`);
}

export function runLayoutSelfTest(): void {
  for (const [a, b, c] of CORNER_CHECKS) {
    const pa = findFacelet(a);
    const pb = findFacelet(b);
    const pc = findFacelet(c);
    if (pa.face === pb.face || pa.face === pc.face) {
      throw new Error(`corner layout overlap ${a} ${b} ${c}`);
    }
  }
  runEdgeSelfTest();
  runOctantSelfTest();
  console.log("facelet 3D layout: OK");
}
