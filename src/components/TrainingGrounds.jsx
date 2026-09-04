import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowChevron, ResetIcon, StatusDot } from "./Icons"
import { playGelBounce, playGelSpeed } from "../lib/audioManager"

// ─── Training Grounds — gel + portal combination chamber ────────────────────
// Side-view practice room. Blue floor zone bounces, orange floor zone slides,
// portals preserve momentum, and the momentum gate above the far ledge only
// opens for gel-grade velocity. No fail state: the pit repositions, retry free.

const BLUE = "#1E90FF"
const ORANGE = "#FF7A1A"
const FLOOR = "#1A1A1E"
const WALL = "#0E0E12"
const WALL_EDGE = "#2A2A30"
const PLAYER_COL = "#F2F2EF"
const PROMPT_COLOR = "#D9A441"

const W = 640
const H = 360
const WT = 16
const GROUND_Y = 290
const PLAYER_R = 8
const PORTAL_RADIUS = 22
const GATE_SPEED = 7 // minimum speed (px/frame) the gate respects
const BEST_KEY = "chamber-zero:training-best"

const SPAWN = { x: 44, y: GROUND_Y - PLAYER_R - 2 }
const BLUE_ZONE = { x0: 56, x1: 200 }
const ORANGE_ZONE = { x0: 290, x1: 450 }
const PIT = { x0: 450, x1: 562 }
const LEDGE = { x: 562, y: 170, w: 62, h: 14 }
const GATE = { x: 560, y: 104, w: 60, h: 66 }

const NOTE_LINES = [
  "FACILITY LOG #0482",
  "COMBINATION YIELD: 214%.",
  "Subject successfully combined",
  "unrelated product lines.",
  "Marketing has been notified.",
  "Your file now reads: adequate.",
]

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function readBest() {
  try {
    const v = localStorage.getItem(BEST_KEY)
    return v ? parseFloat(v) : null
  } catch {
    return null
  }
}

