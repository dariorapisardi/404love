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
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage()
```

This renders a full-page iframe pointing to `https://404found.love`, plus an optional
top-level back link outside the iframe.

## Options

```tsx
import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
  includeBackLink: true,
  backLinkLabel: "Back to site",
  query: { nf: true },
  iframeTitle: "404 Love Found",
})
```

### Option reference

- `baseUrl`: override the default `https://404found.love`.
- `referrer`: override the detected referrer.
- `includeBackLink`: show or hide the top-level back link.
- `backLinkLabel`: custom label for the back link.
- `backLinkClassName`, `backLinkStyle`: customize the back link.
- `containerClassName`, `containerStyle`: customize the wrapper.
- `iframeClassName`, `iframeStyle`, `iframeTitle`, `iframeProps`: customize the iframe.
- `query`: extra query parameters (e.g. `{ nf: true }`).

## Back navigation

The package passes a `referer` query param using server headers and the client
`document.referrer`, then renders a top-level back link outside the iframe. That link
navigates the host history (or the detected referrer) so the user exits the iframe.

## Programmatic API

```tsx
import { loveNotFound } from "@404love/next"

export default async function Page() {
  const should404 = true
  if (should404) {
    loveNotFound()
  }

  return null
}
```

## Example app

See the repository for a minimal Next.js example in `examples/basic`.

## Roadmap

- Host-native component that renders adoptable pets directly (no iframe).

## License

MIT
