import { applyMove, solvedCube } from "../solver/cube";
import { cubeToFacelets } from "../solver/faceletCube";
import type { Cube } from "../solver/types";
import { parseMoveToken } from "../solver/moves";
import { Facelet, isCenterFacelet } from "./faceletEnum";

export class CubeController {
  cubie: Cube = solvedCube();
  manualFacelets: string | null = null;

  reset(): void {
    this.cubie = solvedCube();
    this.manualFacelets = null;
  }

  setCubie(cube: Cube): void {
    this.cubie = {
      cp: new Int8Array(cube.cp),
      co: new Int8Array(cube.co),
      ep: new Int8Array(cube.ep),
      eo: new Int8Array(cube.eo),
    };
    this.manualFacelets = null;
  }

  getFaceletString(): string {
    if (this.manualFacelets) return this.manualFacelets;
    return cubeToFacelets(this.cubie);
  }

  applyMoveIndex(moveIdx: number): void {
    this.cubie = applyMove(this.cubie, moveIdx);
    this.manualFacelets = null;
  }

  applyMoveToken(token: string): number | null {
    const idx = parseMoveToken(token);
    if (idx === null) return null;
    this.applyMoveIndex(idx);
    return idx;
  }

  setPaintedFacelet(id: Facelet, color: string): void {
    if (isCenterFacelet(id)) return;
    const base = this.manualFacelets ?? cubeToFacelets(this.cubie);
    const arr = base.split("");
    arr[id] = color;
    this.manualFacelets = arr.join("");
  }

  isFullyPainted(): boolean {
    const s = this.getFaceletString();
    return s.length === 54 && !s.includes(" ") && /^[URFDLB]+$/.test(s);
  }
}
