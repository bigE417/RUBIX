import { FACELET_GRID, FACE_GEOMETRY } from "./faceletLayout";
import { Facelet } from "./faceletEnum";
import { cornerFacelets } from "../solver/types";
import type { FaceId } from "./colors";

const OFFSET = 1.52;
const STEP = 0.98;

const OCT: [number, number, number][] = [
  [1, 1, 1],
  [-1, 1, 1],
  [-1, 1, -1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, -1, 1],
  [-1, -1, -1],
  [1, -1, -1],
];

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

export function runOctantSelfTest(): void {
  const failures: string[] = [];
  for (let i = 0; i < 8; i++) {
    const [sx, sy, sz] = OCT[i];
    for (const id of cornerFacelets[i]) {
      const { face, row, col } = findFacelet(id as Facelet);
      const [x, y, z] = stickerPos(face, row, col);
      const signs: [number, number, number] = [
        Math.sign(x) || 0,
        Math.sign(y) || 0,
        Math.sign(z) || 0,
      ];
      if (signs[0] !== sx || signs[1] !== sy || signs[2] !== sz) {
        failures.push(
          `corner${i} ${Facelet[id]} on ${face}[${row},${col}] at [${signs.join(",")}] want [${sx},${sy},${sz}]`,
        );
      }
    }
  }
  if (failures.length) {
    console.log(failures.join("\n"));
    throw new Error(`octant layout: ${failures.length} mismatches`);
  }
  console.log("facelet octant layout: OK");
}

