import { useRef, useState, useCallback, useEffect } from "react"

const GEL_BLUE = "#2FA8FF"
const GEL_ORANGE = "#FF9838"

const BOUNCE_DAMPING = 0.62
const SLIDE_FRICTION = 0.992
const GRAVITY = 0.0028
const TRAIL_MAX = 30

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

export default function GelInteractive({ mode = "repulsion", onInteraction }) {
  const containerRef = useRef(null)
  const animRef = useRef(0)
  const stateRef = useRef({
    x: 180,
    y: 140,
    vx: 0,
    vy: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastMoveTime: 0,
    positions: [],
  })

  const [trail, setTrail] = useState([])
  const [pos, setPos] = useState({ x: 180, y: 140 })
  const [hasTarget, setHasTarget] = useState(false)
  const [easterEgg, setEasterEgg] = useState(false)
  const [velocity, setVelocity] = useState(0)

  const TARGET_ZONE = { x: 320, y: 60, r: 38 }

  const reduced = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current

  const runPhysics = useCallback(() => {
    const s = stateRef.current
    const el = containerRef.current
    if (!el || s.dragging) return

    const W = el.clientWidth - 28
    const H = el.clientHeight - 28
    const BALL_R = 14

    const isRepulsion = mode === "repulsion"

    if (isRepulsion) {
      s.vy += GRAVITY * 60
      s.x += s.vx
      s.y += s.vy

      if (s.x < BALL_R) {
        s.x = BALL_R
        s.vx = Math.abs(s.vx) * BOUNCE_DAMPING
      }
      if (s.x > W - BALL_R) {
        s.x = W - BALL_R
        s.vx = -Math.abs(s.vx) * BOUNCE_DAMPING
      }
      if (s.y < BALL_R) {
        s.y = BALL_R
        s.vy = Math.abs(s.vy) * BOUNCE_DAMPING
      }
      if (s.y > H - BALL_R) {
        s.y = H - BALL_R
        s.vy = -Math.abs(s.vy) * BOUNCE_DAMPING
        s.vx *= 0.88
      }
    } else {
      s.vx *= SLIDE_FRICTION
      s.vy *= SLIDE_FRICTION * 0.98
      s.x += s.vx
      s.y += s.vy

      if (s.x < BALL_R) {
        s.x = BALL_R
        s.vx = Math.abs(s.vx) * 0.3
      }
      if (s.x > W - BALL_R) {
        s.x = W - BALL_R
        s.vx = -Math.abs(s.vx) * 0.3
      }
      if (s.y < BALL_R) {
        s.y = BALL_R
        s.vy = Math.abs(s.vy) * 0.3
      }
      if (s.y > H - BALL_R) {
        s.y = H - BALL_R
        s.vy = -Math.abs(s.vy) * 0.3
      }
    }

    const dx = s.x - TARGET_ZONE.x
    const dy = s.y - TARGET_ZONE.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < TARGET_ZONE.r + BALL_R && !hasTarget) {
      setHasTarget(true)
      setEasterEgg(true)
      onInteraction?.()
      setTimeout(() => setEasterEgg(false), 3200)
    }

    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
    setVelocity(speed)
    setPos({ x: s.x, y: s.y })
    setTrail((prev) => {
      const next = [...prev, { x: s.x, y: s.y }]
      return next.length > TRAIL_MAX
        ? next.slice(next.length - TRAIL_MAX)
        : next
    })
  }, [mode, hasTarget, onInteraction])

  useEffect(() => {
    if (reduced) return
    const loop = () => {
      runPhysics()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [runPhysics, reduced])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    stateRef.current.x = el.clientWidth / 2
    stateRef.current.y = el.clientHeight / 2
    stateRef.current.vx = 0
    stateRef.current.vy = 0
    setTrail([])
    setHasTarget(false)
    setVelocity(0)
  }, [mode])

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const s = stateRef.current
    s.dragging = true
    s.lastX = e.clientX
    s.lastY = e.clientY
    s.vx = 0
    s.vy = 0
    s.lastMoveTime = Date.now()
    s.positions = []
  }, [])

  const onPointerMove = useCallback((e) => {
    const s = stateRef.current
    if (!s.dragging) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = clamp(e.clientX - rect.left, 14, el.clientWidth - 14)
    const ny = clamp(e.clientY - rect.top, 14, el.clientHeight - 14)
    const now = Date.now()
    const dt = Math.max(1, now - s.lastMoveTime)
    s.vx = (nx - s.x) / (dt / 16)
    s.vy = (ny - s.y) / (dt / 16)
    s.x = nx
    s.y = ny
    s.lastX = e.clientX
    s.lastY = e.clientY
    s.lastMoveTime = now
    s.positions.push({ x: nx, y: ny, t: now })
    if (s.positions.length > 8) s.positions.shift()
    setPos({ x: nx, y: ny })
    setTrail((prev) => [...prev, { x: nx, y: ny }].slice(-TRAIL_MAX))
  }, [])

  const onPointerUp = useCallback(() => {
    const s = stateRef.current
    s.dragging = false
    const MAX_V = mode === "repulsion" ? 14 : 22
    s.vx = clamp(s.vx, -MAX_V, MAX_V)
    s.vy = clamp(s.vy, -MAX_V, MAX_V)
    onInteraction?.()
  }, [mode, onInteraction])

  const color = mode === "repulsion" ? GEL_BLUE : GEL_ORANGE

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "260px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "2px",
        cursor: "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Grid lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.06 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 40}
            x2="100%"
            y2={i * 40}
            stroke="white"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 40}
            y1="0"
            x2={i * 40}
            y2="100%"
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Target zone */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: TARGET_ZONE.x - TARGET_ZONE.r,
          top: TARGET_ZONE.y - TARGET_ZONE.r,
          width: TARGET_ZONE.r * 2,
          height: TARGET_ZONE.r * 2,
          borderRadius: "50%",
          border: `1px dashed ${color}`,
          opacity: hasTarget ? 0 : 0.4,
          transition: "opacity 0.3s",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color,
        }}
      >
        <span>TARGET</span>
      </div>

      {/* Trail */}
      {!reduced &&
        trail.map((p, i) => {
          const alpha = (i / Math.max(trail.length, 1)) * 0.45
          const size = 3 + (i / Math.max(trail.length, 1)) * 10
          return (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: p.x - size / 2,
                top: p.y - size / 2,
                width: size,
                height: size,
                background: color,
                opacity: alpha,
                filter: `blur(${size * 0.2}px)`,
              }}
            />
          )
        })}

      {/* Ball */}
      <div
        className="absolute rounded-full"
        style={{
          left: pos.x - 14,
          top: pos.y - 14,
          width: 28,
          height: 28,
          background: color,
          boxShadow: `0 0 16px ${color}, 0 0 32px ${color}40`,
          cursor: "grab",
          transition: reduced ? "none" : undefined,
          touchAction: "none",
          willChange: "transform",
          transform: `translate(0px, 0px)`,
        }}
      />

      {/* Mode label */}
      <div
        className="absolute bottom-2 right-3"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color,
          letterSpacing: "0.12em",
          opacity: 0.7,
        }}
      >
        {mode === "repulsion" ? "↑ BOUNCE / ELASTIC" : "→ SLIDE / ACCELERATE"}
      </div>

      {/* Velocity readout */}
      <div
        className="absolute bottom-2 left-3"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--concrete-gray)",
          letterSpacing: "0.08em",
          opacity: 0.6,
        }}
      >
        VELOCITY: {velocity < 0.1 ? "—" : velocity.toFixed(1)}
      </div>

      {/* Easter egg toast */}
      {easterEgg && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(10,10,12,0.95)",
              border: `1px solid ${color}`,
              color,
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              padding: "10px 18px",
              letterSpacing: "0.1em",
              boxShadow: `0 0 20px ${color}40`,
            }}
          >
            TARGET REACHED — TEST CHAMBER PROTOCOL SATISFIED
          </div>
        </div>
      )}
    </div>
  )
}
