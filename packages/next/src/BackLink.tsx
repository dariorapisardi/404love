"use client"

import type { CSSProperties, MouseEvent } from "react"

interface BackLinkProps {
  referrer: string
  label: string
  className?: string
  style?: CSSProperties
}

export default function BackLink({ referrer, label, className, style }: BackLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!referrer) {
      event.preventDefault()
      window.history.back()
    }
  }

  return (
    <a
      href={referrer || "/"}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {label}
    </a>
  )
}
