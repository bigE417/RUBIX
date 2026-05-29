import { FACELET_GRID, FACE_GEOMETRY } from "./faceletLayout";
import { edgeFacelets } from "../solver/types";
import { Facelet } from "./faceletEnum";
import type { FaceId } from "./colors";

const OFFSET = 1.52;
const STEP = 0.98;

function stickerPos(face: FaceId, row: number, col: number): [number, number, number] {
  const g = FACE_GEOMETRY[face];
  const [nx, ny, nz] = g.normal;
  const [rx, ry, rz] = g.right;
  const [ux, uy, uz] = g.up;
  const dc = (col - 1) * STEP;
  const dr = (1 - row) * STEP;
  return [
    nx * OFFSET + rx * dc + ux * dr,
    ny * OFFSET + ry * dc + uy * dr,
    nz * OFFSET + rz * dc + uz * dr,
  ];
}

function findFacelet(id: Facelet): { face: FaceId; row: number; col: number } {
  for (const face of Object.keys(FACELET_GRID) as FaceId[]) {
    const grid = FACELET_GRID[face];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (grid[row][col] === id) return { face, row, col };
      }
    }
  }
  throw new Error(`missing ${id}`);
}

export function runEdgeSelfTest(): void {
  const failures: string[] = [];
  for (let i = 0; i < 12; i++) {
    const [a, b] = edgeFacelets[i];
    const fa = findFacelet(a as Facelet);
    const fb = findFacelet(b as Facelet);
    const pa = stickerPos(fa.face, fa.row, fa.col);
    const pb = stickerPos(fb.face, fb.row, fb.col);
    const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
    if (d > STEP * 1.05) {
      failures.push(
        `edge${i} ${Facelet[a]}+${Facelet[b]} dist=${d.toFixed(3)} ${fa.face}[${fa.row},${fa.col}] ${fb.face}[${fb.row},${fb.col}]`,
      );
    }
  }
  if (failures.length) {
    console.log(failures.join("\n"));
    throw new Error(`edge layout: ${failures.length} mismatches`);
  }
  console.log("facelet edge layout: OK");
}
