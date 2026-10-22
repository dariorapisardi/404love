import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The example lives in an npm workspace, so `next` is hoisted to the repo
// root. Point Turbopack at that root or it refuses to resolve the package.
const workspaceRoot = path.join(__dirname, "../..")

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
}

export default nextConfig
