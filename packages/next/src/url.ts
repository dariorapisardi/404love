const DEFAULT_BASE_URL = "https://404found.love/frame"

type QueryValue = string | number | boolean | null | undefined

export const build404Url = (options: {
  baseUrl?: string
  referer?: string
  query?: Record<string, QueryValue>
}) => {
  const { baseUrl, referer, query } = options
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

  return url.toString()
}
