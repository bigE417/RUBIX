import { solvedCube } from "./cube";
import type { Cube } from "./types";
import {
  cornerColors,
  cornerFacelets,
  edgeColors,
  edgeFacelets,
  FACES,
} from "./types";

function hasColors(piece: string, a: string, b: string, c: string): boolean {
  return piece.includes(a) && piece.includes(b) && piece.includes(c);
}

export function validateAndTranslate(facelets: string, out: Cube): string {
  if (facelets.length !== 54) {
    return "Input must be exactly 54 facelets (URFDLB order).";
  }

  const counts: Record<string, number> = {};
  for (const f of FACES) counts[f] = 0;
  for (const c of facelets) {
    if (!FACES.includes(c)) {
      return `Invalid color '${c}'. Use U R F D L B only.`;
    }
    counts[c]++;
  }
  for (const f of FACES) {
    if (counts[f] !== 9) {
      return "Each color must appear exactly 9 times.";
    }
  }

  const solved = solvedCube();
  out.cp.set(solved.cp);
  out.co.set(solved.co);
  out.ep.set(solved.ep);
  out.eo.set(solved.eo);

  for (let i = 0; i < 8; i++) {
    const [f0, f1, f2] = cornerFacelets[i];
    const c1 = facelets[f0];
    const c2 = facelets[f1];
    const c3 = facelets[f2];

    let ori = -1;
    if (c1 === "U" || c1 === "D") ori = 0;
    else if (c2 === "U" || c2 === "D") ori = 1;
    else if (c3 === "U" || c3 === "D") ori = 2;
    if (ori < 0) return "Invalid corner sticker configuration.";

    out.co[i] = ori;
    const aligned = [0, 1, 2].map((k) => facelets[cornerFacelets[i][(ori + k) % 3]]).join("");

    let target = -1;
    for (let p = 0; p < 8; p++) {
      const pc = cornerColors[p];
      if (hasColors(pc, aligned[0], aligned[1], aligned[2])) {
        target = p;
        break;
      }
    }
    if (target < 0) return "Impossible corner piece mapping.";
    out.cp[i] = target;
  }

  for (let i = 0; i < 12; i++) {
    const [f0, f1] = edgeFacelets[i];
    const c1 = facelets[f0];
    const c2 = facelets[f1];
    let target = -1;
    let ori = -1;
    for (let p = 0; p < 12; p++) {
      const ec = edgeColors[p];
      if (c1 === ec[0] && c2 === ec[1]) {
        target = p;
        ori = 0;
        break;
      }
      if (c1 === ec[1] && c2 === ec[0]) {
        target = p;
        ori = 1;
        break;
      }
    }
    if (target < 0) return "Impossible edge piece mapping.";
    out.ep[i] = target;
    out.eo[i] = ori;
  }

  let coSum = 0;
  for (let i = 0; i < 8; i++) coSum += out.co[i];
  if (coSum % 3 !== 0) return "Corner orientation parity invalid.";

  let eoSum = 0;
  for (let i = 0; i < 12; i++) eoSum += out.eo[i];
  if (eoSum % 2 !== 0) return "Edge orientation parity invalid.";

  let cInv = 0;
  for (let i = 0; i < 8; i++)
    for (let j = i + 1; j < 8; j++) if (out.cp[i] > out.cp[j]) cInv++;
  let eInv = 0;
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++) if (out.ep[i] > out.ep[j]) eInv++;
  if ((cInv & 1) !== (eInv & 1)) return "Permutation parity mismatch (unsolvable).";

  return "";
}

export function faceletNetString(facelets: string): string {
  const U = facelets.slice(0, 9);
  const R = facelets.slice(9, 18);
  const F = facelets.slice(18, 27);
  const D = facelets.slice(27, 36);
  const L = facelets.slice(36, 45);
  const B = facelets.slice(45, 54);
  const row = (a: string, b: string, c: string, d: string) =>
    `${a.slice(0, 3)} ${b.slice(0, 3)} ${c.slice(0, 3)} ${d.slice(0, 3)}\n` +
    `${a.slice(3, 6)} ${b.slice(3, 6)} ${c.slice(3, 6)} ${d.slice(3, 6)}\n` +
    `${a.slice(6, 9)} ${b.slice(6, 9)} ${c.slice(6, 9)} ${d.slice(6, 9)}`;
  return (
    `    ${U.slice(0, 3)}\n` +
    `    ${U.slice(3, 6)}\n` +
    `    ${U.slice(6, 9)}\n` +
    row(L, F, R, B) +
    `    ${D.slice(0, 3)}\n` +
    `    ${D.slice(3, 6)}\n` +
    `    ${D.slice(6, 9)}`
  );
}
