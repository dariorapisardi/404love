import assert from "node:assert/strict"
import { test } from "node:test"
import {
  clampFrameHeight,
  deriveThemeFromHost,
  derivedOnly,
  matchFont,
  mergeThemeTokens,
  normalizeColor,
  themedBackLinkStyle,
} from "../dist/theme.js"

test("explicit tokens win over derived ones", () => {
  const merged = mergeThemeTokens(
    { background: "#0d0e10", radius: 0 },
    { background: "#ffffff", text: "#111111", radius: 12 },
  )
  assert.deepEqual(merged, { background: "#0d0e10", text: "#111111", radius: 0 })
})

test("derivedOnly drops what the host set explicitly", () => {
  assert.deepEqual(
    derivedOnly({ background: "#0d0e10" }, { background: "#ffffff", text: "#111111" }),
    { text: "#111111" },
  )
})

test("normalizes opaque CSS colors to hex", () => {
  assert.equal(normalizeColor("rgb(13, 14, 16)"), "#0d0e10")
  assert.equal(normalizeColor("rgba(255, 90, 71, 1)"), "#ff5a47")
  assert.equal(normalizeColor("rgb(255 90 71)"), "#ff5a47")
  assert.equal(normalizeColor("#FFF"), "#ffffff")
  assert.equal(normalizeColor("hsl(0, 100%, 50%)"), "#ff0000")
  assert.equal(normalizeColor("0 0% 100%"), "#ffffff")
  assert.equal(normalizeColor("rgba(0, 0, 0, 0)"), null)
  assert.equal(normalizeColor("rgba(0, 0, 0, 0.5)"), null)
  assert.equal(normalizeColor("transparent"), null)
  assert.equal(normalizeColor("oklch(0.7 0.1 30)"), null)
  assert.equal(normalizeColor(""), null)
})

test("matches host fonts to the allowlist", () => {
  assert.equal(matchFont('"IBM Plex Sans", sans-serif'), "ibm-plex-sans")
  assert.equal(matchFont("__Inter_a1b2c3, __Inter_Fallback_a1b2c3"), "inter")
  assert.equal(matchFont("'Geist', 'Geist Fallback'"), "geist")
  assert.equal(matchFont("system-ui, sans-serif"), "system")
  assert.equal(matchFont("Comic Sans MS"), null)
})

test("derives a dark preset and tokens from a dark host", () => {
  const derived = deriveThemeFromHost({
    background: "rgb(13, 14, 16)",
    color: "rgb(241, 239, 234)",
    fontFamily: "Inter, sans-serif",
    accent: "#ff5a47",
    colorScheme: "normal",
  })
  assert.equal(derived.theme, "dark")
  assert.deepEqual(derived.tokens, {
    background: "#0d0e10",
    text: "#f1efea",
    accent: "#ff5a47",
    font: "inter",
  })
})

test("derives light on a light host and nothing from a transparent one", () => {
  assert.equal(
    deriveThemeFromHost({ background: "rgb(255,255,255)", color: null, fontFamily: null, accent: null, colorScheme: "" }).theme,
    "light",
  )
  assert.deepEqual(
    deriveThemeFromHost({ background: null, color: null, fontFamily: null, accent: null, colorScheme: "dark" }),
    { theme: "dark", tokens: {} },
  )
})

test("themed back link uses the frame colors", () => {
  assert.deepEqual(themedBackLinkStyle("dark", { surface: "#16171A", text: "#F1EFEA", border: "#2A2C31", radius: 0 }), {
    color: "#f1efea",
    background: "#16171a",
    border: "1px solid #2a2c31",
    borderRadius: "0px",
  })
  assert.equal(themedBackLinkStyle("dark", {}).background, "#171717")
})

test("clamps reported frame heights", () => {
  assert.equal(clampFrameHeight(812.4), 813)
  assert.equal(clampFrameHeight(1e9), 20000)
  assert.equal(clampFrameHeight(-1), null)
  assert.equal(clampFrameHeight("900"), null)
})
