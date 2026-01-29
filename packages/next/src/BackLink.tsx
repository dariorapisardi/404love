"use client"

import type { CSSProperties, MouseEvent } from "react"

interface BackLinkProps {
  referer: string
  label: string
  className?: string
  style?: CSSProperties
}

export default function BackLink({ referer, label, className, style }: BackLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!referer) {
      event.preventDefault()
      window.history.back()
    }
  }

  return (
    <a
      href={referer || "/"}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {label}
    </a>
  )
}
