import { CubeController } from "./cube/cubeController";
import { CubeVisual } from "./cube/cubeVisual";

import { PALETTE } from "./cube/colors";
import { applyMove, cloneCube, solvedCube } from "./solver/cube";
import { validateAndTranslate } from "./solver/facelet";
import { moveIndexToToken, parseAlgorithm, parseMoveToken } from "./solver/moves";
import type { SolveResponse } from "./solver";
import type { Cube } from "./solver/types";
import type { WorkerIn, WorkerOut } from "./solver/worker";

const canvas = document.getElementById("cube-canvas") as HTMLCanvasElement;
const paletteEl = document.getElementById("palette")!;
const paintToggleBtn = document.getElementById("paint-toggle") as HTMLButtonElement;
const movePadEl = document.getElementById("move-pad")!;
const solveBtn = document.getElementById("solve-btn") as HTMLButtonElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const undoBtn = document.getElementById("undo-btn") as HTMLButtonElement;
const statusEl = document.getElementById("status")!;
const solutionBox = document.getElementById("solution-box")!;
const solutionMoves = document.getElementById("solution-moves")!;
const solutionStepLabel = document.getElementById("solution-step")!;
const copyBtn = document.getElementById("copy-btn")!;
const solPrevBtn = document.getElementById("sol-prev") as HTMLButtonElement;
const solNextBtn = document.getElementById("sol-next") as HTMLButtonElement;
const solResetBtn = document.getElementById("sol-reset") as HTMLButtonElement;

const controller = new CubeController();
const visual = new CubeVisual(canvas, controller);
const scrambleHistory: number[] = [];
let lastSolution: number[] = [];
let solutionStartCube: Cube | null = null;
let lastAlgorithm = "";
let solutionStep = 0;
let solveId = 0;
let interactionsLocked = false;
let paintingEnabled = false;
const moveButtons: HTMLButtonElement[] = [];
const swatchButtons: HTMLButtonElement[] = [];
const COLOR_FACES = ["U", "R", "F", "D", "L", "B"] as const;

function setStatus(text: string, kind: "ok" | "err" | "busy" | "" = "") {
  statusEl.textContent = text;
  statusEl.className = "status" + (kind ? ` ${kind}` : "");
}

function updatePaintToggle(): void {
  paintToggleBtn.textContent = paintingEnabled ? "Paint on" : "Paint off";
  paintToggleBtn.setAttribute("aria-pressed", String(paintingEnabled));
  paintToggleBtn.classList.toggle("active", paintingEnabled);
  visual.setPaintingEnabled(paintingEnabled && !interactionsLocked);
}

function setInteractionsLocked(locked: boolean): void {
  interactionsLocked = locked;
  moveButtons.forEach((btn) => {
    btn.disabled = locked;
  });
  swatchButtons.forEach((btn) => {
    btn.disabled = locked;
  });
  undoBtn.disabled = locked || scrambleHistory.length === 0;
  paintToggleBtn.disabled = locked;
  updatePaintToggle();
}

function invertMoveIndex(m: number): number {
  const face = Math.floor(m / 3);
  const mod = m % 3;
  if (mod === 0) return face * 3 + 2;
  if (mod === 2) return face * 3;
  return face * 3 + 1;
}

function colorCountError(facelets: string): string {
  const counts = Object.fromEntries(COLOR_FACES.map((face) => [face, 0])) as Record<string, number>;
  for (const ch of facelets) {
    if (ch in counts) counts[ch]++;
  }
  const wrong = COLOR_FACES.filter((face) => counts[face] !== 9);
  if (!wrong.length) return "";
  return `Each color should appear exactly 9 times. Current counts: ${COLOR_FACES.map((face) => `${face}=${counts[face]}`).join(", ")}. Reset to edit again.`;
}

function applySolutionStep(step: number): void {
  if (!solutionStartCube) return;
  let cube = cloneCube(solutionStartCube);
  for (let i = 0; i < step; i++) cube = applyMove(cube, lastSolution[i]);
  controller.setCubie(cube);
  visual.syncFromController();
}

function renderSolutionMoves(): void {
  if (!lastSolution.length) {
    solutionMoves.textContent = lastAlgorithm || "(already solved)";
    return;
  }
  solutionMoves.innerHTML = lastSolution
    .map((m, i) => {
      const state = i < solutionStep ? " done" : i === solutionStep ? " current" : "";
      return `<span class="solution-token${state}">${moveIndexToToken(m)}</span>`;
    })
    .join(" ");
}

function updateSolutionUI(): void {
  const total = lastSolution.length;
  if (total === 0) {
    solutionStepLabel.textContent = "Already solved.";
    solPrevBtn.disabled = true;
    solNextBtn.disabled = true;
    solResetBtn.disabled = true;
    renderSolutionMoves();
    return;
  }
  if (solutionStep === 0) {
    solutionStepLabel.textContent = `Step 0 of ${total} - scrambled cube`;
  } else {
    const lastMove = moveIndexToToken(lastSolution[solutionStep - 1]);
    const nextMove = solutionStep < total ? `, next ${moveIndexToToken(lastSolution[solutionStep])}` : ", solved";
    solutionStepLabel.textContent = `Step ${solutionStep} of ${total}: ${lastMove}${nextMove}`;
  }
  solPrevBtn.disabled = solutionStep <= 0;
  solNextBtn.disabled = solutionStep >= total;
  solResetBtn.disabled = false;
  renderSolutionMoves();
}

