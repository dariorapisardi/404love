import { createNotFoundPage } from "@404love/next"

export default createNotFoundPage({
  query: { nf: true },
  backLinkLabel: "Back to site",
})
