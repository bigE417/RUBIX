# RUBIX

RUBIX is a public web app for solving a 3D Rubik's Cube in the browser. Users can scramble the virtual cube, paint the state of a real cube, solve it, and step through the solution moves on the preview.

## Live App

```txt
rubix-c676na1bf-bige417s-projects.vercel.app
```

## What It Does

- Shows an interactive 3D cube preview
- Supports manual scramble moves: U, R, F, D, L, and B
- Lets users paint a real cube state onto the model
- Validates color counts and cube configuration before solving
- Computes a practical solution under 25 moves using RUBIX
- Lets users step through the solution move by move

## How to Use

1. Open the hosted RUBIX link.
2. Scramble with the move buttons, or turn `Paint on` and fill the stickers from a real cube.
3. Press `Solve cube`.
4. Use `Next`, `Prev`, and `Scramble` to inspect the solution.
5. Press `Reset to solved` to unlock editing and start again.

## Solver

RUBIX stores cube state as cubie data: corner permutation, corner orientation, edge permutation, and edge orientation. Turn-button scrambles update that model directly. Painted input is first converted into a 54-facelet string, validated, and translated into the same cubie model.

The solver uses a two-phase search algorithm (the conventional search with bfs and all is too slow and gives less optimal solutions with more number of moves):

- Phase 1 reduces orientation and slice coordinates to move the cube into a restricted subgroup.
- Phase 2 solves the remaining permutation state with a smaller move set.

The search uses iterative deepening A* with precomputed move and pruning tables. Solver setup and search run inside a Web Worker so the page stays responsive.

## Performance

The first solve can be slower because lookup tables are initialized. Later solves reuse those tables. The 3D view is lightweight: stickers are simple Three.js meshes, and cube state updates instantly. It manages to solve under a fraction of a second with a solution of less than 25 moves from all the possible valid positions.

## Tech Stack

- Vite
- TypeScript
- Three.js
- Web Workers
- Custom cubie-model solver

## Project Structure

```txt
RUBIX/
  index.html
  package.json
  README.md
  src/
    main.ts
    styles.css
    cube/
    solver/
```

## Developer Notes

For local development:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

For solver/layout checks:

```bash
npm run test:solver
```

`node_modules/` and `dist/` are ignored because they are generated folders.
