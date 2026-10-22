import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
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
