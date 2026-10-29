# @404love/next options

Use these options with `createNotFoundPage` to customize the iframe and back link.

## Option reference

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
- `hostSlots`: `{ search?: { action, param?, label? }, links?: [{ label, href }] }`. Renders the host's search form and up to 8 links inside the frame. Relative paths resolve against the host origin; the frame only renders URLs on the host's hostname or a subdomain.
- `theme`: frame color preset, `"light"`, `"dark"` or `"auto"` (follows `prefers-color-scheme`).
- `themeTokens`: `{ background?, surface?, text?, mutedText?, accent?, onAccent?, border?, radius?, font? }`. Colors are hex (`#rgb` / `#rrggbb`), `radius` is px clamped to 0-24, `font` is one of `system`, `inter`, `ibm-plex-sans`, `geist`, `roboto`. Sent in the frame URL; the frame drops invalid values and text pairs below 4.5:1 contrast.
- `deriveTheme`: read the host page's background, text color, font, `--brand` / `--primary` / `--accent` and `color-scheme`, and send the tokens not set explicitly (default: true).
- `autoHeight`: size the iframe to the frame's reported content height, keeping a `100vh` minimum (default: true).

## Full options example

```tsx
import { createNotFoundPage } from "@404love/next"

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
  hostSlots: {
    search: { action: "/search", param: "q", label: "Search example.com" },
    links: [
      { label: "Home", href: "/" },
      { label: "Docs", href: "/docs" },
    ],
  },
  theme: "dark",
  themeTokens: {
    background: "#0D0E10",
    text: "#F1EFEA",
    accent: "#FF5A47",
    radius: 8,
    font: "inter",
  },
  deriveTheme: true,
  autoHeight: true,
})
```
