# Wave Survivor

A fast top-down arcade survival game for the browser, built with **TypeScript**, **PixiJS** and **Vite**.
Your ship fires automatically, enemy waves grow harder, and every level-up lets you pick an upgrade.

**Play it:** `https://<your-username>.github.io/<repo-name>/` (after the first deploy, see below)

## Controls

| Input                | Action                    |
| -------------------- | ------------------------- |
| WASD / arrow keys    | Move                      |
| Drag (touch screens) | Move                      |
| Auto-fire            | Targets the nearest enemy |
| 1 / 2 / 3 or click   | Choose an upgrade         |
| Enter / Space        | Start or restart          |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

| Command                           | What it does                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `npm run check`                   | Lint, unit tests, type-check, production build and bundle budget (same as CI) |
| `npm test`                        | Vitest unit tests for game logic                                              |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                             |
| `npm run report`                  | Prints bundle sizes and fails if gzipped JS exceeds the 300 KB budget         |
| `npm run preview`                 | Serves the production build locally                                           |

## Deploy to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. In the repo go to Settings, then Pages, and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`: checks, build, deploy.

## How it is built

- **Rendering:** PixiJS 7 with layered containers and a tiling parallax star field.
- **HTML5 Canvas:** all sprites are drawn procedurally with the raw Canvas 2D API in `src/textures.ts` and uploaded to Pixi as textures, so the game needs no image files.
- **Fixed timestep:** the simulation advances in 1/60 s steps regardless of display refresh rate (`Game.frame`).
- **Object pooling:** enemies, bullets, gems and particles are recycled (`src/pool.ts`), which keeps garbage collection out of the hot path.
- **Spatial hash:** bullet-versus-enemy collisions only test the 3x3 neighbouring grid cells (`src/spatialHash.ts`) instead of every pair, which keeps hundreds of enemies at 60 FPS.
- **Pure, tested logic:** wave scaling, upgrades and the spatial hash have no rendering dependencies and are covered by unit tests.
- **Audio:** a small WebAudio synth (`src/audio.ts`); no audio files needed.
- **Automation:** CI runs lint, tests, type-check and a gzip bundle-size budget on every push and pull request.

## Project layout

```
src/
  main.ts          entry point
  game.ts          game loop, entities, collisions, state machine
  config.ts        constants and enemy definitions
  wave.ts          wave and difficulty scaling (pure)
  upgrades.ts      upgrade definitions and selection (pure)
  spatialHash.ts   broad-phase collision grid
  pool.ts          generic object pool
  textures.ts      Canvas 2D sprite generation
  input.ts         keyboard and touch input
  audio.ts         WebAudio sound effects
  ui.ts            HUD and overlays (DOM)
  storage.ts       best-score persistence
scripts/bundle-report.mjs
```

## AI-assisted workflow

The project was developed with AI assistance (Claude) for scaffolding, refactoring from a single-file
prototype into modules, and writing tests. All code was reviewed, type-checked and linted before commit.