export default function TrainingGrounds({ onInteraction, onComboReward }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const [prompt, setPrompt] = useState("")
  const promptRef = useRef("")
  const [hud, setHud] = useState({
    blue: false,
    orange: false,
    rewarded: false,
    time: 0,
    best: null,
    newBest: false,
    running: false,
  })
  const [armed, setArmed] = useState("move") // touch: move | blue | orange
  const armedRef = useRef("move")
  const [isTouch] = useState(
    () => typeof window !== "undefined" && "ontouchstart" in window,
  )

  const stateRef = useRef({
    px: SPAWN.x,
    py: SPAWN.y,
    vx: 0,
    vy: 0,
    onGround: true,
    keys: {},
    touchTarget: null,
    bluePortal: null,
    orangePortal: null,
    portalAim: null,
    teleportCooldown: 0,
    teleportFlashTime: 0,
    facing: 1,
    walkTimer: 0,
    walkFrame: 0,
    squash: 1,
    particles: [],
    statusText: "CROSS THE PIT. THE GATE RESPECTS ONLY GEL-GRADE VELOCITY.",
    rewarded: false,
    rewardFlash: 0,
    runState: "idle", // idle | running | done
    runStart: 0,
    finalTime: 0,
    hintTimer: 0,
    showHint: false,
    reduced: false,
    time: 0,
  })

  const setPromptThrottled = useCallback((text) => {
    if (promptRef.current !== text) {
      promptRef.current = text
      setPrompt(text)
    }
  }, [])

  const syncHud = useCallback(() => {
    const s = stateRef.current
    setHud((prev) => {
      const next = {
        blue: !!s.bluePortal,
        orange: !!s.orangePortal,
        rewarded: s.rewarded,
        time: s.runState === "done" ? s.finalTime : s.runState === "running" ? (performance.now() - s.runStart) / 1000 : 0,
        best: readBest(),
        newBest: s.newBest === true,
        running: s.runState === "running",
      }
      if (
        prev.blue === next.blue &&
        prev.orange === next.orange &&
        prev.rewarded === next.rewarded &&
        prev.newBest === next.newBest &&
        prev.running === next.running &&
        Math.abs(prev.time - next.time) < 0.05
      ) {
        return prev
      }
      return next
    })
  }, [])

  const resetRoom = useCallback(() => {
    const s = stateRef.current
    s.px = SPAWN.x
    s.py = SPAWN.y
    s.vx = 0
    s.vy = 0
    s.onGround = true
    s.bluePortal = null
    s.orangePortal = null
    s.touchTarget = null
    s.particles = []
    s.squash = 1
    s.runState = "idle"
    s.finalTime = 0
    s.newBest = false
    s.hintTimer = 0
    s.showHint = false
    s.statusText = "CROSS THE PIT. THE GATE RESPECTS ONLY GEL-GRADE VELOCITY."
    syncHud()
  }, [syncHud])

  // Live timer tick for the HUD (10Hz — cheap, no per-frame setState).
  useEffect(() => {
    const id = setInterval(() => {
      if (stateRef.current.runState === "running") syncHud()
    }, 100)
    return () => clearInterval(id)
  }, [syncHud])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const s = stateRef.current
    armedRef.current = "move"

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    s.reduced = mq.matches
    const onReduced = (e) => {
      s.reduced = e.matches
    }
    mq.addEventListener("change", onReduced)

    const startRun = (now) => {
      if (s.runState === "idle" || s.runState === "done") {
        s.runState = "running"
        s.runStart = now
        s.newBest = false
        if (s.rewarded) {
          // A new attempt after a solved run re-arms the room, not the note.
          s.rewardFlash = 0
        }
      }
    }

    const firePortal = (color, x, y) => {
      const pos = {
        x: clamp(x, WT + 12, W - WT - 12),
        y: clamp(y, WT + 12, GROUND_Y - 4),
      }
      if (color === "blue") s.bluePortal = { ...pos }
      else s.orangePortal = { ...pos }
      window.dispatchEvent(
        new CustomEvent("portal-fired", { detail: { color } }),
      )
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2
        s.particles.push({
          x: pos.x,
          y: pos.y,
          vx: Math.cos(angle) * (1 + Math.random() * 1.5),
          vy: Math.sin(angle) * (1 + Math.random() * 1.5),
          color: color === "blue" ? BLUE : ORANGE,
          alpha: 1,
          life: 0.6,
        })
      }
      onInteraction?.()
      syncHud()
    }

    const onKeyDown = (e) => {
      s.keys[e.code] = true
      if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        e.preventDefault()
      }
      if (e.code === "Space" && s.onGround) {
        s.vy = -4.6
        s.onGround = false
        startRun(performance.now())
      }
      if (e.code === "KeyR") resetRoom()
      if (e.code === "Digit1") {
        armedRef.current = "blue"
        setArmed("blue")
      }
      if (e.code === "Digit2") {
        armedRef.current = "orange"
        setArmed("orange")
      }
      if (e.code === "Digit3" || e.code === "Escape") {
        armedRef.current = "move"
        setArmed("move")
      }
      if (["KeyA", "KeyD", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        startRun(performance.now())
      }
    }
    const onKeyUp = (e) => {
      s.keys[e.code] = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    const canvasPos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left) * (W / rect.width),
        y: (clientY - rect.top) * (H / rect.height),
      }
    }
    const onMouseMove = (e) => {
      s.portalAim = canvasPos(e.clientX, e.clientY)
    }
    const onMouseDown = (e) => {
      if (isTouch) return
      const p = canvasPos(e.clientX, e.clientY)
      if (e.button === 0) firePortal("blue", p.x, p.y)
      else if (e.button === 2) firePortal("orange", p.x, p.y)
    }
    const onContextMenu = (e) => e.preventDefault()
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("contextmenu", onContextMenu)

    const onTouchStart = (e) => {
      e.preventDefault()
      const t = e.touches[0]
      if (!t) return
      const p = canvasPos(t.clientX, t.clientY)
      const mode = armedRef.current
      if (mode === "blue" || mode === "orange") {
        firePortal(mode, p.x, p.y)
      } else {
        s.touchTarget = p
        startRun(performance.now())
      }
    }
    const onTouchEnd = () => {
      // Keep walking toward the target briefly; clear on arrival in tick.
    }
    canvas.addEventListener("touchstart", onTouchStart, { passive: false })
    canvas.addEventListener("touchend", onTouchEnd)

    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3)
      lastTime = now
      s.time = now

      if (s.teleportCooldown > 0) s.teleportCooldown -= (dt * 16.67) / 1000
      if (s.rewardFlash > 0) s.rewardFlash = Math.max(0, s.rewardFlash - dt * 0.02)
      s.squash += (1 - s.squash) * Math.min(1, dt * 0.25)

      // Hint after 25s of trying without the combo.
      if (!s.rewarded && s.runState === "running") {
        s.hintTimer += dt / 60
        if (s.hintTimer > 25) s.showHint = true
      }

      // ─── Movement ───
      let moveX = 0
      if (s.keys["KeyA"] || s.keys["ArrowLeft"]) moveX -= 1
      if (s.keys["KeyD"] || s.keys["ArrowRight"]) moveX += 1
      if (s.touchTarget) {
        const dx = s.touchTarget.x - s.px
        if (Math.abs(dx) > 6) moveX = Math.sign(dx)
        else s.touchTarget = null
      }
      if (moveX !== 0) {
        s.facing = moveX
        s.walkTimer += dt * 0.18
        s.walkFrame = Math.floor(s.walkTimer) % 4
      } else {
        s.walkFrame = 0
        s.walkTimer = 0
      }

      const inBlue = s.px >= BLUE_ZONE.x0 && s.px <= BLUE_ZONE.x1
      const inOrange = s.px >= ORANGE_ZONE.x0 && s.px <= ORANGE_ZONE.x1

      if (s.onGround) {
        if (inOrange) {
          // Propulsion gel: near-zero friction, feeble steering, builds speed.
          const dir = Math.abs(s.vx) > 0.4 ? Math.sign(s.vx) : moveX !== 0 ? moveX : s.facing
          s.vx += dir * 0.5 * dt
          s.vx += (moveX * 2.6 - s.vx) * 0.03 * dt
          s.vx = clamp(s.vx, -9, 9)
          if (Math.abs(s.vx) > 4 && now - (s.lastSpeedSfx || 0) > 700) {
            s.lastSpeedSfx = now
            playGelSpeed()
          }
        } else {
          // Neutral ground: snappy, full control.
          s.vx += (moveX * 2.6 - s.vx) * Math.min(1, 0.35 * dt)
        }
      } else {
        // Airborne: weak steering, but portal momentum is sacred — fast
        // flight decays gently instead of being clamped away.
        s.vx += moveX * 0.32 * dt
        const maxAir = 3.4
        if (Math.abs(s.vx) > maxAir) {
          const excess = Math.abs(s.vx) - maxAir
          s.vx -= Math.sign(s.vx) * Math.min(excess, 0.09 * dt)
        } else {
          s.vx = clamp(s.vx, -maxAir, maxAir)
        }
      }

      // Integrate horizontal + wall/ledge-face collisions.
      let nx = s.px + s.vx * dt
      // Ledge face blocks walking in at ground level.
      if (
        s.py + PLAYER_R > LEDGE.y + 8 &&
        s.px + PLAYER_R <= LEDGE.x &&
        nx + PLAYER_R > LEDGE.x
      ) {
        nx = LEDGE.x - PLAYER_R
        s.vx = 0
      }
      nx = clamp(nx, WT + PLAYER_R, W - WT - PLAYER_R)
      s.px = nx

      // Gravity.
      s.vy = Math.min(12, s.vy + 0.22 * dt)
      s.py += s.vy * dt

      // Ceiling.
      if (s.py - PLAYER_R < WT) {
        s.py = WT + PLAYER_R
        s.vy = Math.max(0, s.vy)
      }

      // Ground / ledge / pit resolution.
      const feet = s.py + PLAYER_R
      const overPit = s.px > PIT.x0 && s.px < PIT.x1
      const overLedge = s.px >= LEDGE.x && s.px <= LEDGE.x + LEDGE.w
      if (s.vy >= 0) {
        if (overLedge && feet >= LEDGE.y && s.py + PLAYER_R - s.vy * dt <= LEDGE.y + 10) {
          s.py = LEDGE.y - PLAYER_R
          s.vy = 0
          s.onGround = true
        } else if (!overPit && feet >= GROUND_Y) {
          s.py = GROUND_Y - PLAYER_R
          // Landing on blue gel: involuntary bounce, bigger when moving.
          if (inBlue && s.vy > 0.5) {
            s.vy = -(9 + Math.min(5, Math.abs(s.vx) * 0.55))
            s.onGround = false
            s.squash = 0.55
            playGelBounce()
            s.statusText = "REPULSION BOOST — REDIRECT IT THROUGH A PORTAL"
            for (let i = 0; i < 12; i++) {
              s.particles.push({
                x: s.px + (Math.random() - 0.5) * 18,
                y: GROUND_Y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 7 - 2,
                color: BLUE,
                alpha: 1,
                life: 0.6,
              })
            }
          } else {
            s.vy = 0
            s.onGround = true
          }
        } else if (!overPit && !overLedge) {
          s.onGround = feet >= GROUND_Y - 0.5
        } else {
          s.onGround = false
        }
      }
      // Walking onto blue gel while grounded: small involuntary hops.
      if (s.onGround && inBlue && !overPit && feet >= GROUND_Y - 0.5) {
        s.vy = -6.5
        s.onGround = false
        s.squash = 0.7
        playGelBounce()
        s.statusText = "REPULSION BOOST — REDIRECT IT THROUGH A PORTAL"
      }

      // Recovery pit: falling in just repositions. No penalty, just retry.
      if (s.py > H + 30) {
        s.px = SPAWN.x
        s.py = SPAWN.y
        s.vx = 0
        s.vy = 0
        s.onGround = true
        s.touchTarget = null
        s.statusText = "RECOVERY PIT — SUBJECT REPOSITIONED. NO PENALTY ASSESSED."
      }

      // ─── Walk-through portals (momentum preserved) ───
      if (s.bluePortal && s.orangePortal && s.teleportCooldown <= 0) {
        const dBlue = dist({ x: s.px, y: s.py }, s.bluePortal)
        const dOrange = dist({ x: s.px, y: s.py }, s.orangePortal)
        const jump = (from, to, color) => {
          s.px = clamp(to.x + s.facing * 14, WT + PLAYER_R + 2, W - WT - PLAYER_R - 2)
          s.py = clamp(to.y, WT + PLAYER_R, GROUND_Y - PLAYER_R)
          s.teleportCooldown = 0.5
          s.teleportFlashTime = now
          window.dispatchEvent(new CustomEvent("audio:portal-crossing"))
          for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI * 2
            s.particles.push({
              x: from.x, y: from.y,
              vx: Math.cos(a) * (2 + Math.random() * 2),
              vy: Math.sin(a) * (2 + Math.random() * 2),
              color: color === "blue" ? BLUE : ORANGE,
              alpha: 1, life: 0.6,
            })
          }
        }
        if (dBlue < PORTAL_RADIUS) jump(s.bluePortal, s.orangePortal, "blue")
        else if (dOrange < PORTAL_RADIUS) jump(s.orangePortal, s.bluePortal, "orange")
      }

      // ─── Momentum gate ───
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      const inGate =
        s.px >= GATE.x && s.px <= GATE.x + GATE.w &&
        s.py >= GATE.y && s.py <= GATE.y + GATE.h
      if (inGate && !s.rewarded) {
        if (speed >= GATE_SPEED) {
          s.rewarded = true
          s.rewardFlash = 1
          if (s.runState !== "running") startRun(now)
          s.runState = "done"
          s.finalTime = (now - s.runStart) / 1000
          const prevBest = readBest()
          if (!prevBest || s.finalTime < prevBest) {
            try {
              localStorage.setItem(BEST_KEY, String(s.finalTime))
            } catch { /* private mode — best time simply won't persist */ }
            s.newBest = true
          }
          s.statusText = "COMBINATION YIELD: 214% — FACILITY LOG #0482 RECOVERED"
          for (let i = 0; i < 26; i++) {
            const a = Math.random() * Math.PI * 2
            s.particles.push({
              x: s.px, y: s.py,
              vx: Math.cos(a) * (1.5 + Math.random() * 3),
              vy: Math.sin(a) * (1.5 + Math.random() * 3),
              color: i % 2 ? BLUE : ORANGE,
              alpha: 1, life: 0.9,
            })
          }
          onComboReward?.()
          syncHud()
        } else if (s.bluePortal && s.orangePortal) {
          s.statusText = "INSUFFICIENT MOMENTUM — THE GATE REQUIRES GEL-GRADE VELOCITY"
        }
      }

      // ─── Particles ───
      s.particles = s.particles.filter((p) => {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.alpha -= 0.03 * dt
        return p.alpha > 0
      })

      setPromptThrottled(s.statusText)

      // ─── Draw ───
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#080810"
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 0.3
      ctx.globalAlpha = 0.06
      for (let gx = 0; gx < W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
      }
      for (let gy = 0; gy < H; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Floor slabs (skip the pit)
      ctx.fillStyle = FLOOR
      ctx.fillRect(WT, GROUND_Y, PIT.x0 - WT, H - GROUND_Y)
      ctx.fillRect(PIT.x1, GROUND_Y, W - WT - PIT.x1, H - GROUND_Y)

      // Blue repulsion zone
      const blueGrad = ctx.createLinearGradient(0, GROUND_Y - 4, 0, GROUND_Y + 14)
      blueGrad.addColorStop(0, BLUE)
      blueGrad.addColorStop(1, "rgba(15,74,128,0.35)")
      ctx.fillStyle = blueGrad
      ctx.fillRect(BLUE_ZONE.x0, GROUND_Y - 4, BLUE_ZONE.x1 - BLUE_ZONE.x0, 18)
      ctx.shadowColor = BLUE
      ctx.shadowBlur = 14
      ctx.strokeStyle = BLUE
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(BLUE_ZONE.x0, GROUND_Y - 4)
      ctx.lineTo(BLUE_ZONE.x1, GROUND_Y - 4)
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.font = "9px monospace"
      ctx.fillStyle = BLUE
      ctx.fillText("REPULSION GEL", BLUE_ZONE.x0 + 8, GROUND_Y + 26)

      // Orange propulsion zone
      const orangeGrad = ctx.createLinearGradient(ORANGE_ZONE.x0, 0, ORANGE_ZONE.x1, 0)
      orangeGrad.addColorStop(0, "rgba(255,122,26,0.35)")
      orangeGrad.addColorStop(1, ORANGE)
      ctx.fillStyle = orangeGrad
      ctx.fillRect(ORANGE_ZONE.x0, GROUND_Y - 4, ORANGE_ZONE.x1 - ORANGE_ZONE.x0, 12)
      ctx.shadowColor = ORANGE
      ctx.shadowBlur = 14
      ctx.strokeStyle = ORANGE
      ctx.lineWidth = 2
      ctx.strokeRect(ORANGE_ZONE.x0, GROUND_Y - 4, ORANGE_ZONE.x1 - ORANGE_ZONE.x0, 12)
      ctx.shadowBlur = 0
      ctx.fillStyle = ORANGE
      ctx.fillText("PROPULSION GEL", ORANGE_ZONE.x0 + 8, GROUND_Y + 26)

      // Recovery pit
      ctx.fillStyle = "rgba(0,0,0,0.55)"
      ctx.fillRect(PIT.x0, GROUND_Y, PIT.x1 - PIT.x0, H - GROUND_Y)
      ctx.strokeStyle = "rgba(217,164,65,0.5)"
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.strokeRect(PIT.x0, GROUND_Y, PIT.x1 - PIT.x0, H - GROUND_Y)
      ctx.setLineDash([])
      ctx.fillStyle = "rgba(217,164,65,0.75)"
      ctx.fillText("RECOVERY PIT — FALLING IS FINE", PIT.x0 + 8, GROUND_Y + 26)

      // Walls
      ctx.fillStyle = WALL
      ctx.fillRect(0, 0, W, WT)
      ctx.fillRect(0, 0, WT, H)
      ctx.fillRect(W - WT, 0, WT, H)
      ctx.fillRect(0, H - WT, W, WT)
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 1
      ctx.strokeRect(WT, WT, W - WT * 2, H - WT * 2)

      // Ledge
      ctx.fillStyle = "#1E1E28"
      ctx.fillRect(LEDGE.x, LEDGE.y, LEDGE.w, LEDGE.h)
      ctx.strokeStyle = s.rewarded ? BLUE : "rgba(255,255,255,0.25)"
      ctx.lineWidth = 2
      ctx.strokeRect(LEDGE.x, LEDGE.y, LEDGE.w, LEDGE.h)

      // Facility-log note on the ledge
      const noteX = LEDGE.x + 12
      const noteY = LEDGE.y - 66
      ctx.fillStyle = s.rewarded ? "rgba(30,144,255,0.12)" : "rgba(255,255,255,0.03)"
      ctx.fillRect(noteX - 6, noteY - 12, 118, 60)
      ctx.strokeStyle = s.rewarded ? BLUE : "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      ctx.strokeRect(noteX - 6, noteY - 12, 118, 60)
      ctx.font = "7px monospace"
      NOTE_LINES.forEach((line, i) => {
        ctx.fillStyle = !s.rewarded && i > 0 ? "rgba(140,140,135,0.35)" : i === 0 ? (s.rewarded ? BLUE : "rgba(140,140,135,0.7)") : "rgba(242,242,239,0.85)"
        ctx.fillText(!s.rewarded && i > 0 ? "▓▓▓▓▓▓▓▓▓▓▓▓" : line, noteX, noteY + i * 8)
      })

      // Momentum gate arch
      const gateGlow = s.rewarded ? 0.9 : 0.35 + Math.sin(now * 0.004) * 0.1
      ctx.strokeStyle = s.rewarded ? BLUE : `rgba(217,164,65,${gateGlow})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(GATE.x, GATE.y + GATE.h)
      ctx.lineTo(GATE.x, GATE.y)
      ctx.lineTo(GATE.x + GATE.w, GATE.y)
      ctx.lineTo(GATE.x + GATE.w, GATE.y + GATE.h)
      ctx.stroke()
      ctx.font = "9px monospace"
      ctx.fillStyle = s.rewarded ? "#FFFFFF" : PROMPT_COLOR
      ctx.fillText(
        s.rewarded ? "GATE SATISFIED" : `MOMENTUM GATE [${GATE_SPEED.toFixed(1)}+ M/S]`,
        GATE.x - 14,
        GATE.y - 8,
      )

      // Portals
      const drawPortal = (p, color) => {
        if (!p) return
        ctx.save()
        ctx.shadowColor = color
        ctx.shadowBlur = 16
        ctx.strokeStyle = color
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, 10, 16, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(5,5,8,0.85)"
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, 7, 12, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "rgba(255,255,255,0.7)"
        ctx.lineWidth = 1.5
        const a = now * 0.005
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, 10, 16, 0, a, a + Math.PI * 1.2)
        ctx.stroke()
        ctx.restore()
      }
      drawPortal(s.bluePortal, BLUE)
      drawPortal(s.orangePortal, ORANGE)

      // Linked-portal cue
      if (s.bluePortal && s.orangePortal) {
        ctx.strokeStyle = "rgba(255,255,255,0.12)"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 6])
        ctx.beginPath()
        ctx.moveTo(s.bluePortal.x, s.bluePortal.y)
        ctx.lineTo(s.orangePortal.x, s.orangePortal.y)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Aim marker (desktop)
      if (!isTouch && s.portalAim) {
        ctx.strokeStyle = "rgba(242,242,239,0.4)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(s.portalAim.x, s.portalAim.y, 7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(s.portalAim.x - 11, s.portalAim.y)
        ctx.lineTo(s.portalAim.x - 4, s.portalAim.y)
        ctx.moveTo(s.portalAim.x + 4, s.portalAim.y)
        ctx.lineTo(s.portalAim.x + 11, s.portalAim.y)
        ctx.moveTo(s.portalAim.x, s.portalAim.y - 11)
        ctx.lineTo(s.portalAim.x, s.portalAim.y - 4)
        ctx.moveTo(s.portalAim.x, s.portalAim.y + 4)
        ctx.lineTo(s.portalAim.x, s.portalAim.y + 11)
        ctx.stroke()
      }

      // Particles
      for (const p of s.particles) {
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Player (stickman with bounce squash; neutral when reduced motion)
      drawPlayer(ctx, s.px, s.py, s.facing, s.walkFrame, s.walkTimer, s.reduced ? 1 : s.squash)

      // Teleport flash (skipped under reduced motion)
      if (!s.reduced && now - s.teleportFlashTime < 220) {
        const a = 1 - (now - s.teleportFlashTime) / 220
        ctx.fillStyle = `rgba(242,242,239,${a * 0.35})`
        ctx.fillRect(0, 0, W, H)
      }
      // Reward flash (skipped under reduced motion)
      if (!s.reduced && s.rewardFlash > 0) {
        ctx.fillStyle = `rgba(30,144,255,${s.rewardFlash * 0.22})`
        ctx.fillRect(0, 0, W, H)
      }

      // Hint
      if (s.showHint && !s.rewarded) {
        ctx.font = "10px monospace"
        ctx.fillStyle = PROMPT_COLOR
        ctx.fillText("TIP: GEL VELOCITY SURVIVES PORTAL TRANSIT. SPRINT, THEN PORTAL.", 110, 44)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    syncHud()

    return () => {
      cancelAnimationFrame(rafRef.current)
      mq.removeEventListener("change", onReduced)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mousedown", onMouseDown)
      canvas.removeEventListener("contextmenu", onContextMenu)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchend", onTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setArm = (mode) => {
    armedRef.current = mode
    setArmed(mode)
  }

  return (
    <section
      id="chamber-03"
      className="chamber-section"
      style={{ background: "var(--void-black)", position: "relative" }}
    >
      {/* Ambient wash — blue/orange split */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 50% at 25% 40%, rgba(15,74,128,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 75% 60%, rgba(140,67,16,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">
        <div
          className="text-xs mb-3 tracking-widest"
          style={{ color: "var(--concrete-gray)", fontFamily: "var(--font-mono)" }}
        >
          [03] TRAINING GROUNDS
        </div>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          APPLIED MOMENTUM
        </h2>
        <p
          className="max-w-2xl text-base leading-relaxed mb-8"
          style={{ color: "var(--concrete-gray)", fontFamily: "var(--font-body)" }}
        >
          The gels were only half the curriculum. This room has{" "}
          <strong style={{ color: BLUE }}>live Repulsion flooring</strong>,{" "}
          <strong style={{ color: ORANGE }}>live Propulsion flooring</strong>, a
          portal-compatible everything, and a momentum gate guarding Facility
          Log #0482. The gate respects only gel-grade velocity — arrive slowly
          and it will simply watch you fail to impress it.
        </p>

        {/* HUD */}
        <div
          className="flex items-center gap-4 px-4 py-2 mb-0 flex-wrap"
          style={{
            border: "1px solid var(--border-subtle)",
            borderBottom: "none",
            borderRadius: "4px 4px 0 0",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span className="inline-flex items-center gap-1.5" style={{ color: "var(--facility-white)" }}>
            <StatusDot size={6} color={hud.rewarded ? BLUE : PROMPT_COLOR} />
            {hud.rewarded ? "LOG #0482 RECOVERED" : "LOG #0482 SEALED"}
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            BLUE {hud.blue ? <strong style={{ color: BLUE }}>PLACED</strong> : "—"} · ORANGE{" "}
            {hud.orange ? <strong style={{ color: ORANGE }}>PLACED</strong> : "—"}
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            TIME: <strong className="text-white tabular-nums">{hud.time.toFixed(1)}S</strong>
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            BEST COMBO:{" "}
            <strong className="tabular-nums" style={{ color: hud.newBest ? BLUE : "var(--facility-white)" }}>
              {hud.best != null ? `${hud.best.toFixed(1)}S${hud.newBest ? " — NEW" : ""}` : "—"}
            </strong>
          </span>
          <span style={{ flex: 1 }} />
          {isTouch && (
            <span className="inline-flex items-center gap-1.5">
              {[
                ["move", "MOVE"],
                ["blue", "BLUE"],
                ["orange", "ORANGE"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setArm(id)}
                  aria-pressed={armed === id}
                  aria-label={`${label} mode`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    padding: "4px 10px",
                    minHeight: "44px",
                    minWidth: "44px",
                    cursor: "pointer",
                    color: armed === id ? "#0A0A0E" : "var(--concrete-gray)",
                    background:
                      armed === id
                        ? id === "blue" ? BLUE : id === "orange" ? ORANGE : "var(--facility-white)"
                        : "transparent",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "3px",
                  }}
                >
                  {label}
                </button>
              ))}
            </span>
          )}
          <button
            onClick={resetRoom}
            aria-label="Reset training room"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs tracking-wider border rounded"
            style={{
              fontFamily: "var(--font-mono)",
              borderColor: "var(--border-subtle)",
              color: "var(--concrete-gray)",
              background: "transparent",
              cursor: "pointer",
              minHeight: isTouch ? "44px" : undefined,
            }}
          >
            <ResetIcon size={11} color="var(--concrete-gray)" />
            RESET
          </button>
        </div>

        {/* Playable room */}
        <div
          className="relative w-full overflow-hidden select-none"
          style={{
            background: "rgba(10,10,14,0.95)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0 0 4px 4px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full block"
            style={{ height: "360px", cursor: isTouch ? "default" : "crosshair", touchAction: "none" }}
          />
          <div
            className="absolute bottom-2 left-4 px-2.5 py-1 rounded"
            style={{
              background: "rgba(5,5,8,0.85)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: hud.rewarded ? "#FFFFFF" : "var(--concrete-gray)",
              border: "1px solid var(--border-subtle)",
              letterSpacing: "0.06em",
              maxWidth: "70%",
            }}
          >
            {prompt || "CROSS THE PIT. THE GATE RESPECTS ONLY GEL-GRADE VELOCITY."}
          </div>
          <div
            className="absolute bottom-2 right-4 text-[9px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--concrete-gray)",
              opacity: 0.6,
            }}
          >
            {isTouch ? "TAP TO MOVE · ARM A COLOR, TAP TO FIRE" : "WASD MOVE · SPACE JUMP · CLICK FIRE BLUE · RIGHT-CLICK FIRE ORANGE · R RESET"}
          </div>
        </div>

        <div
          className="mt-4 text-xs inline-flex items-center gap-2"
          style={{ color: "var(--concrete-gray)", fontFamily: "var(--font-mono)", opacity: 0.6 }}
        >
          SUPPLEMENTAL MATERIAL — COMPLETION OPTIONAL, RETRY UNLIMITED
          <ArrowChevron size={12} color="var(--concrete-gray)" />
        </div>
      </div>
    </section>
  )
}

function drawPlayer(ctx, x, y, facing, walkFrame, walkTimer, squash) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(facing * (1 / Math.sqrt(Math.max(0.3, squash))), squash)
  ctx.strokeStyle = PLAYER_COL
  ctx.fillStyle = PLAYER_COL
  ctx.lineWidth = 2
  ctx.lineCap = "round"

  const isMoving = walkFrame !== 0
  const swing = isMoving ? Math.sin(walkTimer * Math.PI * 2) * 0.4 : 0

  ctx.beginPath()
  ctx.arc(0, -10, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -5)
  ctx.lineTo(0, 6)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(-7, 1 + swing * 5)
  ctx.lineTo(0, -2)
  ctx.lineTo(7, 1 - swing * 5)
  ctx.stroke()

  ctx.beginPath()
  if (isMoving) {
    ctx.moveTo(-5, 14 - swing * 4)
    ctx.lineTo(0, 6)
    ctx.lineTo(5, 14 + swing * 4)
  } else {
    ctx.moveTo(-5, 14)
    ctx.lineTo(0, 6)
    ctx.lineTo(5, 14)
  }
  ctx.stroke()

  ctx.restore()
}
