# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

**minecraftLegion** is a Mineflayer-based framework for running autonomous, multi-purpose Minecraft bots (guard, farmer, miner, sorter, breeder, archer, crafter…). Bots are configured and monitored from a web UI backed by a small REST + Socket.IO server.

Target Minecraft version: **1.20 stable**. 1.21 support is in progress — treat any 1.21-specific breakage as expected work-in-progress, not a regression against master.

## Repository layout

Multi-package monorepo (custom build orchestration, **not** npm workspaces). Packages depend on each other via locally-built `.tgz` artifacts.

- [base-types/](base-types/) — shared TypeScript types. Built first; consumed as a tarball by the others.
- [core/](core/) — the bot engine. Mineflayer + state machines + behaviors. This is where bot logic lives.
  - [core/src/BehaviorModules/](core/src/BehaviorModules/) — reusable behavior primitives (dig, move, equip, craft…).
  - [core/src/NestedStateModules/](core/src/NestedStateModules/) — job-level state machines (guardJob, minerJob, farmerJob, sorterJob, breederJob, crafterJob, archerJob).
  - [core/src/custom_start/](core/src/custom_start/) — user initialization hooks. Auto-generated on first run; don't overwrite blindly.
- [server/](server/) — Express + Sequelize (SQLite) + Socket.IO. Bridges bots and the web UI; persists bot configs.
- [web/](web/) — React 19 + Vite 6 frontend (ESM, TanStack Query, Zustand, React Bootstrap).
- [test/](test/) — launcher for a local Minecraft 1.21 test server (`npm run server`).
- [docker/](docker/) — production Dockerfile + supervisord config (runs core + server together).

State machine engine lives in the external package `minecraftlegion-statemachine` (recently extracted from the repo — see commit `976e95e`).

## How the app starts

Root [index.js](index.js) forks two child processes from compiled output: `server/dist/index.js` and `core/dist/index.js`. Both read from `.env` (auto-created from `.env_example` on first run).

Core reads `botsToStart` from env and spins up bots sequentially every 7s via [core/src/startBot.ts](core/src/startBot.ts).

## Host prerequisites (running outside devcontainer)

**The project is developed on the WSL/host directly, not inside the devcontainer.** The devcontainer still exists but is no longer the default flow.

Needed on the host:
- **Node.js** (version pinned in devcontainer: 21.7.1)
- **Docker** — used to run the MC test server, since **Java is not required on the host**.

Java lives inside the `minecraft_server` Docker image built from [.devcontainer/Dockerfile](.devcontainer/Dockerfile). We reuse that image as a runner for the test server, without attaching VSCode to it. The "devcontainer" Dockerfile is effectively a Java+Node image repurposed for the test server.

## Development workflow

The typical loop is **not** `npm start`. It's:

1. **Start the MC test server via Docker (default).** First time only: `npm run docker:build` builds the `minecraft_server` image (~5 min). Each session: `npm run server:docker` runs the test server on `localhost:25565`. The script is [package.json](package.json):
   ```
   docker run --rm -it -p:25565:25565 -v $(pwd):/app/ minecraft_server ts-node /app/test/start_test_server.ts
   ```
   It mounts the repo into `/app/` and runs [test/start_test_server.ts](test/start_test_server.ts), which downloads and launches a Minecraft 1.21 server and auto-ops `flatbot` and `Lordvivi`.

   For testing against a *real* server instead of the bundled test one, skip this step and point the bot's `SERVER`/`PORT` env vars at the real server.

2. **Iterate on a single bot** from `core/` with `npm run one <JobName>` (e.g. `npm run one flatbot`). Runs under ts-node with `--inspect=0.0.0.0:9229` so a debugger can attach. `flatbot` is auto-opped by the test server — use that name to get op privileges for free.

3. For UI or full-stack work, run server and web separately: `cd server && npm run start` and `cd web && npm run dev` (Vite on :5173, proxies to backend on :4001).

### Alternatives to Docker for the MC server

- **Native `npm run server`**: only works if Java 21 is installed on the host (`sudo apt install openjdk-21-jre-headless`). Not needed if Docker flow works.
- **Devcontainer**: `Dev Containers: Reopen in Container` in VSCode. Still supported, but not the default — only use if the Docker flow above is not convenient.

### Useful commands

| Where | Command | Purpose |
|-------|---------|---------|
| root | `npm run build` | Full install + build of all packages |
| root | `npm run docker:build` | Build the `minecraft_server` Docker image (one-time) |
| root | `npm run server:docker` | **Default**: run the MC test server inside Docker on :25565 |
| root | `npm run server` | Alternative: run the MC test server natively (requires Java 21 on host) |
| root | `npm start` | Production-style: fork server + core |
| core | `npm run one <Job>` | Run a single bot with a job, for iteration |
| core | `npm run start` | Run the full bot engine with nodemon |
| core | `npm run test [pattern]` | Run Mocha integration tests (see caveats below) |
| server | `npm run start` | Dev server with nodemon, inspect on :9250 |
| web | `npm run dev` | Vite dev server |

## Code conventions

- **Language:** everything — code, identifiers, comments, commit messages, docs — in **English**.
- **Prefer modern, clear techniques.** Don't preserve legacy idioms just because surrounding code uses them; if something is outdated, flag it.
- **TypeScript:** strict mode is on ([tsconfig.json](tsconfig.json)). Use the `@/` path alias for intra-package imports (configured via babel-plugin-module-resolver).
- **Module systems:** CommonJS for `core/` and `server/` (Babel-transpiled), ESM for `web/`.
- **Style:** no formatter is configured yet (only `core/tslint.json`, which is legacy). For now, **match the style of the file being edited**. A modern formatter (ESLint + Prettier or Biome) should be introduced — ask the user before doing so.
- **No unnecessary comments.** Names should carry the meaning; only comment non-obvious *why*.

## Testing

Tests in [core/test/legionTests/](core/test/legionTests/) are **slow end-to-end integration tests** that:

- require a Minecraft server running,
- build a controlled world with specific blocks/entities before exercising a behavior,
- are known to be partially failing on master.

**Do not run the test suite as part of a normal task completion.** Only run a specific test file when explicitly asked, or when the change directly touches a behavior covered by that test. If a test is needed, remind the user that the MC server must be running first.

Type-checking (`tsc`) and building the affected package are a better default sanity check than the Mocha suite.

## Commits and VCS

- **Never commit without asking first.** The user commits themselves or explicitly tells Claude to. Show the diff and propose a message instead of committing unprompted.
- Recent commit style is short imperative lines (e.g. `Improved make hole for hardest area`, `Upgrade node version for docker`). Match that.
- CI builds and pushes `ghcr.io/sefirosweb/minecraft-legion:latest` from [.github/workflows/docker-image.yml](.github/workflows/docker-image.yml) on every push to `master` — keep that in mind before pushing.

## Things to watch out for

- **`custom_start/` is user-provided.** `index.js` auto-generates it if missing; don't rewrite a user's existing hook.
- **`base-types` rebuilds propagate by tarball.** Changing a type there means `install.js` / `build.js` must re-run to propagate into `core/`, `server/`, `web/` — a plain `tsc` in one package won't pick it up.
- **State machines are the core abstraction.** When adding a behavior, prefer composing existing `BehaviorModules` and wiring them into an existing `NestedStateModule` over inventing a new top-level construct.
- **Bot startup is sequential with 7s spacing** — don't assume all bots are online immediately after `npm start`.
- **SQLite DB** under `server/` has no migration system; changing a Sequelize model may require wiping the local DB file.
