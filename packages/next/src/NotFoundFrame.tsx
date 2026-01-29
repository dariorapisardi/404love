"use client"

import type { CSSProperties } from "react"
import { useEffect, useState } from "react"
import BackLink from "./BackLink.js"
import { build404Url } from "./url.js"
import type { NotFoundFrameProps } from "./types.js"

const DEFAULT_CONTAINER_STYLE: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
}

const DEFAULT_IFRAME_STYLE: CSSProperties = {
  border: 0,
  width: "100%",
  flex: "1 1 auto",
  minHeight: 0,
}

const DEFAULT_BACK_LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  fontWeight: 600,
  textDecoration: "none",
  color: "#93314f",
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  padding: "0.75rem 1rem",
  borderRadius: "9999px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
}

const DEFAULT_BACK_LINK_WRAPPER_STYLE: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: "1.5rem",
  display: "flex",
  justifyContent: "center",
  zIndex: 10,
}

export default function NotFoundFrame({ serverReferrer, options }: NotFoundFrameProps) {
  const [referrer, setReferrer] = useState(() => options.referrer ?? serverReferrer)

  useEffect(() => {
    if (options.referrer) {
      return
    }
    const clientReferrer = document.referrer
    if (clientReferrer && clientReferrer !== referrer) {
      setReferrer(clientReferrer)
    }
  }, [options.referrer, referrer])

  const src = build404Url({
    baseUrl: options.baseUrl,
    referrer,
    query: options.query,
  })

  const containerStyle = {
    ...DEFAULT_CONTAINER_STYLE,
    ...options.containerStyle,
  }

  const iframeStyle = {
    ...DEFAULT_IFRAME_STYLE,
    ...options.iframeStyle,
  }

  const backLinkStyle = {
    ...DEFAULT_BACK_LINK_STYLE,
    ...options.backLinkStyle,
  }

  return (
    <div className={options.containerClassName} style={containerStyle}>
      {options.includeBackLink !== false ? (
        <div style={DEFAULT_BACK_LINK_WRAPPER_STYLE}>
          <BackLink
            referrer={referrer}
            label={options.backLinkLabel ?? "Go back"}
            className={options.backLinkClassName}
            style={backLinkStyle}
          />
        </div>
      ) : null}
      <iframe
        title={options.iframeTitle ?? "404 Love Found"}
        src={src}
        className={options.iframeClassName}
        style={iframeStyle}
        {...options.iframeProps}
      />
    </div>
  )
}
