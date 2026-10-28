import assert from "node:assert/strict"
import { test } from "node:test"
import { build404Url } from "../dist/url.js"

const params = (href) => new URL(href).searchParams

test("defaults to the frame URL with no params", () => {
  assert.equal(build404Url({}), "https://404found.love/frame")
})

test("attaches referer and query", () => {
  const url = params(
    build404Url({ referer: "https://acme.com/x", query: { nf: true, skip: null } }),
  )
  assert.equal(url.get("referer"), "https://acme.com/x")
  assert.equal(url.get("nf"), "true")
  assert.equal(url.has("skip"), false)
})

test("serializes host slots as host, search, and repeated link params", () => {
  const url = params(
    build404Url({
      hostSlots: {
        host: "https://acme.com",
        search: { action: "https://acme.com/search", param: "query", label: "Search docs" },
        links: [
          { label: "Home", href: "https://acme.com/" },
          { label: "Docs", href: "https://acme.com/docs" },
        ],
      },
    }),
  )
  assert.equal(url.get("host"), "https://acme.com")
  assert.equal(url.get("search"), "https://acme.com/search")
  assert.equal(url.get("search_param"), "query")
  assert.equal(url.get("search_label"), "Search docs")
  assert.deepEqual(url.getAll("link"), ["Home|https://acme.com/", "Docs|https://acme.com/docs"])
})

test("omits optional search fields and host when absent", () => {
  const url = params(
    build404Url({
      hostSlots: { host: null, search: { action: "https://acme.com/search" }, links: [] },
    }),
  )
  assert.equal(url.has("host"), false)
  assert.equal(url.has("search_param"), false)
  assert.equal(url.has("search_label"), false)
  assert.equal(url.has("link"), false)
})

test("host slots win over colliding query keys", () => {
  const url = params(
    build404Url({
      query: { link: "Evil|https://evil.example/", host: "https://evil.example" },
      hostSlots: {
        host: "https://acme.com",
        search: null,
        links: [{ label: "Home", href: "https://acme.com/" }],
      },
    }),
  )
  assert.equal(url.get("host"), "https://acme.com")
  assert.deepEqual(url.getAll("link"), ["Home|https://acme.com/"])
})

test("serializes theme, theme_v and t_* tokens", () => {
  const url = params(
    build404Url({
      theme: "dark",
      themeTokens: {
        background: "#0D0E10",
        surface: "#16171A",
        text: "#F1EFEA",
        mutedText: "#A3A9B1",
        accent: "#FF5A47",
        onAccent: "#1A0603",
        border: "#2A2C31",
        radius: 0,
        font: "ibm-plex-sans",
      },
    }),
  )
  assert.equal(url.get("theme"), "dark")
  assert.equal(url.get("theme_v"), "1")
  assert.equal(url.get("t_bg"), "#0D0E10")
  assert.equal(url.get("t_surface"), "#16171A")
  assert.equal(url.get("t_text"), "#F1EFEA")
  assert.equal(url.get("t_muted"), "#A3A9B1")
  assert.equal(url.get("t_accent"), "#FF5A47")
  assert.equal(url.get("t_on_accent"), "#1A0603")
  assert.equal(url.get("t_border"), "#2A2C31")
  assert.equal(url.get("t_radius"), "0")
  assert.equal(url.get("t_font"), "ibm-plex-sans")
})

test("sends the preset alone without theme_v", () => {
  const url = params(build404Url({ theme: "auto" }))
  assert.equal(url.get("theme"), "auto")
  assert.equal(url.has("theme_v"), false)
})

test("omits theme params when unset", () => {
  const url = params(build404Url({ referer: "https://acme.com/x", themeTokens: {} }))
  for (const key of ["theme", "theme_v", "t_bg", "t_radius"]) {
    assert.equal(url.has(key), false)
  }
})

test("theme params override query", () => {
  const url = params(
    build404Url({
      query: { theme: "light", theme_v: "9", t_bg: "#ffffff", t_text: "#000000" },
      theme: "dark",
      themeTokens: { background: "#000000" },
    }),
  )
  assert.equal(url.get("theme"), "dark")
  assert.equal(url.get("theme_v"), "1")
  assert.equal(url.get("t_bg"), "#000000")
  assert.equal(url.has("t_text"), false)
})

test("leaves query theme keys alone when no theme is configured", () => {
  const url = params(build404Url({ query: { theme: "dark" } }))
  assert.equal(url.get("theme"), "dark")
})
