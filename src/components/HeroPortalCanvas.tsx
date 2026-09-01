import { useEffect, useRef } from "react"

interface PortalRing {
  id: number
  x: number
  y: number
  color: string
  startTime: number
}

const BLUE = "#1E90FF"
const ORANGE = "#FF7A1A"
const DURATION = 1400
const MAX_ACTIVE_RINGS = 25

export default function HeroPortalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ringsRef = useRef<PortalRing[]>([])
  const idRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const dprRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const section = canvas.closest("section")
    if (!section) return
    sectionRef.current = section

    // ─── Resize & DPI Management ──────────────────────────────────────────
    const updateSize = () => {
      if (!sectionRef.current || !canvasRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      canvasRef.current.width = Math.max(1, Math.floor(rect.width * dpr))
      canvasRef.current.height = Math.max(1, Math.floor(rect.height * dpr))
      canvasRef.current.style.width = `${rect.width}px`
      canvasRef.current.style.height = `${rect.height}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    updateSize()

    const resizeObserver = new ResizeObserver(() => {
      updateSize()
      if (ringsRef.current.length > 0) {
        startAnimationLoop()
      }
    })
    resizeObserver.observe(section)

    window.addEventListener("resize", updateSize)

    // ─── Render Loop (Bulletproof RAF with Zero Race Conditions) ───────────
    const draw = (now: number) => {
      if (!sectionRef.current || !canvasRef.current) {
        rafIdRef.current = null
        return
      }

      const rect = sectionRef.current.getBoundingClientRect()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dprRef.current, dprRef.current)
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Filter expired rings
      ringsRef.current = ringsRef.current.filter(
        (r) => now - r.startTime < DURATION,
      )

      if (ringsRef.current.length === 0) {
        rafIdRef.current = null
        return
      }

      for (const ring of ringsRef.current) {
        const t = (now - ring.startTime) / DURATION
        const eased = 1 - Math.pow(1 - t, 3)
        const maxRadius = Math.max(rect.width, rect.height) * 0.4
        const radius = maxRadius * eased
        const alpha = Math.max(0, 1 - t * t)
        const coreAlpha = Math.max(0, 1 - t * 1.6)

        // Initial flash burst
        if (t < 0.08) {
          const flashAlpha = (1 - t / 0.08) * 0.6
          const flashRadius = radius * 0.3 + 20
          const flashGrad = ctx.createRadialGradient(
            ring.x,
            ring.y,
            0,
            ring.x,
            ring.y,
            flashRadius,
          )
          flashGrad.addColorStop(0, ring.color)
          flashGrad.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(ring.x, ring.y, flashRadius, 0, Math.PI * 2)
          ctx.fillStyle = flashGrad
          ctx.globalAlpha = flashAlpha
          ctx.fill()
        }

        // Outer ring
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 3.5 * (1 - t * 0.5)
        ctx.globalAlpha = alpha * 0.95
        ctx.stroke()

        // Inner ring
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, radius * 0.78, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = alpha * 0.45
        ctx.stroke()

        // Radial glow
        const grad = ctx.createRadialGradient(
          ring.x,
          ring.y,
          radius * 0.2,
          ring.x,
          ring.y,
          radius * 0.75,
        )
        grad.addColorStop(0, "transparent")
        grad.addColorStop(0.5, ring.color)
        grad.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, radius * 0.75, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.globalAlpha = alpha * 0.18
        ctx.fill()

        // Dark core
        const coreGrad = ctx.createRadialGradient(
          ring.x,
          ring.y,
          0,
          ring.x,
          ring.y,
          radius * 0.18,
        )
        coreGrad.addColorStop(0, "rgba(5,5,8,0.95)")
        coreGrad.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, radius * 0.18, 0, Math.PI * 2)
        ctx.fillStyle = coreGrad
        ctx.globalAlpha = coreAlpha
        ctx.fill()

        // Particles
        const particleCount = 8
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + t * 2
          const dist = radius * (0.55 + Math.sin(i * 2.1) * 0.2)
          const px = ring.x + Math.cos(angle) * dist
          const py = ring.y + Math.sin(angle) * dist
          const size = 2.5 * (1 - t)
          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fillStyle = ring.color
          ctx.globalAlpha = alpha * 0.8
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      rafIdRef.current = requestAnimationFrame(draw)
    }

    const startAnimationLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(draw)
    }

    const spawnRing = (clientX: number, clientY: number, color: string) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const localX = clientX - rect.left
      const localY = clientY - rect.top

      // Cap maximum active rings to prevent lag during spam clicks
      if (ringsRef.current.length >= MAX_ACTIVE_RINGS) {
        ringsRef.current.shift()
      }

      ringsRef.current.push({
        id: idRef.current++,
        x: localX,
        y: localY,
        color,
        startTime: performance.now(),
      })

      startAnimationLoop()
      window.dispatchEvent(
        new CustomEvent("portal-fired", {
          detail: { color: color === BLUE ? "blue" : "orange" },
        }),
      )
    }

    // ─── Input Handlers (Window-level with Section Bounding) ──────────────
    const handleMouseDown = (e: MouseEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return
      }

      const target = e.target as HTMLElement | null
      if (target?.closest("button, a, input")) {
        return
      }

      if (e.button === 0) {
        spawnRing(e.clientX, e.clientY, BLUE)
      } else if (e.button === 2) {
        spawnRing(e.clientX, e.clientY, ORANGE)
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const target = e.target as HTMLElement | null
        if (!target?.closest("button, a, input")) {
          e.preventDefault()
        }
      }
    }

    let lastTap = 0
    const handleTouch = (e: TouchEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const t = e.touches[0]
      if (
        !t ||
        t.clientX < rect.left ||
        t.clientX > rect.right ||
        t.clientY < rect.top ||
        t.clientY > rect.bottom
      ) {
        return
      }

      const target = e.target as HTMLElement | null
      if (target?.closest("button, a, input")) {
        return
      }

      const now = Date.now()
      if (e.touches.length === 2) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
        spawnRing(cx, cy, ORANGE)
        return
      }
      if (now - lastTap < 300) {
        spawnRing(t.clientX, t.clientY, BLUE)
      }
      lastTap = now
    }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("touchstart", handleTouch, { passive: true })

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateSize)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("touchstart", handleTouch)
      ringsRef.current = []
      rafIdRef.current = null
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
