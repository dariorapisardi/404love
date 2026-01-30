"use client"

import type { CSSProperties, SyntheticEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

const MESSAGE_TYPE = "frame:set-background"

const normalizeColor = (color: string) => color.replace(/\s+/g, "").toLowerCase()

const isTransparent = (color: string | null) => {
  if (!color) {
    return true
  }

  const normalized = normalizeColor(color)
  return normalized === "transparent" || normalized === "rgba(0,0,0,0)"
}

const readHostBackground = () => {
  const bodyColor = document.body
    ? window.getComputedStyle(document.body).backgroundColor
    : null
  const htmlColor = window.getComputedStyle(document.documentElement).backgroundColor

  if (!isTransparent(bodyColor)) {
    return bodyColor
  }

  if (!isTransparent(htmlColor)) {
    return htmlColor
  }

  return "transparent"
}

export default function NotFoundFrame({ serverReferer, options }: NotFoundFrameProps) {
  const [referer, setReferer] = useState(() => options.referer ?? serverReferer)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    if (options.referer) {
      return
    }
    const clientReferer = document.referrer
    if (clientReferer && clientReferer !== referer) {
      setReferer(clientReferer)
    }
  }, [options.referer, referer])

  const src = build404Url({
    baseUrl: options.baseUrl,
    referer,
    query: options.query,
  })

  const syncFrameBackground = options.syncFrameBackground !== false

  const frameBackgroundTargetOrigin = useMemo(() => {
    if (options.frameBackgroundTargetOrigin) {
      return options.frameBackgroundTargetOrigin
    }

    try {
      return new URL(src).origin
    } catch {
      return "*"
    }
  }, [options.frameBackgroundTargetOrigin, src])

  const postFrameBackground = useCallback(() => {
    if (!syncFrameBackground) {
      return
    }

    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      return
    }

    frameWindow.postMessage(
      { type: MESSAGE_TYPE, color: readHostBackground() },
      frameBackgroundTargetOrigin
    )
  }, [frameBackgroundTargetOrigin, syncFrameBackground])

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

  useEffect(() => {
    if (!syncFrameBackground) {
      return
    }

    postFrameBackground()

    const html = document.documentElement
    const body = document.body

    const observer = new MutationObserver(() => postFrameBackground())
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    if (body) {
      observer.observe(body, {
        attributes: true,
        attributeFilter: ["class", "style"],
      })
    }

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)")
    const handleMediaChange = () => postFrameBackground()

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange)
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleMediaChange)
    }

    return () => {
      observer.disconnect()
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange)
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  }, [postFrameBackground, syncFrameBackground])

  const handleFrameLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    options.iframeProps?.onLoad?.(event)
    postFrameBackground()
  }

  const iframeProps = {
    ...options.iframeProps,
    onLoad: handleFrameLoad,
  }

  return (
    <div className={options.containerClassName} style={containerStyle}>
      {options.includeBackLink !== false ? (
        <div style={DEFAULT_BACK_LINK_WRAPPER_STYLE}>
          <BackLink
            referer={referer}
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
        ref={iframeRef}
        {...iframeProps}
      />
    </div>
  )
}
