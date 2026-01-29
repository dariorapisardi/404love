const DEFAULT_BASE_URL = "https://404found.love"

type QueryValue = string | number | boolean | null | undefined

export const build404Url = (options: {
  baseUrl?: string
  referrer?: string
  query?: Record<string, QueryValue>
}) => {
  const { baseUrl, referrer, query } = options
  const url = new URL(baseUrl ?? DEFAULT_BASE_URL, DEFAULT_BASE_URL)

  if (referrer) {
    url.searchParams.set("referer", referrer)
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
