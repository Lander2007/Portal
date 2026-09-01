import { useState, useRef, useEffect, useCallback } from "react"

const BLUE = "#1E90FF"
const ORANGE = "#FF7A1A"

export default function PortalPeek({
  targetId,
  label,
  position = "bottom-right",
  color = "blue",
}) {
  const [hovered, setHovered] = useState(false)
  const [snapshot, setSnapshot] = useState(null)
  const canvasRef = useRef(null)
  const hasSnapshot = useRef(false)

  const accentColor = color === "blue" ? BLUE : ORANGE
  const rgb = color === "blue" ? "30,144,255" : "255,122,26"

  const positionStyles = {
    "bottom-right": { bottom: "24px", right: "24px" },
    "bottom-left": { bottom: "24px", left: "24px" },
    "top-right": { top: "24px", right: "24px" },
    "top-left": { top: "24px", left: "24px" },
  }

  const previewPosition = {
    "bottom-right": { bottom: "44px", right: 0 },
    "bottom-left": { bottom: "44px", left: 0 },
    "top-right": { top: "44px", right: 0 },
    "top-left": { top: "44px", left: 0 },
  }

  // Capture a snapshot of the target section on first hover
  const captureSnapshot = useCallback(() => {
    if (hasSnapshot.current) return
    const target = document.getElementById(targetId)
    if (!target) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = 200
    const h = 120
    canvas.width = w
    canvas.height = h

    try {
      // Get the target's bounding rect and compute what portion of the page it occupies
      const rect = target.getBoundingClientRect()
      const pageH = document.documentElement.scrollHeight
      const viewH = window.innerHeight

      // Draw a dark background
      ctx.fillStyle = "#0A0A0C"
      ctx.fillRect(0, 0, w, h)

      // Draw abstract content blocks representing the section
      const sectionIndex = parseInt(targetId.replace("chamber-", "")) || 0
      const seed = sectionIndex * 137.5

      // Background gradient wash
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6)
      bgGrad.addColorStop(0, `rgba(${rgb}, 0.12)`)
      bgGrad.addColorStop(1, "transparent")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Simulated content blocks (heading + lines)
      ctx.fillStyle = `rgba(${rgb}, 0.3)`
      const blockX = 20 + Math.sin(seed) * 10
      ctx.fillRect(blockX, 20, 80 + Math.cos(seed) * 20, 6)

      ctx.fillStyle = "rgba(242, 242, 239, 0.08)"
      for (let i = 0; i < 4; i++) {
        const lineW = 60 + Math.sin(seed + i * 2.3) * 30
        ctx.fillRect(blockX, 36 + i * 10, lineW, 3)
      }

      // Accent element
      ctx.fillStyle = `rgba(${rgb}, 0.15)`
      const accentY = 80 + Math.cos(seed * 0.7) * 10
      ctx.fillRect(blockX, accentY, 50, 14)
      ctx.strokeStyle = `rgba(${rgb}, 0.25)`
      ctx.lineWidth = 0.5
      ctx.strokeRect(blockX, accentY, 50, 14)

      // Scanline overlay
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.06)"
        ctx.fillRect(0, y, w, 1)
      }

      setSnapshot(canvas.toDataURL())
      hasSnapshot.current = true
    } catch {
      // Cross-origin or other security error — fall through to abstract preview
    }
  }, [targetId, rgb])

  useEffect(() => {
    if (hovered) captureSnapshot()
  }, [hovered, captureSnapshot])

  const handleClick = () => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div
      className="absolute z-20"
      style={positionStyles[position]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Portal button — looks like an actual portal */}
      <button
        onClick={handleClick}
        aria-label={`Peek at ${label}`}
        className="relative"
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "rgba(10,10,12,0.85)",
          cursor: "pointer",
          padding: 0,
          border: "none",
          backdropFilter: "blur(8px)",
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <filter id={`glow-${targetId}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer rim — the glowing portal edge */}
          <circle
            cx="21"
            cy="21"
            r="19"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            opacity={hovered ? 0.9 : 0.5}
            filter={`url(#glow-${targetId})`}
          />

          {/* Animated swirling ring */}
          <g style={{ transformOrigin: "21px 21px" }}>
            <ellipse
              cx="21"
              cy="21"
              rx="15"
              ry="15"
              fill="none"
              stroke={accentColor}
              strokeWidth="1"
              strokeDasharray="6 4"
              opacity={hovered ? 0.6 : 0.25}
              style={{
                animation: "portalPeekSpin 4s linear infinite",
              }}
            />
          </g>

          {/* Second swirling ring — counter-rotating */}
          <g style={{ transformOrigin: "21px 21px" }}>
            <ellipse
              cx="21"
              cy="21"
              rx="12"
              ry="12"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.6"
              strokeDasharray="3 5"
              opacity={hovered ? 0.4 : 0.15}
              style={{
                animation: "portalPeekSpinReverse 3s linear infinite",
              }}
            />
          </g>

          {/* Radial glow when hovered */}
          {hovered && (
            <circle
              cx="21"
              cy="21"
              r="16"
              fill={`url(#portalPeekGlow-${targetId})`}
            />
          )}

          {/* Dark center — the portal "hole" */}
          <circle cx="21" cy="21" r="8" fill="#0A0A0C" opacity="0.9" />
          <circle
            cx="21"
            cy="21"
            r="8"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.3"
            opacity="0.3"
          />

          {/* Inner glow ring */}
          <circle
            cx="21"
            cy="21"
            r="6"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.4"
            opacity={hovered ? 0.5 : 0.2}
          />

          {/* Particles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              cx="21"
              cy="21"
              r="0.8"
              fill={accentColor}
              opacity={hovered ? 0.6 : 0.2}
              style={{
                transformOrigin: "21px 21px",
                animation: `portalPeekParticle ${2 + i * 0.3}s linear infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}

          {/* Gradient definitions */}
          <defs>
            <radialGradient id={`portalPeekGlow-${targetId}`}>
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </button>

      {/* Hover preview panel — shows captured snapshot or abstract preview */}
      <div
        className="absolute pointer-events-none"
        style={{
          ...previewPosition[position],
          width: hovered ? "160px" : "0",
          height: hovered ? "100px" : "0",
          overflow: "hidden",
          borderRadius: "6px",
          border: `1px solid ${accentColor}`,
          boxShadow: hovered
            ? `0 0 24px rgba(${rgb}, 0.3), inset 0 0 20px rgba(${rgb}, 0.1)`
            : "none",
          opacity: hovered ? 1 : 0,
          transition:
            "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          transform: hovered
            ? "translateY(-4px) scale(1)"
            : "translateY(8px) scale(0.9)",
        }}
      >
        {/* Snapshot image or abstract preview */}
        {snapshot ? (
          <img
            src={snapshot}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(1.5px) saturate(1.3) brightness(0.8)",
              transform: "scale(1.15)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `radial-gradient(ellipse at center, rgba(${rgb},0.15) 0%, #0A0A0C 70%)`,
            }}
          />
        )}

        {/* Chromatic swirl overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "6px",
            background: `conic-gradient(from 0deg, transparent, rgba(${rgb},0.1), transparent, rgba(${rgb},0.05), transparent)`,
            animation: "portalPeekSwirl 3s linear infinite",
          }}
        />

        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "6px",
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Label */}
        <div
          className="absolute bottom-1 left-0 right-0 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "7px",
            color: accentColor,
            letterSpacing: "0.12em",
            textShadow: `0 0 8px rgba(${rgb}, 0.6)`,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