PALETTE.forEach((p, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "swatch" + (i === 0 ? " selected" : "");
  btn.style.background = p.css;
  btn.title = p.label;
  btn.innerHTML = `<span>${p.face}</span>`;
  btn.addEventListener("click", () => {
    if (interactionsLocked) return;
    document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
    btn.classList.add("selected");
    visual.setPaintColor(p.face);
  });
  swatchButtons.push(btn);
  paletteEl.appendChild(btn);
});

const FACES = ["U", "R", "F", "D", "L", "B"] as const;
const MODS = ["", "'", "2"] as const;

for (const f of FACES) {
  for (const mod of MODS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "move-btn";
    btn.textContent = f + mod;
    btn.addEventListener("click", () => {
      if (interactionsLocked || visual.isBusy) return;
      const idx = parseMoveToken(f + mod);
      if (idx === null) return;
      scrambleHistory.push(idx);
      undoBtn.disabled = false;
      solutionBox.classList.add("hidden");
      visual.applyMoveInstant(idx);
    });
    moveButtons.push(btn);
    movePadEl.appendChild(btn);
  }
}

paintToggleBtn.addEventListener("click", () => {
  if (interactionsLocked) return;
  paintingEnabled = !paintingEnabled;
  updatePaintToggle();
});

const worker = new Worker(new URL("./solver/worker.ts", import.meta.url), { type: "module" });
worker.postMessage({ type: "init" } satisfies WorkerIn);

worker.onmessage = (ev: MessageEvent<WorkerOut>) => {
  const msg = ev.data;
  if (msg.type === "ready") {
    solveBtn.disabled = false;
    solveBtn.textContent = "Solve cube";
    setStatus("Solver ready. Scramble with the turn buttons, or turn Paint on and choose colors to fill a real cube, then solve.", "ok");
    return;
  }
  if (msg.type === "solve" && msg.id === solveId) {
    handleSolveResult(msg.result);
  }
};

function handleSolveResult(result: SolveResponse): void {
  if (!result.ok) {
    setStatus(result.error, "err");
    solutionBox.classList.add("hidden");
    return;
  }

  lastAlgorithm = result.algorithm;
  lastSolution = parseAlgorithm(result.algorithm);
  solutionStep = 0;
  applySolutionStep(0);

  setStatus(`Solved in ${result.executionTimeMs.toFixed(1)} ms - ${lastSolution.length} moves`, "ok");
  solutionBox.classList.remove("hidden");
  updateSolutionUI();
}

solveBtn.addEventListener("click", () => {
  setInteractionsLocked(true);
  const facelets = controller.getFaceletString();
  solutionBox.classList.add("hidden");
  solutionStartCube = null;

  if (!controller.isFullyPainted()) {
    setStatus(colorCountError(facelets) || "Each color should appear exactly 9 times. Reset to edit again.", "err");
    solveBtn.disabled = true;
    return;
  }

  const startCube = solvedCube();
  const translateErr = validateAndTranslate(facelets, startCube);
  if (translateErr) {
    const message = translateErr === "Each color must appear exactly 9 times."
      ? colorCountError(facelets)
      : "Invalid configuration. Reset to edit again.";
    setStatus(message, "err");
    solveBtn.disabled = true;
    return;
  }
  solutionStartCube = cloneCube(startCube);

  solveBtn.disabled = true;
  setStatus("Searching (IDA*)...", "busy");
  solveId++;
  worker.postMessage({ type: "solve", facelets, id: solveId } satisfies WorkerIn);
});

resetBtn.addEventListener("click", () => {
  controller.reset();
  scrambleHistory.length = 0;
  visual.syncFromController();
  solutionBox.classList.add("hidden");
  lastAlgorithm = "";
  lastSolution = [];
  solutionStartCube = null;
  solutionStep = 0;
  paintingEnabled = false;
  solveBtn.disabled = false;
  solveBtn.textContent = "Solve cube";
  setInteractionsLocked(false);
  setStatus("Solved. Scramble with the turn buttons.", "");
});

undoBtn.addEventListener("click", () => {
  if (interactionsLocked || !scrambleHistory.length || visual.isBusy) return;
  const last = scrambleHistory.pop()!;
  visual.applyMoveInstant(invertMoveIndex(last));
  undoBtn.disabled = scrambleHistory.length === 0;
  solutionBox.classList.add("hidden");
});

copyBtn.addEventListener("click", async () => {
  if (!lastAlgorithm) return;
  await navigator.clipboard.writeText(lastAlgorithm);
  setStatus("Algorithm copied.", "ok");
});

solNextBtn.addEventListener("click", () => {
  if (solutionStep >= lastSolution.length) return;
  solutionStep++;
  applySolutionStep(solutionStep);
  updateSolutionUI();
});

solPrevBtn.addEventListener("click", () => {
  if (solutionStep <= 0) return;
  solutionStep--;
  applySolutionStep(solutionStep);
  updateSolutionUI();
});

solResetBtn.addEventListener("click", () => {
  solutionStep = 0;
  applySolutionStep(0);
  updateSolutionUI();
});

setInteractionsLocked(false);
