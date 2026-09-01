import { useEffect, useRef, useState } from "react"

const BLUE = "#1E90FF"
const ORANGE = "#FF7A1A"
const NEUTRAL = "rgba(242, 242, 239, 0.7)"
const SIZE = 28
const HALF = SIZE / 2
const GAP = 5
const LINE = 7
const DOT = 2

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [color, setColor] = useState(NEUTRAL)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      matchMedia("(pointer: coarse)").matches
    if (isTouch) return

    document.body.style.cursor = "none"

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onPortalFired = (e) => {
      const c = e.detail?.color
      if (c === "blue") setColor(BLUE)
      else if (c === "orange") setColor(ORANGE)
    }

    window.addEventListener("pointermove", onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    window.addEventListener("portal-fired", onPortalFired)

    return () => {
      document.body.style.cursor = ""
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      window.removeEventListener("portal-fired", onPortalFired)
    }
  }, [])

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: pos.x - HALF,
        top: pos.y - HALF,
        width: SIZE,
        height: SIZE,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
      aria-hidden="true"
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Top line */}
        <line
          x1={HALF}
          y1={HALF - GAP}
          x2={HALF}
          y2={HALF - GAP - LINE}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Bottom line */}
        <line
          x1={HALF}
          y1={HALF + GAP}
          x2={HALF}
          y2={HALF + GAP + LINE}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Left line */}
        <line
          x1={HALF - GAP}
          y1={HALF}
          x2={HALF - GAP - LINE}
          y2={HALF}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Right line */}
        <line
          x1={HALF + GAP}
          y1={HALF}
          x2={HALF + GAP + LINE}
          y2={HALF}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx={HALF} cy={HALF} r={DOT} fill={color} />
      </svg>
    </div>
  )
}
