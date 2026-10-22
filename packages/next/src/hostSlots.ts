import type {
  HostSlotsOptions,
  ResolvedHostSlots,
  ResolvedHostSlotsLink,
  ResolvedHostSlotsSearch,
} from "./types.js"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"])

const stripPort = (host: string) => host.replace(/:\d+$/, "")

// Derives the embedding site's origin from request headers. Proxies and
// platforms (Vercel, Cloudflare) set x-forwarded-*; plain `host` is the
// fallback. Returns null when nothing usable is present.
export const getHostOrigin = (headers: {
  get: (name: string) => string | null
}): string | null => {
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || headers.get("host")?.trim()
  if (!host) {
    return null
  }

  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const proto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : LOCAL_HOSTS.has(stripPort(host))
        ? "http"
        : "https"

  try {
    return new URL(`${proto}://${host}`).origin
  } catch {
    return null
  }
}

const resolveUrl = (value: string, hostOrigin: string | null): string | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  try {
    return hostOrigin ? new URL(trimmed, hostOrigin).toString() : new URL(trimmed).toString()
  } catch {
    return null
  }
}

// Resolves relative hrefs against the host origin so the frame only ever sees
// absolute URLs it can check against the `host` anchor. Entries that cannot be
// resolved are dropped; the frame applies its own fail-closed validation.
export const resolveHostSlots = (
  options: HostSlotsOptions | undefined,
  hostOrigin: string | null,
): ResolvedHostSlots | null => {
  if (!options) {
    return null
  }

  let search: ResolvedHostSlotsSearch | null = null
  if (options.search) {
    const action = resolveUrl(options.search.action, hostOrigin)
    if (action) {
      search = {
        action,
        ...(options.search.param ? { param: options.search.param } : {}),
        ...(options.search.label ? { label: options.search.label } : {}),
      }
    }
  }

  const links: ResolvedHostSlotsLink[] = []
  for (const link of options.links ?? []) {
    const href = resolveUrl(link.href, hostOrigin)
    const label = link.label?.trim()
    if (href && label) {
      links.push({ label, href })
    }
  }

  if (!search && links.length === 0) {
    return null
  }

  return { host: hostOrigin, search, links }
}
