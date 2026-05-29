import { applyMove, solvedCube } from "./cube";
import type { Cube } from "./types";
import {
  cornerColors,
  cornerFacelets,
  edgeColors,
  edgeFacelets,
  MOVE_NAMES,
} from "./types";

const CENTER_FACELET: readonly [number, string][] = [
  [4, "U"], [13, "R"], [22, "F"], [31, "D"], [40, "L"], [49, "B"],
];

export function cubeToFacelets(c: Cube): string {
  const out = new Array<string>(54);
  for (const [idx, col] of CENTER_FACELET) out[idx] = col;
  for (let i = 0; i < 8; i++) {
    const piece = cornerColors[c.cp[i]];
    for (let k = 0; k < 3; k++) {
      const slot = cornerFacelets[i][(k + c.co[i]) % 3];
      out[slot] = piece[k];
    }
  }
  for (let i = 0; i < 12; i++) {
    const piece = edgeColors[c.ep[i]];
    for (let k = 0; k < 2; k++) {
      const slot = edgeFacelets[i][(k + c.eo[i]) % 2];
      out[slot] = piece[k];
    }
  }
  return out.join("");
}

export function scrambleCube(moveCount = 25): { facelets: string; algorithm: string } {
  let cube = solvedCube();
  const moves: number[] = [];
  let lastFace = -1;
  for (let i = 0; i < moveCount; i++) {
    let m: number;
    do {
      m = Math.floor(Math.random() * 18);
    } while (Math.floor(m / 3) === lastFace);
    lastFace = Math.floor(m / 3);
    cube = applyMove(cube, m);
    moves.push(m);
  }
  const algorithm = moves.map((m) => MOVE_NAMES[m]).join(" ");
  return { facelets: cubeToFacelets(cube), algorithm };
}
