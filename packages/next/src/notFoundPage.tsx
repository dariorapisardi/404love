import { headers } from "next/headers"
import { getHostOrigin, resolveHostSlots } from "./hostSlots.js"
import NotFoundFrame from "./NotFoundFrame.js"
import type { NotFoundPageOptions } from "./types.js"

export const createNotFoundPage = (options: NotFoundPageOptions = {}) => {
  return async function NotFoundPage() {
    const headersList = await headers()
    const serverReferer =
      headersList.get("referer") || headersList.get("referrer") || ""
    // The host origin is only read, and only sent to the frame, when host
    // slots are configured. It anchors the frame's same-site URL check.
    const hostSlots = options.hostSlots
      ? resolveHostSlots(options.hostSlots, getHostOrigin(headersList))
      : null

    return (
      <NotFoundFrame
        serverReferer={serverReferer}
        options={options}
        hostSlots={hostSlots}
      />
    )
  }
}
