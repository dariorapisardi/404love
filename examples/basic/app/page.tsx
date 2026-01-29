import Link from "next/link"

export default function HomePage() {
  return (
    <main style={{ padding: "4rem 2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>404 Love Found Example</h1>
      <p style={{ marginBottom: "2rem", maxWidth: 520 }}>
        Visit a route that does not exist to see the 404 Love Found integration.
      </p>
      <Link href="/missing-page">Go to a missing page</Link>
    </main>
  )
}
