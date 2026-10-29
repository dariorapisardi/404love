# @404love/next

Next.js helpers for integrating [404found.love](https://404found.love) in App Router projects.

## Install

```bash
npm install @404love/next
```

## Requirements

- Next.js 13.4+ App Router
- React 18+

## Quick start

Create `app/not-found.tsx`:

```tsx
import { createNotFoundPage } from "@404love/next";

export default createNotFoundPage();
```

This renders a full-page iframe pointing to `https://404found.love/frame`, plus an optional
top-level back link outside the iframe.

## Demo

- SDK embed demo: https://404found.love/demo-next
- Iframe embed demo: https://404found.love/demo-iframe

## Options

```tsx
import { createNotFoundPage } from "@404love/next";

export default createNotFoundPage({
  includeBackLink: true,
  backLinkLabel: "Back to site",
  query: { source: "app-router" },
  iframeTitle: "404 Love Found",
  syncFrameBackground: true,
});
```

### Option reference

- `baseUrl`: override the default `https://404found.love/frame`.
- `referer`: override the detected referrer.
- `syncFrameBackground`: post the host background color to the iframe (default: true).
- `frameBackgroundTargetOrigin`: override the `postMessage` target origin for background sync (defaults to `https://404found.love`, disabled for other origins).
- `includeBackLink`: show or hide the top-level back link.
- `backLinkLabel`: custom label for the back link.
- `backLinkClassName`, `backLinkStyle`: customize the back link.
- `containerClassName`, `containerStyle`: customize the wrapper.
- `iframeClassName`, `iframeStyle`, `iframeTitle`, `iframeProps`: customize the iframe.
- `query`: extra query parameters (e.g. `{ source: "app-router" }`).
- `hostSlots`: your own search form and links rendered inside the frame (see below).
- `theme`: frame color preset, `"light"`, `"dark"` or `"auto"` (see below).
- `themeTokens`: your colors, corner radius and font for the frame (see below).
- `deriveTheme`: read your page's colors and font and send the tokens you did not set (default: true).
- `autoHeight`: size the iframe to the frame's content, one scrollbar (default: true).

### Full options example

```tsx
import { createNotFoundPage } from "@404love/next";

export default createNotFoundPage({
  baseUrl: "https://404found.love/frame",
  referer: "https://example.com/marketing",
  syncFrameBackground: true,
  frameBackgroundTargetOrigin: "https://404found.love",
  includeBackLink: true,
  backLinkLabel: "Return to site",
  backLinkClassName: "notfound-back-link",
  backLinkStyle: {
    color: "#0b3b2e",
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(11, 59, 46, 0.2)",
  },
  containerClassName: "notfound-container",
  containerStyle: {
    background: "linear-gradient(180deg, #fef6ef, #fff)",
  },
  iframeClassName: "notfound-frame",
  iframeStyle: {
    borderRadius: "16px",
    boxShadow: "0 18px 44px rgba(0, 0, 0, 0.12)",
  },
  iframeTitle: "404 Love Found",
  iframeProps: {
    loading: "lazy",
    allow: "fullscreen",
    referrerPolicy: "no-referrer",
  },
  query: { source: "app-router", campaign: "spring-2026" },
});
```

## Keep visitors on your site

A 404 page's job is to put the visitor back on track. `hostSlots` renders your own
search form and a short list of links inside the frame, above the pets. Both navigate
the top window back to your site.

```tsx
import { createNotFoundPage } from "@404love/next";

export default createNotFoundPage({
  hostSlots: {
    search: { action: "/search", param: "q", label: "Search acme.com" },
    links: [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
});
```

- Relative paths resolve against your site's origin, read from the request's
  `x-forwarded-host` / `host` headers on the server.
- The frame only renders URLs on your hostname or a subdomain of it, and drops the
  whole slot if any entry is off-site or malformed. Up to 8 links, labels up to 40
  characters.
- The search form is a plain `GET` to `action` with the term in `param` (default `q`).
  Query params already on `action` are preserved as hidden fields.
- When `hostSlots` is set, the SDK also sends your origin as a `host` query param so
  the frame can verify the URLs. Nothing else is sent.
- Do not add a `sandbox` attribute to the iframe that blocks top navigation.

## Match your site's look

By default the frame uses 404found.love's own light palette. `theme` picks a preset
and `themeTokens` passes your colors, corner radius and font. Both go in the frame
URL, so the first paint already matches.

```tsx
import { createNotFoundPage } from "@404love/next";

// A dark host: graphite background, square corners, one coral accent.
export default createNotFoundPage({
  theme: "dark",
  themeTokens: {
    background: "#0D0E10",
    surface: "#16171A",
    text: "#F1EFEA",
    mutedText: "#A3A9B1",
    accent: "#FF5A47",
    onAccent: "#1A0603",
    border: "#2A2C31",
    radius: 0,
    font: "ibm-plex-sans",
  },
});
```

- `theme`: `"light"`, `"dark"` or `"auto"` (follows `prefers-color-scheme`).
- `themeTokens`: colors are hex (`#rgb` / `#rrggbb`). `radius` is in px, clamped to 0-24.
  `font` is one of `system`, `inter`, `ibm-plex-sans`, `geist`, `roboto`. The fonts are
  served by 404found.love; there are no custom font URLs and no custom CSS.
- The frame ignores invalid values and drops any text color pair below WCAG 4.5:1
  contrast back to the preset, so it stays readable whatever you pass.
- `deriveTheme` (default `true`): after load, the SDK reads your page's `body`
  background, text color and font, a `--brand` / `--primary` / `--accent` custom
  property, and `color-scheme`, then sends the tokens you did not set to the frame.
  Explicit `themeTokens` always win. A derived accent that fails 4.5:1 against the
  text on it (common for light brand colors on light hosts) is dropped by design.
  Set `deriveTheme: false` to keep the default look.
- `autoHeight` (default `true`): the frame reports its content height and the SDK
  sizes the iframe to it, so the page has one scrollbar. The iframe keeps a
  `100vh` minimum. Set `autoHeight: false` for a fixed full-viewport iframe.
- When `theme` or `themeTokens` is set, the default back link uses the frame's
  surface, text, border and radius instead of the rose pill (for `auto` it uses the
  light colors). `backLinkStyle` still overrides it.

## Back navigation

The package passes a `referer` query param using server headers and the client
`document.referrer`, then renders a top-level back link outside the iframe. That link
navigates the host history (or the detected referrer) so the user exits the iframe.

## What is sent to the frame

The SDK sets no cookies and collects no PII. It sends 404found.love:

- the `referer` query param, for back navigation;
- with `hostSlots`, your origin and the slot labels and URLs;
- with `theme` / `themeTokens`, those values in the frame URL;
- with `deriveTheme` (default `true`), your page's background, text color, font, brand
  custom property and `color-scheme`, posted to the frame origin only.

## Upgrading from 0.3

`deriveTheme` and `autoHeight` are on by default since 0.4.0, so after upgrading the
frame picks up your page's colors and font and the iframe sizes to its content. To keep
the 0.3 look and a fixed full-viewport iframe:

```tsx
export default createNotFoundPage({ deriveTheme: false, autoHeight: false });
```

## Example app

See the repository for a minimal Next.js example in [`examples/basic`](../../examples/basic).

## License

MIT
