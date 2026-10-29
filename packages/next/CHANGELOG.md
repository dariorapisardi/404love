# @404love/next

## 0.4.1

### Patch Changes

- d522599: Restore the `next` peer range to `^16.2.6`. 0.4.0 shipped with `^16.4.1` after an automated dependency bump, which made `npm install` fail with ERESOLVE on Next 16.2 and 16.3. The SDK works on Next 16.2.6 and later.

## 0.4.0

### Minor Changes

- 56c8940: Add frame theming and auto-height.

  - `theme` (`"light" | "dark" | "auto"`) and `themeTokens` (background, surface, text, mutedText, accent, onAccent, border, radius, font) are sent in the frame URL as `theme`, `theme_v=1` and `t_*` params. They override the same keys in `query`.
  - `deriveTheme` (default `true`) reads the host page's background, text color, font, `--brand` / `--primary` / `--accent` custom property and `color-scheme`, and sends the tokens not set explicitly to the frame with a `frame:set-theme` message.
  - `autoHeight` (default `true`) sizes the iframe to the frame's reported content height, keeping a `100vh` minimum.
  - With a theme set, the default back link uses the frame's surface, text, border and radius colors.

  Because `deriveTheme` and `autoHeight` default to on, an existing integration picks up the host page's colors and font and an auto-sized iframe after upgrading. Set `deriveTheme: false` and `autoHeight: false` to keep the previous behavior.

## 0.3.0

### Minor Changes

- 09b568b: Add `hostSlots` option: configure a search form and up to 8 links that render inside the frame and navigate back to your site. Relative paths resolve against the host origin from request headers; the frame only renders URLs on your own hostname.
