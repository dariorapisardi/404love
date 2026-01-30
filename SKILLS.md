# SDK Styling Guide

Use this guide to make the SDK UI blend with the host website while staying accessible and maintainable.

## Goals

- Match the host site's typography, spacing, and color system.
- Keep the SDK UI readable and accessible on any background.
- Avoid visual conflicts with the host site's global styles.

## Quick Start

1. Identify the host site's design tokens (fonts, colors, radius, shadows).
2. Map those tokens to the SDK theme variables.
3. Scope styles to the SDK root to avoid leaking into the host page.

## Theme Variables

Define a small set of CSS custom properties on the SDK root element. Keep names stable so the SDK can read them.

Recommended variables:

- --sdk-font-family
- --sdk-font-size
- --sdk-line-height
- --sdk-text-color
- --sdk-muted-text-color
- --sdk-bg-color
- --sdk-surface-color
- --sdk-border-color
- --sdk-radius
- --sdk-shadow
- --sdk-accent-color
- --sdk-accent-contrast

Example:

```css
.sdk-root {
  --sdk-font-family: "Source Sans 3", system-ui, sans-serif;
  --sdk-font-size: 14px;
  --sdk-line-height: 1.4;
  --sdk-text-color: #1b1f23;
  --sdk-muted-text-color: #57606a;
  --sdk-bg-color: #f6f8fa;
  --sdk-surface-color: #ffffff;
  --sdk-border-color: #d0d7de;
  --sdk-radius: 10px;
  --sdk-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  --sdk-accent-color: #0a66c2;
  --sdk-accent-contrast: #ffffff;
}
```

## Next.js + Tailwind

Use CSS variables for theming and let Tailwind reference them. Keep the SDK wrapped in a root element so styles stay scoped.

Example: define variables in a global stylesheet and scope them to the SDK root.

```css
.sdk-root {
  --sdk-font-family: "Source Sans 3", system-ui, sans-serif;
  --sdk-font-size: 14px;
  --sdk-line-height: 1.4;
  --sdk-text-color: #1b1f23;
  --sdk-muted-text-color: #57606a;
  --sdk-bg-color: #f6f8fa;
  --sdk-surface-color: #ffffff;
  --sdk-border-color: #d0d7de;
  --sdk-radius: 10px;
  --sdk-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  --sdk-accent-color: #0a66c2;
  --sdk-accent-contrast: #ffffff;
}
```

Example: Tailwind config mapping.

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sdk: ["var(--sdk-font-family)"]
      },
      fontSize: {
        sdk: ["var(--sdk-font-size)", { lineHeight: "var(--sdk-line-height)" }]
      },
      colors: {
        sdk: {
          text: "var(--sdk-text-color)",
          muted: "var(--sdk-muted-text-color)",
          bg: "var(--sdk-bg-color)",
          surface: "var(--sdk-surface-color)",
          border: "var(--sdk-border-color)",
          accent: "var(--sdk-accent-color)",
          onAccent: "var(--sdk-accent-contrast)"
        }
      },
      borderRadius: {
        sdk: "var(--sdk-radius)"
      },
      boxShadow: {
        sdk: "var(--sdk-shadow)"
      }
    }
  }
};
```

Example: SDK wrapper in Next.js.

```tsx
export function SdkHost({ children }: { children: React.ReactNode }) {
  return (
    <div className="sdk-root font-sdk text-sdk-text bg-sdk-bg">
      {children}
    </div>
  );
}
```

## Next.js + Pure CSS

Use a CSS module or global stylesheet to define scoped variables and base styles under `.sdk-root`.

```css
/* sdk.module.css */
.root {
  font-family: var(--sdk-font-family);
  font-size: var(--sdk-font-size);
  line-height: var(--sdk-line-height);
  color: var(--sdk-text-color);
  background: var(--sdk-bg-color);
}

.panel {
  background: var(--sdk-surface-color);
  border: 1px solid var(--sdk-border-color);
  border-radius: var(--sdk-radius);
  box-shadow: var(--sdk-shadow);
}
```

```tsx
import styles from "./sdk.module.css";

