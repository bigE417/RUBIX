import type { Cube } from "./types";

const cpU = [3, 0, 1, 2, 4, 5, 6, 7];
const coU = [0, 0, 0, 0, 0, 0, 0, 0];
const epU = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11];
const eoU = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const cpR = [4, 1, 2, 0, 7, 5, 6, 3];
const coR = [2, 0, 0, 1, 1, 0, 0, 2];
const epR = [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0];
const eoR = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const cpF = [1, 5, 2, 3, 0, 4, 6, 7];
const coF = [1, 2, 0, 0, 2, 1, 0, 0];
const epF = [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11];
const eoF = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];

const cpD = [0, 1, 2, 3, 5, 6, 7, 4];
const coD = [0, 0, 0, 0, 0, 0, 0, 0];
const epD = [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11];
const eoD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const cpL = [0, 2, 6, 3, 4, 1, 5, 7];
const coL = [0, 1, 2, 0, 0, 2, 1, 0];
const epL = [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11];
const eoL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const cpB = [0, 1, 3, 7, 4, 5, 2, 6];
const coB = [0, 0, 1, 2, 0, 0, 2, 1];
const epB = [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7];
const eoB = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];

interface MoveCubie {
  cp: Int8Array;
  co: Int8Array;
  ep: Int8Array;
  eo: Int8Array;
}

const BASIC: MoveCubie[] = [
  { cp: Int8Array.from(cpU), co: Int8Array.from(coU), ep: Int8Array.from(epU), eo: Int8Array.from(eoU) },
  { cp: Int8Array.from(cpR), co: Int8Array.from(coR), ep: Int8Array.from(epR), eo: Int8Array.from(eoR) },
  { cp: Int8Array.from(cpF), co: Int8Array.from(coF), ep: Int8Array.from(epF), eo: Int8Array.from(eoF) },
  { cp: Int8Array.from(cpD), co: Int8Array.from(coD), ep: Int8Array.from(epD), eo: Int8Array.from(eoD) },
  { cp: Int8Array.from(cpL), co: Int8Array.from(coL), ep: Int8Array.from(epL), eo: Int8Array.from(eoL) },
  { cp: Int8Array.from(cpB), co: Int8Array.from(coB), ep: Int8Array.from(epB), eo: Int8Array.from(eoB) },
];

const OUR_MOVE_TO_KOCIEMBA: number[] = [
  0, 1, 2,
  9, 10, 11,
  3, 4, 5,
  12, 13, 14,
  6, 7, 8,
  15, 16, 17,
];

function multiply(a: Cube, b: MoveCubie): Cube {
  const cp = new Int8Array(8);
  const co = new Int8Array(8);
  const ep = new Int8Array(12);
  const eo = new Int8Array(12);

  for (let c = 0; c < 8; c++) {
    const from = b.cp[c];
    cp[c] = a.cp[from];
    let ori = a.co[from] + b.co[c];
    if (ori >= 3) ori -= 3;
    co[c] = ori;
  }

  for (let e = 0; e < 12; e++) {
    const from = b.ep[e];
    ep[e] = a.ep[from];
    eo[e] = (b.eo[e] + a.eo[from]) & 1;
  }

  return { cp, co, ep, eo };
}

const MOVE_CUBIES: MoveCubie[] = (() => {
  const id: MoveCubie = {
    cp: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    co: new Int8Array(8),
    ep: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    eo: new Int8Array(12),
  };
  const out: MoveCubie[] = [];
  for (let f = 0; f < 6; f++) {
    let acc = id;
    for (let k = 0; k < 3; k++) {
      acc = multiply(acc, BASIC[f]);
      out.push({
        cp: new Int8Array(acc.cp),
        co: new Int8Array(acc.co),
        ep: new Int8Array(acc.ep),
        eo: new Int8Array(acc.eo),
      });
    }
  }
  return out;
})();

export function solvedCube(): Cube {
  return {
    cp: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    co: new Int8Array(8),
    ep: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    eo: new Int8Array(12),
  };
}

export function applyMove(c: Cube, moveIdx: number): Cube {
  return multiply(c, MOVE_CUBIES[OUR_MOVE_TO_KOCIEMBA[moveIdx]]);
}

export function cloneCube(c: Cube): Cube {
  return {
    cp: new Int8Array(c.cp),
    co: new Int8Array(c.co),
    ep: new Int8Array(c.ep),
    eo: new Int8Array(c.eo),
  };
}

export function rawTurn(c: Cube, face: number): Cube {
  return applyMove(c, face * 3);
}

export function kociembaMoveEp(moveI: number): number[] {
  return [...MOVE_CUBIES[moveI].ep];
}
