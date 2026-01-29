import type { CSSProperties, IframeHTMLAttributes } from "react"

export interface NotFoundPageOptions {
  baseUrl?: string
  referer?: string
  includeBackLink?: boolean
  backLinkLabel?: string
  backLinkClassName?: string
  backLinkStyle?: CSSProperties
  containerClassName?: string
  containerStyle?: CSSProperties
  iframeClassName?: string
  iframeStyle?: CSSProperties
  iframeTitle?: string
  iframeProps?: Omit<
    IframeHTMLAttributes<HTMLIFrameElement>,
    "src" | "title" | "className" | "style"
  >
  query?: Record<string, string | number | boolean | null | undefined>
}

export interface NotFoundFrameProps {
  serverReferer: string
  options: NotFoundPageOptions
}
