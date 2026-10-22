import assert from "node:assert/strict"
import { test } from "node:test"
import { getHostOrigin, resolveHostSlots } from "../dist/hostSlots.js"

const headersOf = (entries) => new Headers(entries)

test("getHostOrigin prefers x-forwarded-host and x-forwarded-proto", () => {
  const origin = getHostOrigin(
    headersOf([
      ["host", "internal:3000"],
      ["x-forwarded-host", "acme.com, proxy"],
      ["x-forwarded-proto", "https"],
    ]),
  )
  assert.equal(origin, "https://acme.com")
})

test("getHostOrigin assumes https for public hosts and http for localhost", () => {
  assert.equal(getHostOrigin(headersOf([["host", "acme.com"]])), "https://acme.com")
  assert.equal(getHostOrigin(headersOf([["host", "localhost:3000"]])), "http://localhost:3000")
  assert.equal(getHostOrigin(headersOf([])), null)
})

test("resolveHostSlots resolves relative paths against the host origin", () => {
  const slots = resolveHostSlots(
    {
      search: { action: "/search", param: "s" },
      links: [
        { label: " Home ", href: "/" },
        { label: "Docs", href: "https://docs.acme.com/" },
      ],
    },
    "https://acme.com",
  )
  assert.deepEqual(slots, {
    host: "https://acme.com",
    search: { action: "https://acme.com/search", param: "s" },
    links: [
      { label: "Home", href: "https://acme.com/" },
      { label: "Docs", href: "https://docs.acme.com/" },
    ],
  })
})

test("resolveHostSlots drops relative entries when the origin is unknown", () => {
  const slots = resolveHostSlots(
    {
      search: { action: "/search" },
      links: [
        { label: "Rel", href: "/rel" },
        { label: "Abs", href: "https://acme.com/abs" },
      ],
    },
    null,
  )
  assert.deepEqual(slots, {
    host: null,
    search: null,
    links: [{ label: "Abs", href: "https://acme.com/abs" }],
  })
})

test("resolveHostSlots returns null when nothing is configured or resolvable", () => {
  assert.equal(resolveHostSlots(undefined, "https://acme.com"), null)
  assert.equal(resolveHostSlots({}, "https://acme.com"), null)
  assert.equal(resolveHostSlots({ links: [{ label: "", href: "/x" }] }, "https://acme.com"), null)
})
