# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a npm workspaces monorepo. Workspaces live under `packages/*` and `examples/*` (see root `package.json`).

- `packages/next` — the published SDK `@404love/next` (Next.js App Router helper that renders a full-page iframe pointing at `https://404found.love/frame`).
- `examples/basic` — a Next.js app that consumes the SDK via a `file:` dependency and is used as the integration test target.
- `skills/404love-next` — a packaged skill (`SKILL.md`) that teaches another agent how to wire the SDK into an App Router project; `404love-next.zip` is the distributable.
- `dist/` at the repo root is leftover output from an earlier flat layout; the live build output is `packages/next/dist/`.

## Common commands

Run from the repo root:

- `npm install` — bootstrap workspaces.
- `npm run build` — builds `@404love/next` only (delegates to `tsup`).
- `npm run test` — rebuilds `@404love/next` then runs `node --test` over `packages/next/tests/*.test.js` against the built `dist/` output. `npm run test:integration` only rebuilds.
- `npm --workspace @404love/next run test:example` — builds `examples/basic` against the workspace package; this is the real integration check.
- `npm --prefix examples/basic run dev` — runs the example Next.js dev server for manual verification.

## Releasing

- Versioning uses Changesets (config in `.changeset/config.json`, base branch `main`).
- Add a changeset for any change to `@404love/next`: `npm run changeset`.
- `npm run version` applies pending changesets; `npm run release` publishes.
- The `release.yml` workflow publishes `@404love/next` to npm with provenance when a `v*` tag is pushed.
- CI (`.github/workflows/ci.yml`) runs `npm install && npm run build && npm run test` on Node 24.

## Architecture notes

The SDK is intentionally tiny and split into a server entry that defers to a client component:

- `notFoundPage.tsx` (server) — `createNotFoundPage(options)` returns an async server component that reads `next/headers` to capture the server-side `referer`/`referrer`, then renders `<NotFoundFrame>`. This is the public entry; `app/not-found.tsx` should `export default createNotFoundPage(...)`.
- `NotFoundFrame.tsx` (`"use client"`) — owns the iframe, hydrates the referer with `document.referrer`, and (when `syncFrameBackground` is on) posts the host's computed background color to the iframe via `postMessage` on load, on `MutationObserver` changes to `<html>`/`<body>` class/style, and on `prefers-color-scheme` changes. The target origin defaults to `https://404found.love` and is set to `null` (i.e. disabled) for any other origin unless explicitly overridden via `frameBackgroundTargetOrigin`.
- `BackLink.tsx` (`"use client"`) — anchor that uses the captured `referer` as `href`, falling back to `window.history.back()` when no referer is known.
- `hostSlots.ts` (server-safe, pure) — `getHostOrigin` derives the embedding site's origin from request headers; `resolveHostSlots` resolves relative `hostSlots` URLs against it.
- `url.ts` — `build404Url` composes the iframe `src`, attaches `referer`, merges arbitrary `query` params, and serializes resolved host slots as `host`, `search`, `search_param`, `search_label`, and repeated `link` params (these keys override `query`).
- `types.ts` — the `NotFoundPageOptions` surface re-exported from `index.ts`.

The package targets ESM only (`"type": "module"`, `format: ["esm"]` in `tsup.config.ts`) and ships with `bundle: false`, so each source file emits its own `.js`/`.d.ts`. Source files import siblings using `.js` extensions (e.g. `from "./url.js"`) — this is required for the bundler-less ESM output to resolve at runtime; preserve this convention when adding new modules.

Peer deps are `next ^16.2.6` and `react >=18.0.0`. Dependabot security updates rewrite this range when they bump `next` (they did in #8 and #10); revert the peer range in those PRs and keep only the example's bump. The example pins React 19 and Next 16, which is the current integration target.

## Conventions

- Don't mix server and client concerns in a single file — keep the `"use client"` boundary at `NotFoundFrame`/`BackLink` and the server entry purely in `notFoundPage.tsx`.
- When adding a new source file under `packages/next/src/`, also add it to the `entry` array in `tsup.config.ts` (the build is unbundled, so each entry must be listed explicitly).
- Privacy is a product constraint: do not introduce cookies, analytics, persistent storage, or PII collection. The only data sent off-host is the optional `referer` query param; when `hostSlots` is configured, the host origin plus the host-authored slot labels and URLs; and theme values — `theme`/`themeTokens` in the URL, and with `deriveTheme` the host page's background, text color, font, brand custom property and `color-scheme` posted to the frame origin. Keep the README privacy sections in sync when this changes.
