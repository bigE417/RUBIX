export enum Facelet {
  U1 = 0, U2, U3, U4, U5, U6, U7, U8, U9,
  R1, R2, R3, R4, R5, R6, R7, R8, R9,
  F1, F2, F3, F4, F5, F6, F7, F8, F9,
  D1, D2, D3, D4, D5, D6, D7, D8, D9,
  L1, L2, L3, L4, L5, L6, L7, L8, L9,
  B1, B2, B3, B4, B5, B6, B7, B8, B9,
}

export const CENTER_FACELETS: readonly [Facelet, string][] = [
  [Facelet.U5, "U"],
  [Facelet.R5, "R"],
  [Facelet.F5, "F"],
  [Facelet.D5, "D"],
  [Facelet.L5, "L"],
  [Facelet.B5, "B"],
];

export function isCenterFacelet(id: Facelet): boolean {
  return id === Facelet.U5 || id === Facelet.R5 || id === Facelet.F5 ||
    id === Facelet.D5 || id === Facelet.L5 || id === Facelet.B5;
}

export const FACE_INDEX = { U: 0, D: 1, R: 2, L: 3, F: 4, B: 5 } as const;

export const LAYER_FACELETS: Record<number, readonly Facelet[]> = {
  0: [
    Facelet.U1, Facelet.U2, Facelet.U3, Facelet.U4, Facelet.U5, Facelet.U6, Facelet.U7, Facelet.U8, Facelet.U9,
    Facelet.F1, Facelet.F2, Facelet.F3,
    Facelet.R1, Facelet.R2, Facelet.R3,
    Facelet.B1, Facelet.B2, Facelet.B3,
    Facelet.L1, Facelet.L2, Facelet.L3,
  ],
  1: [
    Facelet.D1, Facelet.D2, Facelet.D3, Facelet.D4, Facelet.D5, Facelet.D6, Facelet.D7, Facelet.D8, Facelet.D9,
    Facelet.F7, Facelet.F8, Facelet.F9,
    Facelet.R7, Facelet.R8, Facelet.R9,
    Facelet.B7, Facelet.B8, Facelet.B9,
    Facelet.L7, Facelet.L8, Facelet.L9,
  ],
  2: [
    Facelet.R1, Facelet.R2, Facelet.R3, Facelet.R4, Facelet.R5, Facelet.R6, Facelet.R7, Facelet.R8, Facelet.R9,
    Facelet.U3, Facelet.U6, Facelet.U9,
    Facelet.F1, Facelet.F6, Facelet.F9,
    Facelet.D3, Facelet.D6, Facelet.D9,
    Facelet.B3, Facelet.B4, Facelet.B7,
  ],
  3: [
    Facelet.L1, Facelet.L2, Facelet.L3, Facelet.L4, Facelet.L5, Facelet.L6, Facelet.L7, Facelet.L8, Facelet.L9,
    Facelet.U1, Facelet.U4, Facelet.U7,
    Facelet.F3, Facelet.F4, Facelet.F7,
    Facelet.D1, Facelet.D4, Facelet.D7,
    Facelet.B1, Facelet.B6, Facelet.B9,
  ],
  4: [
    Facelet.F1, Facelet.F2, Facelet.F3, Facelet.F4, Facelet.F5, Facelet.F6, Facelet.F7, Facelet.F8, Facelet.F9,
    Facelet.U7, Facelet.U8, Facelet.U9,
    Facelet.R3, Facelet.R6, Facelet.R9,
    Facelet.D1, Facelet.D2, Facelet.D3,
    Facelet.L1, Facelet.L4, Facelet.L9,
  ],
  5: [
    Facelet.B1, Facelet.B2, Facelet.B3, Facelet.B4, Facelet.B5, Facelet.B6, Facelet.B7, Facelet.B8, Facelet.B9,
    Facelet.U1, Facelet.U2, Facelet.U3,
    Facelet.L3, Facelet.L6, Facelet.L7,
    Facelet.D7, Facelet.D8, Facelet.D9,
    Facelet.R1, Facelet.R4, Facelet.R7,
  ],
};

export const ROTATION_AXIS: Record<number, [number, number, number]> = {
  0: [0, 1, 0],
  1: [0, -1, 0],
  2: [1, 0, 0],
  3: [-1, 0, 0],
  4: [0, 0, 1],
  5: [0, 0, -1],
};
