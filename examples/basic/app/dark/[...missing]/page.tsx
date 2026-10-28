import { notFound } from "next/navigation"

// Every /dark/* path renders app/dark/not-found.tsx.
export default function DarkMissingPage() {
  notFound()
}
