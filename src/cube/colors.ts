export type FaceId = "U" | "R" | "F" | "D" | "L" | "B";

export const FACE_ORDER: FaceId[] = ["U", "R", "F", "D", "L", "B"];

export const FACE_HEX: Record<FaceId, number> = {
  U: 0xffffff,
  R: 0xff0000,
  F: 0x00cc44,
  D: 0xffdd00,
  L: 0xff8800,
  B: 0x0066ff,
};

export const UNPAINTED = 0x2a2a32;
export const UNPAINTED_CHAR = "";

export const PALETTE: { face: FaceId; label: string; css: string }[] = [
  { face: "U", label: "Up (white)", css: "#ffffff" },
  { face: "R", label: "Right (red)", css: "#ff0000" },
  { face: "F", label: "Front (green)", css: "#00cc44" },
  { face: "D", label: "Down (yellow)", css: "#ffdd00" },
  { face: "L", label: "Left (orange)", css: "#ff8800" },
  { face: "B", label: "Back (blue)", css: "#0066ff" },
];
