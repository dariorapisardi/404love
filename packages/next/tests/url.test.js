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