export function SdkHost({ children }: { children: React.ReactNode }) {
  return <div className={`sdk-root ${styles.root}`}>{children}</div>;
}
```

## Typography Alignment

- Use the host site's primary font family and typical font size.
- Set `--sdk-line-height` to match the host text rhythm.
- Avoid importing fonts inside the SDK. Let the host page load fonts.

## Color Blending

- Match the host background color with `--sdk-bg-color`.
- Use `--sdk-surface-color` for cards and panels.
- Keep `--sdk-text-color` and `--sdk-muted-text-color` aligned with the host's contrast levels.
- Ensure `--sdk-accent-contrast` passes contrast requirements on `--sdk-accent-color`.

## Elevation and Borders

- Use subtle borders on light backgrounds, and soft shadows on dark or busy backgrounds.
- Prefer one elevation level unless the host design uses multiple depth layers.

## Spacing and Density

- Match the host grid: if the site uses 8px steps, set SDK spacing to 8px multiples.
- Avoid cramped spacing; keep a minimum of 8px between UI elements.

## Background Compatibility

- If the host background is patterned or image-based, use a surface color with slight opacity.
- For high-contrast backgrounds, increase border visibility and reduce shadow strength.

Example surface on busy backgrounds:

```css
.sdk-root {
  --sdk-surface-color: rgba(255, 255, 255, 0.96);
  --sdk-border-color: rgba(0, 0, 0, 0.08);
  --sdk-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
}
```

## Dark Mode

Provide a dark theme using either a class toggle or the system preference. Keep dark values readable on the host background.

Class-based toggle (recommended for Next.js):

```css
.sdk-root[data-theme="dark"] {
  --sdk-text-color: #e6edf3;
  --sdk-muted-text-color: #9da7b1;
  --sdk-bg-color: #0b0f14;
  --sdk-surface-color: #111820;
  --sdk-border-color: #223040;
  --sdk-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  --sdk-accent-color: #58a6ff;
  --sdk-accent-contrast: #0b0f14;
}
```

System preference fallback:

```css
@media (prefers-color-scheme: dark) {
  .sdk-root:not([data-theme]) {
    --sdk-text-color: #e6edf3;
    --sdk-muted-text-color: #9da7b1;
    --sdk-bg-color: #0b0f14;
    --sdk-surface-color: #111820;
    --sdk-border-color: #223040;
    --sdk-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    --sdk-accent-color: #58a6ff;
    --sdk-accent-contrast: #0b0f14;
  }
}
```

Next.js toggle example:

```tsx
export function SdkHost({ children, theme }: { children: React.ReactNode; theme?: "light" | "dark" }) {
  return (
    <div className="sdk-root" data-theme={theme}>
      {children}
    </div>
  );
}
```

## Isolation and Scoping

- Wrap the SDK in a single root element (example: `.sdk-root`).
- Scope all SDK styles under that root selector.
- Avoid global element selectors like `body`, `h1`, or `button` without scoping.

## Accessibility

- Keep text contrast at least 4.5:1 for body text and 3:1 for large text.
- Provide focus styles that stand out against the host background.
- Ensure hover states remain visible on both light and dark backgrounds.

## Host-Specific Notes

- If the host uses CSS resets, re-apply base styles within `.sdk-root`.
- If the host uses CSS variables, map them directly to SDK variables.
- If the host uses a design system, mirror its radius, shadow, and button styles.

Example mapping to existing tokens:

```css
.sdk-root {
  --sdk-font-family: var(--font-sans);
  --sdk-text-color: var(--color-text);
  --sdk-muted-text-color: var(--color-text-muted);
  --sdk-bg-color: var(--color-bg);
  --sdk-surface-color: var(--color-surface);
  --sdk-border-color: var(--color-border);
  --sdk-radius: var(--radius-md);
  --sdk-shadow: var(--shadow-md);
  --sdk-accent-color: var(--color-accent);
  --sdk-accent-contrast: var(--color-on-accent);
}
```

## Checklist

- Fonts match the host and are loaded by the host site.
- Background and surface colors blend with the host layout.
- Borders, radius, and shadows align with the host design system.
- Focus states are visible and consistent with the host UI.
- All styles are scoped to the SDK root.

## Host Audit

Use this quick audit to capture the host site's design inputs before theming the SDK.

Core tokens:

- Primary font family
- Base font size and line height
- Text color and muted text color
- Page background and surface background
- Border color
- Accent color and on-accent color
- Radius scale (at least one common radius)
- Shadow depth (at least one common shadow)

Layout and density:

- Spacing scale (4px, 8px, etc.)
- Typical component padding
- Default button height and radius

Dark mode:

- Host dark mode trigger (class, data attribute, or system)
- Dark equivalents for text, bg, surface, border, and accent

Tailwind mapping example:

```css
.sdk-root {
  --sdk-font-family: var(--font-sans);
  --sdk-font-size: 14px;
  --sdk-line-height: 1.4;
  --sdk-text-color: rgb(var(--foreground));
  --sdk-muted-text-color: rgb(var(--muted-foreground));
  --sdk-bg-color: rgb(var(--background));
  --sdk-surface-color: rgb(var(--card));
  --sdk-border-color: rgb(var(--border));
  --sdk-radius: var(--radius);
  --sdk-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  --sdk-accent-color: rgb(var(--primary));
  --sdk-accent-contrast: rgb(var(--primary-foreground));
}
```
