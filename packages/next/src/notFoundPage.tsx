import { headers } from "next/headers"
import NotFoundFrame from "./NotFoundFrame.js"
import type { NotFoundPageOptions } from "./types.js"

export const createNotFoundPage = (options: NotFoundPageOptions = {}) => {
  return async function NotFoundPage() {
    const headersList = await headers()
    const serverReferer =
      headersList.get("referer") || headersList.get("referrer") || ""

    return <NotFoundFrame serverReferer={serverReferer} options={options} />
  }
}
