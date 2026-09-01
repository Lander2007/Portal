import { useEffect, useRef, useState, useCallback } from "react"
import DebriefPanel from "./DebriefPanel"
import { ArrowChevron } from "./Icons"

const BLUE = "#1E90FF"
const ORANGE = "#FF7A1A"
const FLOOR = "#1A1A1E"
const WALL = "#0E0E12"
const WALL_EDGE = "#2A2A30"
const PLAYER_COL = "#F2F2EF"
const DOOR_CLOSED = "#3A3A40"
const DOOR_OPEN = "#0A0A0C"
const BARRIER_COL = "#222226"
const SWITCH_OFF = "#C0392B"
const SWITCH_ON = "#22C55E"
const PROMPT_COLOR = "#D9A441"

const W = 640
const H = 400
const WT = 18
const GROUND_Y = H - 75
const PLAYER_R = 8
const SPEED = 2.6
const BARRIER_X = W / 2 - 10
const BARRIER_W = 20
const BARRIER_TOP = WT
const BARRIER_BOTTOM = GROUND_Y
const SWITCH_X = W - WT - 110
const SWITCH_Y = GROUND_Y - 24
const SWITCH_W = 16
const SWITCH_H = 24
const DOOR_X = W - WT - 38
const DOOR_Y = GROUND_Y - 55
const DOOR_W = 34
const DOOR_H = 55
const PORTAL_RADIUS = 24
const INTERACT_DIST = 38

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export default function FinalPortalPuzzle({
  interactionCount = 0,
  easterEggsFound = 0,
  onExit,
}) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState("puzzle")
  const [solved, setSolved] = useState(false)
  const [hudState, setHudState] = useState({
    bluePlaced: false,
    orangePlaced: false,
    switchActive: false,
    doorOpen: false,
    prompt: "",
  })

  const stateRef = useRef({
    px: WT + 45,
    py: GROUND_Y - PLAYER_R - 2,
    vx: 0,
    vy: 0,
    onGround: true,
    jumpVy: 0,
    keys: {},
    bluePortal: null,
    orangePortal: null,
    portalAim: null,
    firingColor: "blue",
    switchActivated: false,
    teleportCooldown: 0,
    teleportFlashTime: 0,
    teleportFlashPos: null,
    doorOpen: 0,
    doorShudder: 0,
    doorAnimStart: 0,
    transitioning: false,
    fadeAlpha: 0,
    walkFrame: 0,
    walkTimer: 0,
    facing: 1,
    time: 0,
    hintTimer: 0,
    showHint: false,
    switchGlow: 0,
    particles: [],
  })
  const rafRef = useRef(0)

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

    const onKeyDown = (e) => {
      s.keys[e.code] = true
      if (e.code === "Space" && s.onGround) {
        s.jumpVy = -4.5
        s.onGround = false
        e.preventDefault()
      }
      if (e.code === "KeyE") {
        const nearSwitch = dist({ x: s.px, y: s.py }, { x: SWITCH_X + SWITCH_W / 2, y: SWITCH_Y + SWITCH_H / 2 }) < INTERACT_DIST
        if (nearSwitch && !s.switchActivated) {
          s.switchActivated = true
          s.doorAnimStart = performance.now()
          window.dispatchEvent(new CustomEvent("audio:switch-activate"))
          // Spawn celebration particles at switch
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2
            const spd = 1.5 + Math.random() * 2
            s.particles.push({
              x: SWITCH_X + SWITCH_W / 2,
              y: SWITCH_Y + SWITCH_H / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: "#4ADE80",
              alpha: 1,
              life: 1,
            })
          }
          e.preventDefault()
        }
      }
    }
    const onKeyUp = (e) => {
      s.keys[e.code] = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const sx = W / rect.width
      const sy = H / rect.height
      s.portalAim = {
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy,
      }
    }
    const onMouseDown = (e) => {
      if (!s.portalAim || s.transitioning) return
      const pos = {
        x: clamp(s.portalAim.x, WT + 14, W - WT - 14),
        y: clamp(s.portalAim.y, WT + 14, GROUND_Y - 14),
      }

      if (e.button === 0) {
        s.bluePortal = { ...pos }
        s.firingColor = "orange"
        window.dispatchEvent(
          new CustomEvent("portal-fired", { detail: { color: "blue" } }),
        )
        // Spawn fire ripple particles
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2
          s.particles.push({
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * (1 + Math.random() * 1.5),
            vy: Math.sin(angle) * (1 + Math.random() * 1.5),
            color: BLUE,
            alpha: 1,
            life: 0.6,
          })
        }
      } else if (e.button === 2) {
        s.orangePortal = { ...pos }
        s.firingColor = "blue"
        window.dispatchEvent(
          new CustomEvent("portal-fired", { detail: { color: "orange" } }),
        )
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2
          s.particles.push({
            x: pos.x,
            y: pos.y,
            vx: Math.cos(angle) * (1 + Math.random() * 1.5),
            vy: Math.sin(angle) * (1 + Math.random() * 1.5),
            color: ORANGE,
            alpha: 1,
            life: 0.6,
          })
        }
      }
    }
    const onContextMenu = (e) => e.preventDefault()

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("contextmenu", onContextMenu)

    // Touch support
    let lastTap = 0
    const onTouchStart = (e) => {
      const now = Date.now()
      const rect = canvas.getBoundingClientRect()
      if (e.touches.length === 2) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
        s.orangePortal = {
          x: clamp((cx - rect.left) * (W / rect.width), WT + 14, W - WT - 14),
          y: clamp((cy - rect.top) * (H / rect.height), WT + 14, GROUND_Y - 14),
        }
        return
      }
      if (now - lastTap < 300) {
        const t = e.touches[0]
        s.orangePortal = {
          x: clamp((t.clientX - rect.left) * (W / rect.width), WT + 14, W - WT - 14),
          y: clamp((t.clientY - rect.top) * (H / rect.height), WT + 14, GROUND_Y - 14),
        }
      } else {
        const t = e.touches[0]
        s.bluePortal = {
          x: clamp((t.clientX - rect.left) * (W / rect.width), WT + 14, W - WT - 14),
          y: clamp((t.clientY - rect.top) * (H / rect.height), WT + 14, GROUND_Y - 14),
        }
      }
      lastTap = now
    }
    canvas.addEventListener("touchstart", onTouchStart, { passive: true })

    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3)
      lastTime = now
      s.time = now

      // Cooldown timer
      if (s.teleportCooldown > 0) {
        s.teleportCooldown -= (dt * 16.67) / 1000
      }

      // Hint timer
      if (!solved && (!s.bluePortal || !s.orangePortal || !s.switchActivated)) {
        s.hintTimer += dt
        if (s.hintTimer > 600) s.showHint = true
      }

      // ─── Player Movement & Collisions ────────────────────────────────────
      if (!s.transitioning) {
        let moveX = 0
        if (s.keys["KeyA"] || s.keys["ArrowLeft"]) moveX -= 1
        if (s.keys["KeyD"] || s.keys["ArrowRight"]) moveX += 1

        if (moveX !== 0) {
          s.facing = moveX
          s.walkTimer += dt * 0.18
          s.walkFrame = Math.floor(s.walkTimer) % 4
        } else {
          s.walkFrame = 0
          s.walkTimer = 0
        }

        let nx = s.px + moveX * SPEED * dt

        // Check barrier wall collision (barrier blocks direct crossing)
        const onLeftSide = s.px < BARRIER_X
        if (onLeftSide && nx + PLAYER_R >= BARRIER_X) {
          nx = BARRIER_X - PLAYER_R
        } else if (!onLeftSide && nx - PLAYER_R <= BARRIER_X + BARRIER_W) {
          nx = BARRIER_X + BARRIER_W + PLAYER_R
        }

        // Room bounds
        if (nx - PLAYER_R >= WT && nx + PLAYER_R <= W - WT) {
          s.px = nx
        }

        // Jump physics
        if (!s.onGround) {
          s.jumpVy += 0.2 * dt
        }
        s.py += s.jumpVy * dt

        if (s.py >= GROUND_Y - PLAYER_R) {
          s.py = GROUND_Y - PLAYER_R
          s.jumpVy = 0
          s.onGround = true
        }

        // Check if player entered open door
        if (s.doorOpen >= 0.8 && s.px >= DOOR_X - 10 && s.py >= DOOR_Y) {
          if (!s.transitioning) {
            s.transitioning = true
            s.fadeAlpha = 0
          }
        }
      }

      // ─── Walk-Through Portal Teleportation ─────────────────────────────────
      if (s.bluePortal && s.orangePortal && s.teleportCooldown <= 0 && !s.transitioning) {
        const dBlue = dist({ x: s.px, y: s.py }, s.bluePortal)
        const dOrange = dist({ x: s.px, y: s.py }, s.orangePortal)

        if (dBlue < PORTAL_RADIUS) {
          // Walked into Blue Portal -> Teleport to Orange Portal!
          const outOffset = s.facing * 16
          let targetX = clamp(s.orangePortal.x + outOffset, WT + PLAYER_R + 2, W - WT - PLAYER_R - 2)
          // Avoid getting stuck in barrier
          if (targetX >= BARRIER_X && targetX <= BARRIER_X + BARRIER_W) {
            targetX = s.orangePortal.x > BARRIER_X ? BARRIER_X + BARRIER_W + PLAYER_R + 4 : BARRIER_X - PLAYER_R - 4
          }
          s.px = targetX
          s.py = clamp(s.orangePortal.y, WT + PLAYER_R, GROUND_Y - PLAYER_R)
          s.teleportCooldown = 0.5
          s.teleportFlashTime = now
          s.teleportFlashPos = { from: { ...s.bluePortal }, to: { ...s.orangePortal } }
          window.dispatchEvent(new CustomEvent("audio:portal-crossing"))

          // Spawn warp particles at entry and exit
          for (let i = 0; i < 14; i++) {
            const a1 = Math.random() * Math.PI * 2
            s.particles.push({
              x: s.bluePortal.x,
              y: s.bluePortal.y,
              vx: Math.cos(a1) * (2 + Math.random() * 2),
              vy: Math.sin(a1) * (2 + Math.random() * 2),
              color: BLUE,
              alpha: 1,
              life: 0.6,
            })
            const a2 = Math.random() * Math.PI * 2
            s.particles.push({
              x: s.orangePortal.x,
              y: s.orangePortal.y,
              vx: Math.cos(a2) * (2 + Math.random() * 2),
              vy: Math.sin(a2) * (2 + Math.random() * 2),
              color: ORANGE,
              alpha: 1,
              life: 0.6,
            })
          }
        } else if (dOrange < PORTAL_RADIUS) {
          // Walked into Orange Portal -> Teleport to Blue Portal!
          const outOffset = s.facing * 16
          let targetX = clamp(s.bluePortal.x + outOffset, WT + PLAYER_R + 2, W - WT - PLAYER_R - 2)
          if (targetX >= BARRIER_X && targetX <= BARRIER_X + BARRIER_W) {
            targetX = s.bluePortal.x > BARRIER_X ? BARRIER_X + BARRIER_W + PLAYER_R + 4 : BARRIER_X - PLAYER_R - 4
          }
          s.px = targetX
          s.py = clamp(s.bluePortal.y, WT + PLAYER_R, GROUND_Y - PLAYER_R)
          s.teleportCooldown = 0.5
          s.teleportFlashTime = now
          s.teleportFlashPos = { from: { ...s.orangePortal }, to: { ...s.bluePortal } }
          window.dispatchEvent(new CustomEvent("audio:portal-crossing"))

          for (let i = 0; i < 14; i++) {
            const a1 = Math.random() * Math.PI * 2
            s.particles.push({
              x: s.orangePortal.x,
              y: s.orangePortal.y,
              vx: Math.cos(a1) * (2 + Math.random() * 2),
              vy: Math.sin(a1) * (2 + Math.random() * 2),
              color: ORANGE,
              alpha: 1,
              life: 0.6,
            })
            const a2 = Math.random() * Math.PI * 2
            s.particles.push({
              x: s.bluePortal.x,
              y: s.bluePortal.y,
              vx: Math.cos(a2) * (2 + Math.random() * 2),
              vy: Math.sin(a2) * (2 + Math.random() * 2),
              color: BLUE,
              alpha: 1,
              life: 0.6,
            })
          }
        }
      }

      // ─── Switch & Door Animation ──────────────────────────────────────────
      if (s.switchActivated) {
        s.switchGlow = Math.min(s.switchGlow + dt * 0.05, 1)
      }

      if (s.doorAnimStart > 0 && s.doorOpen < 1) {
        const elapsed = now - s.doorAnimStart
        if (elapsed < 200) {
          s.doorShudder = Math.sin(elapsed * 0.05) * 2 * (1 - elapsed / 200)
        } else {
          if (s.doorShudder !== 0) {
            window.dispatchEvent(new CustomEvent("audio:door-open"))
          }
          s.doorShudder = 0
          s.doorOpen = clamp((elapsed - 200) / 700, 0, 1)
        }
      }

      // Transition when entering open door
      if (s.transitioning) {
        s.fadeAlpha = Math.min(s.fadeAlpha + 0.015 * dt, 1)
        if (s.fadeAlpha >= 1 && !solved) {
          setSolved(true)
          setTimeout(() => setPhase("debrief"), 200)
        }
      }

      // ─── Particle Updates ────────────────────────────────────────────────
      s.particles = s.particles.filter((p) => {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.alpha -= 0.025 * dt
        return p.alpha > 0
      })

      // ─── Interaction Prompt Text ──────────────────────────────────────────
      const nearSwitch = dist({ x: s.px, y: s.py }, { x: SWITCH_X + SWITCH_W / 2, y: SWITCH_Y + SWITCH_H / 2 }) < INTERACT_DIST
      let currentPrompt = ""
      if (nearSwitch && !s.switchActivated) {
        currentPrompt = "E — ACTIVATE POWER SWITCH"
      } else if (s.doorOpen >= 0.8 && s.px > BARRIER_X + BARRIER_W) {
        currentPrompt = "PROCEED THROUGH EXIT APERTURE"
      }

      // ─── Draw Canvas ─────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = "#080810"
      ctx.fillRect(0, 0, W, H)

      // Background grid
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 0.3
      ctx.globalAlpha = 0.06
      for (let gx = 0; gx < W; gx += 40) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, H)
        ctx.stroke()
      }
      for (let gy = 0; gy < H; gy += 40) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(W, gy)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Floor
      ctx.fillStyle = FLOOR
      ctx.fillRect(WT, GROUND_Y, W - WT * 2, H - GROUND_Y)

      // Walls
      ctx.fillStyle = WALL
      ctx.fillRect(0, 0, WT, H)
      ctx.fillRect(W - WT, 0, WT, H)
      ctx.fillRect(0, 0, W, WT)

      // Wall inner edge
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 1
      ctx.strokeRect(WT, WT, W - WT * 2, GROUND_Y - WT)

      // Security Barrier Wall (full-height obstruction)
      ctx.fillStyle = BARRIER_COL
      ctx.fillRect(BARRIER_X, BARRIER_TOP, BARRIER_W, BARRIER_BOTTOM - BARRIER_TOP)
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 1.5
      ctx.strokeRect(BARRIER_X, BARRIER_TOP, BARRIER_W, BARRIER_BOTTOM - BARRIER_TOP)

      // Barrier hazard stripes
      ctx.save()
      ctx.globalAlpha = 0.2
      for (let sy = BARRIER_TOP; sy < BARRIER_BOTTOM; sy += 10) {
        ctx.fillStyle = sy % 20 < 10 ? "#D97706" : "transparent"
        ctx.fillRect(BARRIER_X, sy, BARRIER_W, 6)
      }
      ctx.restore()

      // Barrier label
      ctx.save()
      ctx.font = "8px 'Share Tech Mono', monospace"
      ctx.textAlign = "center"
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.fillText("SECURITY BARRIER", BARRIER_X + BARRIER_W / 2, BARRIER_TOP + 16)
      ctx.fillText("HIGH VOLTAGE", BARRIER_X + BARRIER_W / 2, BARRIER_BOTTOM - 20)
      ctx.restore()

      // Power Switch Console (on far side)
      ctx.fillStyle = "#1E1E24"
      ctx.fillRect(SWITCH_X - 4, SWITCH_Y - 4, SWITCH_W + 8, SWITCH_H + 8)
      ctx.strokeStyle = s.switchActivated ? "#4ADE80" : "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(SWITCH_X - 4, SWITCH_Y - 4, SWITCH_W + 8, SWITCH_H + 8)

      // Switch lever/button
      ctx.fillStyle = s.switchActivated ? SWITCH_ON : SWITCH_OFF
      ctx.beginPath()
      ctx.arc(SWITCH_X + SWITCH_W / 2, SWITCH_Y + SWITCH_H / 2, 5, 0, Math.PI * 2)
      ctx.fill()

      // Switch glow
      if (s.switchActivated) {
        const swGlow = ctx.createRadialGradient(
          SWITCH_X + SWITCH_W / 2,
          SWITCH_Y + SWITCH_H / 2,
          2,
          SWITCH_X + SWITCH_W / 2,
          SWITCH_Y + SWITCH_H / 2,
          22,
        )
        swGlow.addColorStop(0, "#4ADE8060")
        swGlow.addColorStop(1, "transparent")
        ctx.fillStyle = swGlow
        ctx.beginPath()
        ctx.arc(SWITCH_X + SWITCH_W / 2, SWITCH_Y + SWITCH_H / 2, 22, 0, Math.PI * 2)
        ctx.fill()
      }

      // Switch label
      ctx.save()
      ctx.font = "8px 'Share Tech Mono', monospace"
      ctx.textAlign = "center"
      ctx.fillStyle = s.switchActivated ? "#4ADE80" : "rgba(255,255,255,0.4)"
      ctx.fillText(s.switchActivated ? "POWER: ON" : "POWER SWITCH", SWITCH_X + SWITCH_W / 2, SWITCH_Y - 8)
      ctx.restore()

      // Exit Door
      const doorGap = DOOR_H * (1 - s.doorOpen)
      const doorOff = s.doorShudder
      if (s.doorOpen < 1) {
        ctx.fillStyle = s.doorOpen > 0.3 ? DOOR_OPEN : DOOR_CLOSED
        ctx.fillRect(DOOR_X + doorOff, GROUND_Y - doorGap, DOOR_W, doorGap)
      }
      // Door frame
      ctx.strokeStyle = s.switchActivated ? "rgba(74, 222, 128, 0.85)" : "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1.5
      ctx.strokeRect(DOOR_X, GROUND_Y - DOOR_H, DOOR_W, DOOR_H)

      // Door indicator
      ctx.beginPath()
      ctx.arc(DOOR_X + DOOR_W / 2, GROUND_Y - DOOR_H - 8, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = s.switchActivated ? "#4ADE80" : "#C0392B"
      ctx.fill()

      if (s.doorOpen >= 0.8) {
        ctx.save()
        ctx.font = "8px 'Share Tech Mono', monospace"
        ctx.textAlign = "center"
        ctx.fillStyle = "#4ADE80"
        ctx.fillText("EXIT", DOOR_X + DOOR_W / 2, GROUND_Y - DOOR_H - 14)
        ctx.restore()
      }

      // ─── Portals ─────────────────────────────────────────────────────────
      if (s.bluePortal) {
        drawPortal(ctx, s.bluePortal.x, s.bluePortal.y, BLUE, now)
      }
      if (s.orangePortal) {
        drawPortal(ctx, s.orangePortal.x, s.orangePortal.y, ORANGE, now)
      }

      // Portal quantum link line (when both exist)
      if (s.bluePortal && s.orangePortal) {
        ctx.save()
        ctx.strokeStyle = BLUE
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.12
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(s.bluePortal.x, s.bluePortal.y)
        ctx.lineTo(s.orangePortal.x, s.orangePortal.y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      // Teleportation flash effect
      if (s.teleportFlashPos && now - s.teleportFlashTime < 350) {
        const flashProgress = (now - s.teleportFlashTime) / 350
        const flashAlpha = (1 - flashProgress) * 0.7
        ctx.save()
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.4})`
        ctx.fillRect(0, 0, W, H)

        // Rings expanding at entry and exit
        ;[s.teleportFlashPos.from, s.teleportFlashPos.to].forEach((pt) => {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, PORTAL_RADIUS + flashProgress * 20, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha})`
          ctx.lineWidth = 2
          ctx.stroke()
        })
        ctx.restore()
      }

      // Draw active particles
      s.particles.forEach((p) => {
        ctx.save()
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ─── Player ──────────────────────────────────────────────────────────
      drawPlayer(ctx, s.px, s.py, s.walkFrame, s.facing, s.onGround, now)

      // Gun selection HUD in canvas
      ctx.save()
      ctx.fillStyle = "rgba(10,10,12,0.85)"
      ctx.fillRect(W / 2 - 130, H - 32, 260, 24)
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1
      ctx.strokeRect(W / 2 - 130, H - 32, 260, 24)
      ctx.font = "9px 'Share Tech Mono', monospace"
      ctx.textAlign = "center"
      ctx.fillStyle = s.firingColor === "blue" ? BLUE : ORANGE
      ctx.fillText(
        `L-CLICK: BLUE PORTAL  ·  R-CLICK: ORANGE PORTAL`,
        W / 2,
        H - 17,
      )
      ctx.restore()

      // Interaction Prompt in canvas
      if (currentPrompt) {
        ctx.save()
        ctx.font = "11px 'Share Tech Mono', monospace"
        ctx.textAlign = "center"
        ctx.fillStyle = PROMPT_COLOR
        ctx.fillText(currentPrompt, W / 2, 42)
        ctx.restore()
      } else if (s.showHint && !solved && !s.switchActivated) {
        ctx.save()
        ctx.font = "10px 'Share Tech Mono', monospace"
        ctx.textAlign = "center"
        ctx.fillStyle = "rgba(217,164,65,0.8)"
        ctx.fillText(
          "FIRE BLUE ON YOUR SIDE · FIRE ORANGE ACROSS BARRIER · WALK THROUGH TO REACH SWITCH",
          W / 2,
          42,
        )
        ctx.restore()
      }

      // Status readout at bottom
      ctx.save()
      ctx.font = "9px 'Share Tech Mono', monospace"
      ctx.textAlign = "left"
      ctx.fillStyle = "rgba(255,255,255,0.35)"
      ctx.fillText(
        `BLUE: ${s.bluePortal ? "PLACED" : "NOT PLACED"}  ·  ORANGE: ${
          s.orangePortal ? "PLACED" : "NOT PLACED"
        }  ·  SWITCH: ${s.switchActivated ? "ACTIVE" : "INACTIVE"}  ·  DOOR: ${
          s.doorOpen >= 1 ? "OPEN" : "SEALED"
        }`,
        WT + 8,
        H - 12,
      )
      ctx.restore()

      // Fade overlay
      if (s.transitioning) {
        ctx.fillStyle = `rgba(10, 10, 12, ${s.fadeAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mousedown", onMouseDown)
      canvas.removeEventListener("contextmenu", onContextMenu)
      canvas.removeEventListener("touchstart", onTouchStart)
    }
  }, [solved])

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center"
      style={{
        background: "var(--void-black)",
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(15,74,128,0.04) 0%, transparent 70%)",
        }}
      />

      {phase === "puzzle" && (
        <>
          <div
            className="mb-2 text-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <div
              className="text-xs tracking-widest mb-1"
              style={{ color: "var(--portal-blue)" }}
            >
              CHAMBER FINAL — EMERGENCY REROUTE
            </div>
            <div
              className="text-base font-bold tracking-wider mb-1"
              style={{
                color: "var(--facility-white)",
                fontFamily: "var(--font-display)",
              }}
            >
              REACH THE SWITCH. USE THE PORTALS TO CROSS.
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="rounded-sm"
            style={{
              width: "min(90vw, 640px)",
              height: "min(70vh, 400px)",
              border: "1px solid var(--border-subtle)",
              cursor: "crosshair",
              touchAction: "none",
            }}
          />

          <div
            className="mt-2 text-center"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--concrete-gray)",
              letterSpacing: "0.1em",
            }}
          >
            WASD — MOVE · SPACE — JUMP · E — INTERACT · L-CLICK: BLUE · R-CLICK: ORANGE
          </div>
        </>
      )}

      {phase === "debrief" && (
        <div className="relative z-20 flex flex-col items-center gap-8 pointer-events-auto">
          {/* Exit portal visual */}
          <div className="relative" style={{ width: 160, height: 220 }}>
            <div
              className="absolute rounded-full"
              style={{
                left: "10%",
                top: "5%",
                width: "80%",
                height: "90%",
                background: "rgba(0,0,5,0.92)",
                border: `3px solid ${BLUE}`,
                boxShadow: `0 0 30px ${BLUE}40, 0 0 60px ${BLUE}15, inset 0 0 30px ${BLUE}10`,
                transform: "scaleX(0.55)",
              }}
            />
            {[0, 60, 120].map((rot) => (
              <div
                key={rot}
                className="absolute rounded-full"
                style={{
                  left: "15%",
                  top: "10%",
                  width: "70%",
                  height: "80%",
                  border: `1.5px solid ${BLUE}`,
                  opacity: 0.5,
                  transform: `rotate(${rot}deg)`,
                  animation: "spin 4s linear infinite",
                }}
              />
            ))}
          </div>

          <DebriefPanel
            interactionCount={interactionCount}
            easterEggsFound={easterEggsFound}
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onExit?.()
            }}
            className="cta-primary relative z-30 inline-flex items-center gap-2 px-8 py-4 text-sm tracking-widest pointer-events-auto cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)",
              color: BLUE,
              border: `1px solid ${BLUE}`,
              cursor: "pointer",
              letterSpacing: "0.12em",
              overflow: "hidden",
            }}
          >
            EXIT THROUGH THE APERTURE
            <span
              className="cta-arrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <ArrowChevron size={14} color={BLUE} />
            </span>
          </button>
          <div
            className="text-center text-xs"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.4,
              letterSpacing: "0.1em",
            }}
          >
            THE FACILITY THANKS YOU FOR YOUR PARTICIPATION
          </div>
        </div>
      )}

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)",
        }}
      />
    </div>
  )
}

function drawPortal(ctx, x, y, color, now) {
  ctx.save()
  const glow = ctx.createRadialGradient(x, y, 5, x, y, 35)
  glow.addColorStop(0, color + "35")
  glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, 35, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.ellipse(x, y, 12, 22, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.ellipse(x, y, 8, 16, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = 1
  ctx.fillStyle = "rgba(0,0,5,0.85)"
  ctx.beginPath()
  ctx.ellipse(x, y, 5, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawPlayer(ctx, x, y, walkFrame, facing, onGround, now) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(facing, 1)
  ctx.strokeStyle = PLAYER_COL
  ctx.fillStyle = PLAYER_COL
  ctx.lineWidth = 2
  ctx.lineCap = "round"

  const isMoving = walkFrame !== 0
  const swing = isMoving ? Math.sin(walkFrame * Math.PI * 0.5) * 0.4 : 0

  // Head
  ctx.beginPath()
  ctx.arc(0, -10, 5, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.beginPath()
  ctx.moveTo(0, -5)
  ctx.lineTo(0, 6)
  ctx.stroke()

  // Arms
  ctx.beginPath()
  ctx.moveTo(-6, 1 + swing * 5)
  ctx.lineTo(0, -2)
  ctx.lineTo(6, 1 - swing * 5)
  ctx.stroke()

  // Legs
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
