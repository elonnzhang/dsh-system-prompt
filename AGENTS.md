# Repository Guidelines

## Project Structure & Module Organization

This repository is a DeepSeek Harness session-inspection plugin.

- `src/host/` exposes the read-only `/dsh-system-prompt` RPC and builds scoped session projections.
- `src/client/` contains the React inspection view, trajectory `Sections` bridge, localization, and CSS.
- `src/types.ts` defines the JSON transport contract shared by host and client halves.
- `scripts/` contains the browser bundle, watcher, and smoke checks.
- `docs/` documents the data flow, runtime prompt provenance, and trajectory integration.
- `lib/` is committed generated output; update it through the build command, not by hand.

## Build, Test, and Development Commands

Run these from the repository root:

```sh
npm run typecheck   # TypeScript validation without emitting files
npm run build       # Build host, declarations, and browser bundle
npm test            # Typecheck, build, syntax checks, and smoke test
npm run dev         # Watch src/scripts and rebuild on changes
```

For integration testing with `deepseek-harness`, use two terminals: run
`npm run dev` here, link the checkout into the Harness web profile, then run
`pnpm dsh web --no-open --port 3080` from the Harness checkout. Open
`http://127.0.0.1:3080` and verify `conversation.view` plus the trajectory
`System Prompt / Tools / Sections` flow. The watcher rebuilds `lib/`; refresh
the browser when the bundle reloads. Run `npm test` first for a clean check.

## Coding Style & Naming Conventions

Use strict TypeScript with explicit `.ts` relative import extensions. Use
two-space indentation, single quotes, and semicolons only where required by
the existing style. Prefix CSS classes with `dsh-system-prompt-`; use camelCase
functions and PascalCase React components.

## Testing Guidelines

There is no separate unit-test framework. `npm test` is the required baseline:
it runs `tsc`, rebuilds all bundles, checks generated JavaScript syntax, and
runs `scripts/smoke.mjs`. When changing client behavior, also verify the
relevant conversation or trajectory view in a running Harness profile.

## Commit & Pull Request Guidelines

Use Conventional Commits with a reason-focused subject, such as
`fix: label tool prompt sections` or `docs: explain session data sources`.
Keep pull requests narrow, describe user-visible behavior and verification
commands, and include screenshots or a local URL for browser UI changes.
Ensure generated `lib/` bundles stay synchronized with source.

## Architecture & Safety Notes

The plugin is read-only: never serialize live Cordis contexts, agents, session
objects, services, fibers, or functions across RPC. Scope labels describe
effective scope, not exact plugin ownership. The trajectory bridge must clean up
observers and injected nodes on unload or HMR.
