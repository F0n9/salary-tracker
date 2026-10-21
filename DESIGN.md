---
version: alpha
name: Apple-design-analysis
description: A precision-crafted, photography and typography-first interface following Apple Human Interface Guidelines (HIG). Canvas transitions gracefully across deep black (#000000) and graphite tiles (#161617, #1d1d1f), framed by SF Pro Display / SF Pro Text with negative letter-spacing and signature Action Blue (#2997ff) with Apple Mint/Green (#30d158) for metrics. UI chrome recedes completely — no decorative gradients, no glowing shadows on chrome, only clean pill buttons (980px radius) and crisp hairline borders.

colors:
  primary: "#0071e3"
  primary-on-dark: "#2997ff"
  accent-green: "#30d158"
  accent-amber: "#ff9f0a"
  accent-red: "#ff453a"
  body-on-dark: "#f5f5f7"
  body-muted: "#86868b"
  hairline: "rgba(255, 255, 255, 0.12)"
  canvas: "#000000"
  surface-card: "#161617"
  surface-card-hover: "#1d1d1f"
  surface-input: "#0c0c0d"
  surface-chip: "rgba(255, 255, 255, 0.08)"

typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    letterSpacing: "-0.022em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    letterSpacing: "-0.015em"
  mono:
    fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace"
    letterSpacing: "-0.02em"

components:
  button:
    borderRadius: "980px" # Apple signature pill
    fontWeight: "500"
  card:
    borderRadius: "18px"
    border: "1px solid rgba(255, 255, 255, 0.1)"
    backgroundColor: "#161617"
---
