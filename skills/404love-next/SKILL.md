---
name: 404love-next
description: Use when integrating @404love/next into a Next.js App Router project, creating or customizing app/not-found.tsx, or troubleshooting 404love iframe/back-link behavior.
---

# 404love Next.js App Router

Provide drop-in 404 pages that replace dead ends with adoptable pets. Use the @404love/next SDK to render a full-page, accessible 404 experience (powered by the 404found iframe) in Next.js App Router projects.

## Highlights

- Privacy-respecting: no cookies, no tracking, no PII. Only optional `referer` query param for back navigation.
- Content-safe: only adoptable pets, no user-generated content.
- Accessible, tested 404 experience with built-in back navigation.
- Lightweight iframe embed that keeps the host site in control.

## Requirements

- Use Next.js 13.4+ with App Router.
- Use React 18+.

## Quick start

1. Install the package with the repo's package manager.
2. Create `app/not-found.tsx` and export `createNotFoundPage()`.
3. Run dev server and visit a non-existing route.

## Install

Prefer the package manager used by the project (lockfile). Default to npm.

```bash
npm install @404love/next
```

## Add the not-found page

Create `app/not-found.tsx`:

```tsx
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage()
```

This renders a full-page iframe pointing to `https://404found.love/frame`, plus an optional top-level back link outside the iframe.

## Customize

Pass options to `createNotFoundPage` when customizing the iframe or back link.
Use the full option list and example in `skills/404love-next/references/options.md`.

```tsx
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
  includeBackLink: true,
  backLinkLabel: "Back to site",
  query: { source: "app-router" },
  iframeTitle: "404 Love Found",
  syncFrameBackground: true,
})
```

## Back navigation

The package passes a `referer` query param using server headers and the client `document.referrer`, then renders a top-level back link outside the iframe. The link navigates the host history (or detected referrer) so the user exits the iframe.

## Troubleshooting

- Ensure the file is `app/not-found.tsx` (App Router only).
- Remove any legacy Pages Router `pages/404.tsx` or `pages/404.js` that might override routing.
- If the iframe background clashes with the host, set `syncFrameBackground: false` or customize `containerStyle`/`iframeStyle`.
