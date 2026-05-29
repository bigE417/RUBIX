import type { FaceId } from "./colors";
import { FACE_ORDER } from "./colors";
import type { StickerGrid } from "./state";

export function faceletsToGrid(facelets: string): StickerGrid {
  const grid = {} as StickerGrid;
  let o = 0;
  for (const f of FACE_ORDER) {
    grid[f] = [];
    for (let i = 0; i < 9; i++) {
      grid[f][i] = facelets[o++] as FaceId;
    }
  }
  return grid;
}
