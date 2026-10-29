---
name: 404love-next
description: Use when integrating @404love/next into a Next.js App Router project, creating or customizing app/not-found.tsx, or troubleshooting 404love iframe/back-link behavior.
---

# 404love Next.js App Router

Provide drop-in 404 pages that replace dead ends with adoptable pets. Use the @404love/next SDK to render a full-page, accessible 404 experience (powered by the 404found iframe) in Next.js App Router projects.

## Highlights

- Privacy-respecting: no cookies, no tracking, no PII. Sends the frame an optional `referer` for back navigation, the host origin and slot URLs when `hostSlots` is set, and theme values (explicit, or read from the host page's styles with `deriveTheme`).
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

## Keep visitors on the host site

Recommend `hostSlots` whenever the project has a search page or a few key pages. It renders the host's own search form and links inside the frame, above the pets, so the 404 still helps the visitor recover.

```tsx
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
  hostSlots: {
    search: { action: "/search" },
    links: [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
    ],
  },
})
```

Rules the frame enforces: URLs must be on the host's hostname or a subdomain, up to 8 links, labels up to 40 characters, and the whole slot is dropped if any entry is invalid. Relative paths resolve against the host origin from request headers. Do not set an iframe `sandbox` that blocks top navigation.

## Match the host's look

If the host site is dark or has a clear brand palette, pass `theme` and `themeTokens` so the frame reads as part of the site. Read the colors from the project's CSS variables or Tailwind config; use hex values.

```tsx
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
  theme: "dark",
  themeTokens: {
    background: "#0D0E10",
    surface: "#16171A",
    text: "#F1EFEA",
    accent: "#FF5A47",
    onAccent: "#1A0603",
    radius: 0,
    font: "inter",
  },
})
```

`theme` is `light`, `dark` or `auto`. Fonts are limited to `system`, `inter`, `ibm-plex-sans`, `geist`, `roboto`, and radius to 0-24 px. The frame drops invalid values and any text pair below 4.5:1 contrast. `deriveTheme` (default on) fills unset tokens from the host page after load, and `autoHeight` (default on) sizes the iframe to its content; set either to `false` to opt out.

## Back navigation

The package passes a `referer` query param using server headers and the client `document.referrer`, then renders a top-level back link outside the iframe. The link navigates the host history (or detected referrer) so the user exits the iframe.

## Troubleshooting

- Ensure the file is `app/not-found.tsx` (App Router only).
- Remove any legacy Pages Router `pages/404.tsx` or `pages/404.js` that might override routing.
- If the iframe background clashes with the host, set `syncFrameBackground: false` or customize `containerStyle`/`iframeStyle`.
- If the frame picks up unwanted colors or font from the host page, set `deriveTheme: false` or pass explicit `themeTokens`.
- If the project styles the iframe with a fixed height, set `autoHeight: false`.
