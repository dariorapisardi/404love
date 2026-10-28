import { applyTheme, hasTheme } from "./theme.js"
import type { ResolvedHostSlots, ThemePreset, ThemeTokens } from "./types.js"

const DEFAULT_BASE_URL = "https://404found.love/frame"

type QueryValue = string | number | boolean | null | undefined

const HOST_SLOT_PARAMS = ["host", "search", "search_param", "search_label", "link"]

const applyHostSlots = (url: URL, hostSlots: ResolvedHostSlots) => {
  // Host slots own these keys; anything the host put in `query` under the
  // same names is replaced rather than merged.
  for (const key of HOST_SLOT_PARAMS) {
    url.searchParams.delete(key)
  }

  if (hostSlots.host) {
    url.searchParams.set("host", hostSlots.host)
  }

  if (hostSlots.search) {
    url.searchParams.set("search", hostSlots.search.action)
    if (hostSlots.search.param) {
      url.searchParams.set("search_param", hostSlots.search.param)
    }
    if (hostSlots.search.label) {
      url.searchParams.set("search_label", hostSlots.search.label)
    }
  }

  for (const link of hostSlots.links) {
    url.searchParams.append("link", `${link.label}|${link.href}`)
  }
}

export const build404Url = (options: {
  baseUrl?: string
  referer?: string
  query?: Record<string, QueryValue>
  hostSlots?: ResolvedHostSlots | null
  theme?: ThemePreset
  themeTokens?: ThemeTokens
}) => {
  const { baseUrl, referer, query, hostSlots, theme, themeTokens } = options
  const url = new URL(baseUrl ?? DEFAULT_BASE_URL, DEFAULT_BASE_URL)

  if (referer) {
    url.searchParams.set("referer", referer)
  }

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return
      }
      url.searchParams.set(key, String(value))
    })
  }

  if (hostSlots) {
    applyHostSlots(url, hostSlots)
  }

  if (hasTheme(theme, themeTokens)) {
    applyTheme(url, theme, themeTokens)
  }

  return url.toString()
}
