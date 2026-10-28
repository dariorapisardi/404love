import { createNotFoundPage } from "@404love/next"

// FRAME_BASE_URL / FRAME_ORIGIN point the example at a local frame for manual
// testing; unset, it uses https://404found.love/frame.
export default createNotFoundPage({
  baseUrl: process.env.FRAME_BASE_URL,
  frameBackgroundTargetOrigin: process.env.FRAME_ORIGIN,
  query: { nf: true },
  backLinkLabel: "Back to site",
  hostSlots: {
    search: { action: "/search", label: "Search this example" },
    links: [
      { label: "Home", href: "/" },
      { label: "Missing page", href: "/missing-page" },
    ],
  },
})
