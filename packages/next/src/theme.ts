import type { CSSProperties } from "react"
import type { ThemeFont, ThemePreset, ThemeTokens } from "./types.js"

// Pure helpers for the frame theme contract (theme_v=1). The frame validates
// everything again (hex only, font allowlist, radius clamp, contrast guard);
// these helpers only shape what the SDK sends.

export const THEME_VERSION = "1"
export const THEME_MESSAGE_TYPE = "frame:set-theme"
export const HEIGHT_MESSAGE_TYPE = "frame:height"
export const MAX_FRAME_HEIGHT = 20000

export const THEME_FONTS: readonly ThemeFont[] = ["system", "inter", "ibm-plex-sans", "geist", "roboto"]

export const TOKEN_PARAMS: Record<keyof ThemeTokens, string> = {
  background: "t_bg",
  surface: "t_surface",
  text: "t_text",
  mutedText: "t_muted",
  accent: "t_accent",
  onAccent: "t_on_accent",
  border: "t_border",
  radius: "t_radius",
  font: "t_font",
}

export const THEME_PARAMS = ["theme", "theme_v", ...Object.values(TOKEN_PARAMS)]

const hasTokens = (tokens: ThemeTokens | undefined) =>
  Boolean(tokens && Object.values(tokens).some((value) => value !== undefined && value !== null))

export const hasTheme = (theme: ThemePreset | undefined, tokens: ThemeTokens | undefined) =>
  Boolean(theme) || hasTokens(tokens)

// Writes `theme`, `theme_v` and `t_*`. These keys override `query`.
export const applyTheme = (url: URL, theme?: ThemePreset, tokens?: ThemeTokens) => {
  for (const key of THEME_PARAMS) {
    url.searchParams.delete(key)
  }
  if (theme) {
    url.searchParams.set("theme", theme)
  }
  if (!hasTokens(tokens)) {
    return
  }
  url.searchParams.set("theme_v", THEME_VERSION)
  for (const [key, param] of Object.entries(TOKEN_PARAMS)) {
    const value = tokens?.[key as keyof ThemeTokens]
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(param, String(value))
    }
  }
}

// Explicit tokens always win; derived ones only fill the gaps.
export const mergeThemeTokens = (explicit: ThemeTokens = {}, derived: ThemeTokens = {}): ThemeTokens => {
  const merged: ThemeTokens = { ...derived }
  for (const [key, value] of Object.entries(explicit)) {
    if (value !== undefined && value !== null) {
      ;(merged as Record<string, unknown>)[key] = value
    }
  }
  return merged
}

// Only the tokens the host did not set explicitly. Those are already in the URL.
export const derivedOnly = (explicit: ThemeTokens = {}, derived: ThemeTokens = {}): ThemeTokens => {
  const result: ThemeTokens = {}
  for (const [key, value] of Object.entries(derived)) {
    const explicitValue = explicit[key as keyof ThemeTokens]
    if (value !== undefined && (explicitValue === undefined || explicitValue === null)) {
      ;(result as Record<string, unknown>)[key] = value
    }
  }
  return result
}

const toHex = (channels: number[]) =>
  `#${channels.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("")}`

const hslToHex = (h: number, s: number, l: number) => {
  const sat = s / 100
  const light = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return toHex([f(0) * 255, f(8) * 255, f(4) * 255])
}

const parseAlphaValue = (value: string | undefined) => {
  if (value === undefined) {
    return 1
  }
  const trimmed = value.trim()
  return trimmed.endsWith("%") ? Number.parseFloat(trimmed) / 100 : Number.parseFloat(trimmed)
}

