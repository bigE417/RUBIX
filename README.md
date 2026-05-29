# RUBIX

RUBIX is a browser-based 3D Rubik's Cube solver built with Vite, TypeScript, and Three.js. It lets you scramble a virtual cube, paint a real cube state onto the model, compute a solution, and step through the moves directly on the 3D preview.

## Highlights

- Interactive Three.js cube with orbit controls
- Manual turn pad for U, R, F, D, L, and B moves
- Paint mode for entering a physical cube state
- Two-phase solver implemented in TypeScript
- IDA* search over precomputed move/pruning tables
- Web Worker solver runtime so the UI stays responsive
- Step-by-step solution playback with copy support

## Solver Algorithm

RUBIX uses a two-phase solving approach inspired by Kociemba-style cubie coordinates.

Phase 1 searches for a sequence that moves the cube into a restricted subgroup by reducing orientation and slice coordinates. Phase 2 then solves the remaining permutation state using a smaller move set. The search is implemented with iterative deepening A* (IDA*), using pruning tables to avoid exploring branches that cannot lead to a solution within the current depth.

The cube state is stored as cubie arrays for corner permutation, corner orientation, edge permutation, and edge orientation. Painted sticker input is translated from a 54-facelet string into that cubie model before solving, which keeps manual input and turn-button scrambling on the same solver path.

## Performance

Solver tables are initialized in a Web Worker. The first solve may take longer because the worker builds the tables, while later solves reuse the initialized data. On typical laptop hardware, the app is designed to stay interactive while searching and usually returns practical solutions under 25 moves using RUBIX.

The rendered cube is lightweight: each sticker is a simple Three.js mesh, and moves update the cube state instantly instead of running expensive physical simulations.

## Architecture

- `src/main.ts` connects UI controls, paint mode, solve requests, and solution stepping.
- `src/cube/cubeVisual.ts` renders the 3D cube and handles sticker picking.
- `src/cube/cubeController.ts` owns the current cube state and painted facelets.
- `src/cube/faceletLayout.ts` maps visible sticker meshes to solver facelet IDs.
- `src/solver/cube.ts` implements cubie state and move application.
- `src/solver/facelet.ts` validates and translates painted facelets.
- `src/solver/tables.ts` builds move and pruning tables.
- `src/solver/search.ts` runs the two-phase IDA* search.
- `src/solver/worker.ts` keeps initialization and solving off the main thread.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Test

```bash
npm run test:solver
```

The solver test checks facelet layout, corner/edge mapping, single-turn validation, and basic solve behavior.

## Repository Notes

`node_modules/` and `dist/` are ignored because they are generated folders. Package README and LICENSE files inside `node_modules` belong to third-party dependencies and should not be edited or deleted from installed packages.
