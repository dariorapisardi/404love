import { headers } from "next/headers"
import NotFoundFrame from "./NotFoundFrame.js"
import type { NotFoundPageOptions } from "./types.js"

export const createNotFoundPage = (options: NotFoundPageOptions = {}) => {
  return async function NotFoundPage() {
    const headersList = await headers()
    const serverReferrer =
      headersList.get("referer") || headersList.get("referrer") || ""

    return <NotFoundFrame serverReferrer={serverReferrer} options={options} />
  }
}
