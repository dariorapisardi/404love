import type { CSSProperties, IframeHTMLAttributes } from "react"

export interface HostSlotsSearch {
  /** Search endpoint on your site. Relative paths resolve against the host origin. */
  action: string
  /** Query param name for the search term. Default: "q". */
  param?: string
  /** Placeholder and accessible label. Default: "Search <host>". */
  label?: string
}

export interface HostSlotsLink {
  label: string
  /** Relative paths resolve against the host origin. Must stay on your site. */
  href: string
}

/**
 * Host-configured recovery affordances rendered inside the frame above the
 * pets: a search form and up to 8 links, all navigating back to your site.
 * The frame only renders URLs on your own hostname (or a subdomain of it).
 */
export interface HostSlotsOptions {
  search?: HostSlotsSearch
  links?: HostSlotsLink[]
}

export interface ResolvedHostSlotsSearch {
  action: string
  param?: string
  label?: string
}

export interface ResolvedHostSlotsLink {
  label: string
  href: string
}

export interface ResolvedHostSlots {
  host: string | null
  search: ResolvedHostSlotsSearch | null
  links: ResolvedHostSlotsLink[]
}

export type ThemePreset = "light" | "dark" | "auto"

export type ThemeFont = "system" | "inter" | "ibm-plex-sans" | "geist" | "roboto"

/**
 * Semantic theme tokens for the frame (`theme_v=1`). Colors are hex
 * (`#rgb` / `#rrggbb`). The frame drops any token it cannot validate and any
 * color pair below WCAG 4.5:1 contrast, falling back to the preset.
 */
export interface ThemeTokens {
  background?: string
  surface?: string
  text?: string
  mutedText?: string
  accent?: string
  onAccent?: string
  border?: string
  /** Corner radius in px, clamped to 0-24. */
  radius?: number
  font?: ThemeFont
}

export interface NotFoundPageOptions {
  baseUrl?: string
  referer?: string
  hostSlots?: HostSlotsOptions
  /** Frame color preset. `auto` follows `prefers-color-scheme`. */
  theme?: ThemePreset
  /** Tokens on top of the preset. Sent in the frame URL, so the first paint is right. */
  themeTokens?: ThemeTokens
  /** Read the host page and fill in tokens not set explicitly. Default: true. */
  deriveTheme?: boolean
  /** Size the iframe to its content (one scrollbar). Default: true. */
  autoHeight?: boolean
  syncFrameBackground?: boolean
  frameBackgroundTargetOrigin?: string
  includeBackLink?: boolean
  backLinkLabel?: string
  backLinkClassName?: string
  backLinkStyle?: CSSProperties
  containerClassName?: string
  containerStyle?: CSSProperties
  iframeClassName?: string
  iframeStyle?: CSSProperties
  iframeTitle?: string
  iframeProps?: Omit<
    IframeHTMLAttributes<HTMLIFrameElement>,
    "src" | "title" | "className" | "style"
  >
  query?: Record<string, string | number | boolean | null | undefined>
}

export interface NotFoundFrameProps {
  serverReferer: string
  options: NotFoundPageOptions
  hostSlots?: ResolvedHostSlots | null
}
