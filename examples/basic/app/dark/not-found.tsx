import { createNotFoundPage } from "@404love/next"

// A dark host: explicit preset and tokens go in the frame URL, so the first
// paint already matches. FRAME_BASE_URL / FRAME_ORIGIN point the example at a
// local frame (e.g. http://localhost:3000/frame) for manual testing.
export default createNotFoundPage({
  baseUrl: process.env.FRAME_BASE_URL,
  frameBackgroundTargetOrigin: process.env.FRAME_ORIGIN,
  backLinkLabel: "Back to site",
  theme: "dark",
  themeTokens: {
    background: "#0d0e10",
    surface: "#16171a",
    text: "#f1efea",
    mutedText: "#a3a9b1",
    accent: "#ff5a47",
    onAccent: "#1a0603",
    border: "#2a2c31",
    radius: 0,
    font: "ibm-plex-sans",
  },
})
