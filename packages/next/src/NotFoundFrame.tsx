"use client"

import type { CSSProperties, SyntheticEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import BackLink from "./BackLink.js"
import {
  HEIGHT_MESSAGE_TYPE,
  THEME_MESSAGE_TYPE,
  THEME_VERSION,
  clampFrameHeight,
  deriveThemeFromHost,
  derivedOnly,
  hasTheme,
  themedBackLinkStyle,
} from "./theme.js"
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
const DEFAULT_FRAME_ORIGIN = "https://404found.love"

const normalizeColor = (color: string) => color.replace(/\s+/g, "").toLowerCase()

const parseAlpha = (normalized: string) => {
  const match = normalized.match(/^(rgba?|hsla?)\((.+)\)$/)
  if (!match) {
    return null
  }

  const body = match[2]
  if (body.includes("/")) {
    const alpha = body.split("/")[1]
    return Number.parseFloat(alpha)
  }

  const parts = body.split(",")
  if (parts.length < 4) {
    return null
  }

  return Number.parseFloat(parts[3])
}

const isTransparent = (color: string | null) => {
  if (!color) {
    return true
  }

  const normalized = normalizeColor(color)
  if (normalized === "transparent") {
    return true
  }

  const alpha = parseAlpha(normalized)
  return alpha !== null && Number.isFinite(alpha) && alpha === 0
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

const ACCENT_PROPERTIES = ["--brand", "--primary", "--accent"]

const readHostStyle = () => {
  const html = document.documentElement
  const htmlStyle = window.getComputedStyle(html)
  const bodyStyle = document.body ? window.getComputedStyle(document.body) : htmlStyle
  const background = readHostBackground()
  const accent =
    ACCENT_PROPERTIES.map((name) => htmlStyle.getPropertyValue(name).trim()).find(Boolean) ?? null
  return {
    background: background === "transparent" ? null : background,
    color: bodyStyle.color,
    fontFamily: bodyStyle.fontFamily,
    accent,
    colorScheme: htmlStyle.colorScheme,
  }
}

export default function NotFoundFrame({
  serverReferer,
  options,
  hostSlots,
}: NotFoundFrameProps) {
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
    hostSlots,
    theme: options.theme,
    themeTokens: options.themeTokens,
  })

  const syncFrameBackground = options.syncFrameBackground !== false
  const deriveTheme = options.deriveTheme !== false
  const autoHeight = options.autoHeight !== false
  const themed = hasTheme(options.theme, options.themeTokens)
  const [frameHeight, setFrameHeight] = useState<number | null>(null)
  const readySignalled = useRef(false)

  const frameOrigin = useMemo(() => {
    try {
      return new URL(src).origin
    } catch {
      return null
    }
  }, [src])

  const frameBackgroundTargetOrigin = useMemo(() => {
    if (options.frameBackgroundTargetOrigin) {
      return options.frameBackgroundTargetOrigin
    }

    try {
      const origin = new URL(src).origin
      return origin === DEFAULT_FRAME_ORIGIN ? origin : null
    } catch {
      return null
    }
  }, [options.frameBackgroundTargetOrigin, src])

  // Posts the host background and, with `deriveTheme`, the tokens read from
  // the host page that were not set explicitly (those are already in the URL).
  // Only ever sent to the frame origin; the frame validates both.
  const postFrameBackground = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow || !frameBackgroundTargetOrigin) {
      return
    }

    if (syncFrameBackground) {
      frameWindow.postMessage(
        { type: MESSAGE_TYPE, color: readHostBackground() },
        frameBackgroundTargetOrigin
      )
    }

    if (deriveTheme) {
      const derived = deriveThemeFromHost(readHostStyle())
      frameWindow.postMessage(
        {
          type: THEME_MESSAGE_TYPE,
          v: Number(THEME_VERSION),
          theme: options.theme ? undefined : (derived.theme ?? undefined),
          tokens: derivedOnly(options.themeTokens, derived.tokens),
        },
        frameBackgroundTargetOrigin
      )
    }
  }, [
    deriveTheme,
    frameBackgroundTargetOrigin,
    options.theme,
    options.themeTokens,
    syncFrameBackground,
  ])

  useEffect(() => {
    // The frame reports its content height. Its first report also means its
    // listeners are mounted, so re-send the background and theme then: the
    // iframe `load` post can land before the frame has hydrated.
    const handleMessage = (event: MessageEvent) => {
      if (
        !frameOrigin ||
        event.origin !== frameOrigin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return
      }
      const data = event.data as { type?: unknown; height?: unknown } | null
      if (!data || data.type !== HEIGHT_MESSAGE_TYPE) {
        return
      }
      if (!readySignalled.current) {
        readySignalled.current = true
        postFrameBackground()
      }
      if (autoHeight) {
        const height = clampFrameHeight(data.height)
        if (height !== null) {
          setFrameHeight(height)
        }
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [autoHeight, frameOrigin, postFrameBackground])

  const containerStyle = {
    ...DEFAULT_CONTAINER_STYLE,
    ...options.containerStyle,
  }

  const iframeStyle: CSSProperties = {
    ...DEFAULT_IFRAME_STYLE,
    ...(autoHeight && frameHeight !== null
      ? { height: `${frameHeight}px`, minHeight: "100vh", flex: "0 0 auto" }
      : {}),
    ...options.iframeStyle,
  }

  const backLinkStyle = {
    ...DEFAULT_BACK_LINK_STYLE,
    ...(themed
      ? { ...themedBackLinkStyle(options.theme, options.themeTokens), boxShadow: "none" }
      : {}),
    ...options.backLinkStyle,
  }

  useEffect(() => {
    if (!syncFrameBackground && !deriveTheme) {
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
  }, [deriveTheme, postFrameBackground, syncFrameBackground])

  const handleFrameLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    options.iframeProps?.onLoad?.(event)
    readySignalled.current = false
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
