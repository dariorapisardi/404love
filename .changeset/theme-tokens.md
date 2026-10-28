---
"@404love/next": minor
---

Add frame theming and auto-height.

- `theme` (`"light" | "dark" | "auto"`) and `themeTokens` (background, surface, text, mutedText, accent, onAccent, border, radius, font) are sent in the frame URL as `theme`, `theme_v=1` and `t_*` params. They override the same keys in `query`.
- `deriveTheme` (default `true`) reads the host page's background, text color, font, `--brand` / `--primary` / `--accent` custom property and `color-scheme`, and sends the tokens not set explicitly to the frame with a `frame:set-theme` message.
- `autoHeight` (default `true`) sizes the iframe to the frame's reported content height, keeping a `100vh` minimum.
- With a theme set, the default back link uses the frame's surface, text, border and radius colors.

Because `deriveTheme` and `autoHeight` default to on, an existing integration picks up the host page's colors and font and an auto-sized iframe after upgrading. Set `deriveTheme: false` and `autoHeight: false` to keep the previous behavior.
