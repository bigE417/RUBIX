export interface Cube {
  cp: Int8Array;
  co: Int8Array;
  ep: Int8Array;
  eo: Int8Array;
}

export const MOVE_NAMES = [
  "U", "U2", "U'", "D", "D2", "D'",
  "R", "R2", "R'", "L", "L2", "L'",
  "F", "F2", "F'", "B", "B2", "B'",
] as const;

export const P2_MOVES = [0, 1, 2, 3, 4, 5, 7, 10, 13, 16];

export const N_CO = 2187;
export const N_EO = 2048;
export const N_SLICE = 11880;
export const N_CP = 40320;
export const N_EP8 = 40320;
export const N_EP4 = 24;
export const N_EP_COMB = 967680;

export const cornerFacelets: readonly (readonly [number, number, number])[] = [
  [8, 11, 18], [6, 20, 36], [0, 38, 45], [2, 47, 9],
  [29, 26, 17], [27, 44, 24], [33, 53, 42], [35, 15, 51],
];

export const edgeFacelets: readonly (readonly [number, number])[] = [
  [5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25],
  [30, 43], [34, 52], [23, 14], [21, 39], [50, 41], [48, 12],
];

export const cornerColors = [
  "URF", "UFL", "ULB", "UBR", "DFR", "DLF", "DBL", "DRB",
] as const;

export const edgeColors = [
  "UR", "UF", "UL", "UB", "DR", "DF", "DL", "DB", "FR", "FL", "BL", "BR",
] as const;

export const FACES = "URFDLB";
