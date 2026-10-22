import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/notFoundPage.tsx",
    "src/NotFoundFrame.tsx",
    "src/BackLink.tsx",
    "src/hostSlots.ts",
    "src/url.ts",
    "src/types.ts",
  ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: false,
})
