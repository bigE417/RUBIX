# RUBIX

RUBIX is a public web app for solving a 3D Rubik's Cube in the browser. Users can scramble the virtual cube, paint the state of a real cube, solve it, and step through the solution moves on the preview.

## Live App

Add the deployed Vercel link here after publishing:

```txt
https://your-rubix-app.vercel.app
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

## Deployment

RUBIX is meant to be hosted as a Vite static app. The easiest deployment path is Vercel.

1. Push this project to GitHub.
2. Open [Vercel](https://vercel.com).
3. Create a new project and import the GitHub repository.
4. Use the Vite preset. If Vercel asks for settings, use:

```txt
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Deploy.

Vercel will install dependencies, run the build, and host the generated `dist` folder automatically. You do not need to manually upload `dist`.

## Solver

RUBIX stores cube state as cubie data: corner permutation, corner orientation, edge permutation, and edge orientation. Turn-button scrambles update that model directly. Painted input is first converted into a 54-facelet string, validated, and translated into the same cubie model.

The solver uses a two-phase search:

- Phase 1 reduces orientation and slice coordinates to move the cube into a restricted subgroup.
- Phase 2 solves the remaining permutation state with a smaller move set.

The search uses iterative deepening A* with precomputed move and pruning tables. Solver setup and search run inside a Web Worker so the page stays responsive.

## Performance

The first solve can be slower because lookup tables are initialized. Later solves reuse those tables. The 3D view is lightweight: stickers are simple Three.js meshes, and cube state updates instantly.

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

For local development, install dependencies and start Vite:

```bash
npm install
npm run dev
```

For solver/layout checks:

```bash
npm run test:solver
```

`node_modules/` and `dist/` are ignored because they are generated folders.