// Normalizes an opaque CSS color to `#rrggbb`. Handles hex, rgb()/rgba(),
// hsl()/hsla() and bare `H S% L%` triplets (the shadcn custom property style).
// Anything translucent or unrecognized returns null.
export const normalizeColor = (value: string | null | undefined): string | null => {
  if (!value) {
    return null
  }
  const color = value.trim().toLowerCase()

  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].replace(/./g, (d) => d + d) : hex[1]
    return `#${digits}`
  }

  const fn = color.match(/^(rgba?|hsla?)\((.+)\)$/)
  const body = fn ? fn[2] : /^[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(color) ? color : null
  if (!body) {
    return null
  }
  const [main, slashAlpha] = body.split("/")
  const parts = main.split(/[\s,]+/).filter(Boolean)
  if (parts.length < 3 || parts.length > 4) {
    return null
  }
  const alpha = parseAlphaValue(slashAlpha ?? parts[3])
  if (!Number.isFinite(alpha) || alpha < 1) {
    return null
  }

  const isRgb = fn ? fn[1].startsWith("rgb") : false
  if (isRgb) {
    const channels = parts.slice(0, 3).map((p) =>
      p.endsWith("%") ? (Number.parseFloat(p) / 100) * 255 : Number.parseFloat(p),
    )
    return channels.every(Number.isFinite) ? toHex(channels) : null
  }
  const [h, s, l] = parts.slice(0, 3).map((p) => Number.parseFloat(p))
  return [h, s, l].every(Number.isFinite) ? hslToHex(h, s, l) : null
}

const luminance = (hex: string) => {
  const channel = (offset: number) => {
    const c = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

const FONT_ALIASES: Record<string, ThemeFont> = {
  inter: "inter",
  "ibm plex sans": "ibm-plex-sans",
  geist: "geist",
  "geist sans": "geist",
  roboto: "roboto",
  "system-ui": "system",
  "-apple-system": "system",
  blinkmacsystemfont: "system",
  "segoe ui": "system",
}

// Maps the first family of a computed `font-family` to the frame allowlist.
// next/font names families like `__Inter_a1b2c3` or `'Inter Fallback'`.
export const matchFont = (fontFamily: string | null | undefined): ThemeFont | null => {
  if (!fontFamily) {
    return null
  }
  const first = fontFamily.split(",")[0] ?? ""
  const name = first
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^_+/, "")
    .replace(/_[0-9a-f]{4,}$/i, "")
    .replace(/_/g, " ")
    .replace(/\s+fallback$/i, "")
    .trim()
    .toLowerCase()
  return FONT_ALIASES[name] ?? null
}

export interface HostStyleSnapshot {
  background: string | null
  color: string | null
  fontFamily: string | null
  accent: string | null
  colorScheme: string | null
}

export interface DerivedTheme {
  theme: ThemePreset | null
  tokens: ThemeTokens
}

// Turns what the SDK read from the host page into frame tokens. Surface,
// border and muted text are deliberately not derived: guessing them wrong
// makes cards vanish, and the preset already pairs them with the background.
export const deriveThemeFromHost = (snapshot: HostStyleSnapshot): DerivedTheme => {
  const tokens: ThemeTokens = {}
  const background = normalizeColor(snapshot.background)
  const text = normalizeColor(snapshot.color)
  const accent = normalizeColor(snapshot.accent)
  const font = matchFont(snapshot.fontFamily)
  if (background) tokens.background = background
  if (text) tokens.text = text
  if (accent) tokens.accent = accent
  if (font) tokens.font = font

  const scheme = (snapshot.colorScheme ?? "").trim().toLowerCase()
  let theme: ThemePreset | null = null
  if (scheme === "dark" || scheme === "only dark") {
    theme = "dark"
  } else if (background) {
    theme = luminance(background) < 0.2 ? "dark" : "light"
  }
  return { theme, tokens }
}

const DARK_BACK_LINK = { surface: "#171717", text: "#fafafa", border: "#2e2e2e" }
const LIGHT_BACK_LINK = { surface: "#ffffff", text: "#361c24", border: "#e0d1d6" }

// Default back link colors for a themed frame: the same surface, text, border
// and radius as the frame instead of the rose pill. `backLinkStyle` still wins.
export const themedBackLinkStyle = (
  theme: ThemePreset | undefined,
  tokens: ThemeTokens | undefined,
): CSSProperties => {
  const base = theme === "dark" ? DARK_BACK_LINK : LIGHT_BACK_LINK
  const style: CSSProperties = {
    color: normalizeColor(tokens?.text) ?? base.text,
    background: normalizeColor(tokens?.surface) ?? base.surface,
    border: `1px solid ${normalizeColor(tokens?.border) ?? base.border}`,
  }
  if (typeof tokens?.radius === "number" && Number.isInteger(tokens.radius)) {
    style.borderRadius = `${Math.min(24, Math.max(0, tokens.radius))}px`
  }
  return style
}

export const clampFrameHeight = (height: unknown): number | null => {
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) {
    return null
  }
  return Math.min(MAX_FRAME_HEIGHT, Math.ceil(height))
}
