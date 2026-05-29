import type { FaceId } from "./colors";
import { Facelet } from "./faceletEnum";

export const FACELET_GRID: Record<FaceId, readonly (readonly Facelet[])[]> = {
  U: [
    [Facelet.U1, Facelet.U2, Facelet.U3],
    [Facelet.U4, Facelet.U5, Facelet.U6],
    [Facelet.U7, Facelet.U8, Facelet.U9],
  ],
  R: [
    [Facelet.R1, Facelet.R2, Facelet.R3],
    [Facelet.R4, Facelet.R5, Facelet.R6],
    [Facelet.R7, Facelet.R8, Facelet.R9],
  ],
  F: [
    [Facelet.F3, Facelet.F2, Facelet.F1],
    [Facelet.F4, Facelet.F5, Facelet.F6],
    [Facelet.F7, Facelet.F8, Facelet.F9],
  ],
  D: [
    [Facelet.D1, Facelet.D2, Facelet.D3],
    [Facelet.D4, Facelet.D5, Facelet.D6],
    [Facelet.D7, Facelet.D8, Facelet.D9],
  ],
  L: [
    [Facelet.L1, Facelet.L2, Facelet.L3],
    [Facelet.L4, Facelet.L5, Facelet.L6],
    [Facelet.L9, Facelet.L8, Facelet.L7],
  ],
  B: [
    [Facelet.B3, Facelet.B2, Facelet.B1],
    [Facelet.B4, Facelet.B5, Facelet.B6],
    [Facelet.B7, Facelet.B8, Facelet.B9],
  ],
};

export function meshToFaceletId(face: FaceId, row: number, col: number): Facelet {
  return FACELET_GRID[face][row][col];
}

export const FACE_GEOMETRY: Record<
  FaceId,
  { normal: [number, number, number]; right: [number, number, number]; up: [number, number, number] }
> = {
  U: { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  D: { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
  F: { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
  R: { normal: [1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
  L: { normal: [-1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
};
