import type { ReactNode } from "react"

export default function DarkLayout({ children }: { children: ReactNode }) {
  return <div style={{ background: "#0d0e10", color: "#f1efea", minHeight: "100vh" }}>{children}</div>
}
