import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowChevron } from "../components/Icons"

// ─── Constants ────────────────────────────────────────────────────────────────
const FLOOR = "#1A1A1E"
const WALL = "#0E0E12"
const WALL_EDGE = "#2A2A30"
const STICKMAN = "#F2F2EF"
const CUBE_BODY = "#6E6E74"
const CUBE_BODY_LIGHT = "#8A8A90"
const CUBE_HEART = "#D9A0A0"
const CUBE_HEART_DARK = "#B07878"
const BUTTON_RED = "#C0392B"
const BUTTON_PRESSED = "#8B1A1A"
const DOOR_COLOR = "#3A3A40"
const DOOR_OPEN = "#0A0A0C"
const INTERACT_PROMPT = "#D9A441"

const ROOM_W = 520
const ROOM_H = 380
const WALL_THICKNESS = 18
const PLAYER_R = 8
const PLAYER_SPEED = 2.6
const CUBE_SIZE = 24
const BUTTON_R = 17
const DOOR_W = 44
const DOOR_H = 10
const INTERACT_DIST = 40

// ─── Room layout ──────────────────────────────────────────────────────────────
const INNER_X = WALL_THICKNESS
const INNER_Y = WALL_THICKNESS
const INNER_W = ROOM_W - WALL_THICKNESS * 2
const INNER_H = ROOM_H - WALL_THICKNESS * 2

const SPAWN = { x: INNER_X + 50, y: INNER_Y + INNER_H - 50 }
const CUBE_POS = { x: INNER_X + 70, y: INNER_Y + 60 }
const BUTTON_POS = { x: INNER_X + INNER_W - 80, y: INNER_Y + 55 }
const DOOR_POS = {
  x: INNER_X + INNER_W - DOOR_W / 2,
  y: INNER_Y + INNER_H - DOOR_H,
  w: DOOR_W,
  h: DOOR_H,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function canWalk(x, y) {
  const r = PLAYER_R
  return (
    x - r >= INNER_X &&
    x + r <= INNER_X + INNER_W &&
    y - r >= INNER_Y &&
    y + r <= INNER_Y + INNER_H
  )
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function IntroChamber({ onComplete }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    px: SPAWN.x,
    py: SPAWN.y,
    carrying: false,
    cubeOnButton: false,
    doorOpen: 0,
    doorShudder: 0,
    doorAnimStart: 0,
    transitioning: false,
    fadeAlpha: 0,
    keys: {},
    touchTarget: null,
    interactPressed: false,
    // Animation state
    walkFrame: 0,
    walkTimer: 0,
    facing: 1, // 1 = right, -1 = left
    idleBob: 0,
    pickupAnim: 0,
    pickupFrom: null,
    buttonPressAnim: 0,
    cameraZoom: 1,
    cameraZoomTarget: 1,
    time: 0,
    // Jump
    jumpVy: 0,
    onGround: true,
  })
  const rafRef = useRef(0)
  const [showPrompt, setShowPrompt] = useState("")
  const [reduced, setReduced] = useState(false)

  const skipIntro = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // ─── Canvas game loop ─────────────────────────────────────────────────────
  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = ROOM_W * dpr
    canvas.height = ROOM_H * dpr
    ctx.scale(dpr, dpr)

    const s = stateRef.current

    const onKeyDown = (e) => {
      s.keys[e.code] = true
      if (e.code === "KeyE") {
        s.interactPressed = true
        e.preventDefault()
      }
      if (e.code === "Space" && s.onGround) {
        s.jumpVy = -4.2
        s.onGround = false
        e.preventDefault()
      }
    }
    const onKeyUp = (e) => {
      s.keys[e.code] = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    const onTouch = (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const scaleX = ROOM_W / rect.width
      const scaleY = ROOM_H / rect.height
      const touch = e.touches[0]
      if (!touch) return
      s.touchTarget = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    const onTouchEnd = () => {
      s.touchTarget = null
    }
    canvas.addEventListener("touchstart", onTouch, { passive: false })
    canvas.addEventListener("touchmove", onTouch, { passive: false })
    canvas.addEventListener("touchend", onTouchEnd)

    let lastTime = performance.now()
    let promptText = ""

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.67, 3)
      lastTime = now
      s.time = now

      // ─── Movement ──────────────────────────────────────────────────────
      let dx = 0
      let dy = 0
      if (s.keys["KeyW"] || s.keys["ArrowUp"]) dy -= 1
      if (s.keys["KeyS"] || s.keys["ArrowDown"]) dy += 1
      if (s.keys["KeyA"] || s.keys["ArrowLeft"]) dx -= 1
      if (s.keys["KeyD"] || s.keys["ArrowRight"]) dx += 1

      if (s.touchTarget) {
        const tdx = s.touchTarget.x - s.px
        const tdy = s.touchTarget.y - s.py
        const td = Math.sqrt(tdx * tdx + tdy * tdy)
        if (td > 4) {
          dx = tdx / td
          dy = tdy / td
        } else {
          s.touchTarget = null
        }
      }

      const isMoving = dx !== 0 || dy !== 0
      if (isMoving && dy !== 0 && dx !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len
        dy /= len
      }

      const nx = s.px + dx * PLAYER_SPEED * dt
      const ny = s.py + dy * PLAYER_SPEED * dt
      if (canWalk(nx, s.py)) s.px = nx
      if (canWalk(s.px, ny)) s.py = ny

      // Jump physics
      if (!s.onGround) {
        s.jumpVy += 0.18 * dt
      }
      s.py += s.jumpVy * dt

      // Ground collision
      if (s.py >= SPAWN.y) {
        s.py = SPAWN.y
        s.jumpVy = 0
        s.onGround = true
      }
      // Keep within walkable bounds vertically
      if (s.py < INNER_Y + PLAYER_R) {
        s.py = INNER_Y + PLAYER_R
        s.jumpVy = 0
      }

      // Facing direction
      if (dx > 0.1) s.facing = 1
      else if (dx < -0.1) s.facing = -1

      // Walk animation
      if (isMoving) {
        s.walkTimer += dt * 0.18
        s.walkFrame = Math.floor(s.walkTimer) % 4
      } else {
        s.walkFrame = 0
        s.walkTimer = 0
      }

      // Idle bob
      if (!isMoving) {
        s.idleBob = Math.sin(now * 0.002) * 2
      } else {
        s.idleBob = lerp(s.idleBob, 0, 0.1)
      }

      // Pickup animation
      if (s.pickupAnim > 0 && s.pickupAnim < 1) {
        s.pickupAnim = Math.min(s.pickupAnim + dt * 0.06, 1)
      }

      // Button press animation
      if (s.cubeOnButton && s.buttonPressAnim < 1) {
        s.buttonPressAnim = Math.min(s.buttonPressAnim + dt * 0.04, 1)
      }

      // Camera zoom during door open
      if (s.cubeOnButton) {
        s.cameraZoomTarget = 1.15
      }
      s.cameraZoom = lerp(s.cameraZoom, s.cameraZoomTarget, 0.02 * dt)

      // ─── Interaction logic ─────────────────────────────────────────────
      const nearCube =
        !s.carrying &&
        !s.cubeOnButton &&
        dist({ x: s.px, y: s.py }, CUBE_POS) < INTERACT_DIST
      const nearButton =
        s.carrying && dist({ x: s.px, y: s.py }, BUTTON_POS) < INTERACT_DIST

      if (nearCube) promptText = "E — PICK UP"
      else if (nearButton) promptText = "E — PLACE"
      else promptText = ""

      if (s.interactPressed) {
        s.interactPressed = false
        if (nearCube) {
          s.carrying = true
          s.pickupAnim = 0.01
          s.pickupFrom = { x: CUBE_POS.x, y: CUBE_POS.y }
        } else if (nearButton) {
          s.carrying = false
          s.cubeOnButton = true
          s.doorAnimStart = now
          s.buttonPressAnim = 0.01
          window.dispatchEvent(new CustomEvent("audio:button-press"))
        }
      }

      // Door animation with shudder
      if (s.cubeOnButton && s.doorOpen < 1) {
        const elapsed = now - s.doorAnimStart
        if (elapsed < 200) {
          // Shudder phase
          s.doorShudder = Math.sin(elapsed * 0.05) * 2 * (1 - elapsed / 200)
        } else {
          if (s.doorShudder !== 0) {
            // Just started opening
            window.dispatchEvent(new CustomEvent("audio:door-open"))
          }
          s.doorShudder = 0
          const openElapsed = elapsed - 200
          s.doorOpen = clamp(openElapsed / 700, 0, 1)
        }
      }

      // Transition after door opens
      if (s.doorOpen >= 1 && !s.transitioning) {
        s.transitioning = true
        s.fadeAlpha = 0
      }
      if (s.transitioning) {
        s.fadeAlpha = Math.min(s.fadeAlpha + 0.015 * dt, 1)
        if (s.fadeAlpha >= 1) {
          onComplete?.()
          return
        }
      }

      // ─── Draw ──────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, ROOM_W, ROOM_H)

      // Apply camera zoom
      ctx.save()
      if (s.cameraZoom > 1.001) {
        const cx = ROOM_W / 2
        const cy = ROOM_H / 2
        ctx.translate(cx, cy)
        ctx.scale(s.cameraZoom, s.cameraZoom)
        ctx.translate(-cx, -cy)
      }

      // Floor
      ctx.fillStyle = FLOOR
      ctx.fillRect(0, 0, ROOM_W, ROOM_H)

      // Floor grid
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.12
      for (let gx = INNER_X; gx <= INNER_X + INNER_W; gx += 32) {
        ctx.beginPath()
        ctx.moveTo(gx, INNER_Y)
        ctx.lineTo(gx, INNER_Y + INNER_H)
        ctx.stroke()
      }
      for (let gy = INNER_Y; gy <= INNER_Y + INNER_H; gy += 32) {
        ctx.beginPath()
        ctx.moveTo(INNER_X, gy)
        ctx.lineTo(INNER_X + INNER_W, gy)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Walls with beveled edges
      ctx.fillStyle = WALL
      ctx.fillRect(0, 0, ROOM_W, WALL_THICKNESS)
      ctx.fillRect(0, INNER_Y + INNER_H, DOOR_POS.x, WALL_THICKNESS)
      ctx.fillRect(
        DOOR_POS.x + DOOR_POS.w,
        INNER_Y + INNER_H,
        ROOM_W - DOOR_POS.x - DOOR_POS.w,
        WALL_THICKNESS,
      )
      ctx.fillRect(0, 0, WALL_THICKNESS, ROOM_H)
      ctx.fillRect(INNER_X + INNER_W, 0, WALL_THICKNESS, ROOM_H)

      // Wall inner edge highlight
      ctx.strokeStyle = WALL_EDGE
      ctx.lineWidth = 1
      ctx.strokeRect(INNER_X, INNER_Y, INNER_W, INNER_H)

      // Door
      const doorGap = DOOR_POS.h * (1 - s.doorOpen)
      const doorOffset = s.doorShudder
      if (s.doorOpen < 1) {
        ctx.fillStyle = s.doorOpen > 0.3 ? DOOR_OPEN : DOOR_COLOR
        ctx.fillRect(
          DOOR_POS.x + doorOffset,
          INNER_Y + INNER_H + (WALL_THICKNESS - doorGap) / 2,
          DOOR_POS.w,
          doorGap,
        )
      }
      // Light bleed at door seam
      if (s.doorOpen > 0 && s.doorOpen < 1) {
        const bleedAlpha = Math.sin(s.doorOpen * Math.PI) * 0.4
        ctx.fillStyle = `rgba(30, 144, 255, ${bleedAlpha})`
        ctx.fillRect(
          DOOR_POS.x - 1,
          INNER_Y + INNER_H + (WALL_THICKNESS - doorGap) / 2 - 1,
          DOOR_POS.w + 2,
          doorGap + 2,
        )
      }
      // Door frame
      ctx.strokeStyle = s.cubeOnButton
        ? "rgba(30, 144, 255, 0.6)"
        : "rgba(255,255,255,0.1)"
      ctx.lineWidth = 1
      ctx.strokeRect(DOOR_POS.x, INNER_Y + INNER_H, DOOR_POS.w, WALL_THICKNESS)

      // Weighted button
      const btnProgress = s.buttonPressAnim
      const btnDepress =
        btnProgress > 0 ? Math.sin(btnProgress * Math.PI) * 3 : 0
      const btnSquash = 1 - btnDepress * 0.08

      // Button shadow
      ctx.beginPath()
      ctx.ellipse(
        BUTTON_POS.x,
        BUTTON_POS.y + BUTTON_R * 0.3,
        BUTTON_R * 0.9,
        BUTTON_R * 0.25,
        0,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = "rgba(0,0,0,0.25)"
      ctx.fill()

      // Button body
      ctx.save()
      ctx.translate(BUTTON_POS.x, BUTTON_POS.y)
      ctx.scale(1, btnSquash)
      ctx.beginPath()
      ctx.arc(0, 0, BUTTON_R, 0, Math.PI * 2)
      ctx.fillStyle = btnProgress > 0 ? BUTTON_PRESSED : BUTTON_RED
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 1.5
      ctx.stroke()
      // Highlight ring
      if (btnProgress === 0) {
        ctx.beginPath()
        ctx.arc(0, 0, BUTTON_R - 4, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255,255,255,0.08)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()

      // Button glow pulse on press
      if (btnProgress > 0.3 && btnProgress < 0.9) {
        const glowAlpha = Math.sin(((btnProgress - 0.3) / 0.6) * Math.PI) * 0.3
        const glowR = BUTTON_R + 15 * btnProgress
        const glow = ctx.createRadialGradient(
          BUTTON_POS.x,
          BUTTON_POS.y,
          BUTTON_R * 0.5,
          BUTTON_POS.x,
          BUTTON_POS.y,
          glowR,
        )
        glow.addColorStop(0, `rgba(30, 144, 255, ${glowAlpha})`)
        glow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(BUTTON_POS.x, BUTTON_POS.y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }

      // Companion Cube (idle bob when on ground)
      const cubeBob =
        !s.carrying && !s.cubeOnButton ? Math.sin(now * 0.0015) * 2 : 0
      if (!s.carrying && !s.cubeOnButton) {
        drawCube(ctx, CUBE_POS.x, CUBE_POS.y + cubeBob, now)
      }
      if (s.cubeOnButton) {
        drawCube(ctx, BUTTON_POS.x, BUTTON_POS.y, now)
      }

      // Stickman
      drawStickman(
        ctx,
        s.px,
        s.py + s.idleBob,
        s.carrying,
        s.walkFrame,
        s.facing,
        now,
        s,
      )

      // Carried cube (with pickup animation)
      if (s.carrying) {
        let cubeX = s.px
        let cubeY = s.py + PLAYER_R + 12
        if (s.pickupAnim > 0 && s.pickupAnim < 1 && s.pickupFrom) {
          const t = s.pickupAnim
          const ease = 1 - Math.pow(1 - t, 3)
          cubeX = lerp(s.pickupFrom.x, s.px, ease)
          cubeY =
            lerp(s.pickupFrom.y, s.py + PLAYER_R + 12, ease) -
            Math.sin(t * Math.PI) * 15
        }
        drawCube(ctx, cubeX, cubeY, now)
      }

      ctx.restore() // camera zoom

      // Fade overlay (outside camera transform)
      if (s.transitioning) {
        ctx.fillStyle = `rgba(10, 10, 12, ${s.fadeAlpha})`
        ctx.fillRect(0, 0, ROOM_W, ROOM_H)
      }

      setShowPrompt(promptText)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      canvas.removeEventListener("touchstart", onTouch)
      canvas.removeEventListener("touchmove", onTouch)
      canvas.removeEventListener("touchend", onTouchEnd)
    }
  }, [onComplete])

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
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(15,74,128,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Title */}
      <div
        className="mb-3 text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <div
          className="text-xs tracking-widest mb-1"
          style={{ color: "var(--concrete-gray)" }}
        >
          APERTURE SCIENCE — PRE-TEST FACILITY ACCESS
        </div>
        <div
          className="text-lg font-bold tracking-wider"
          style={{
            color: "var(--facility-white)",
            fontFamily: "var(--font-display)",
          }}
        >
          CHAMBER ZERO — ORIENTATION
        </div>
      </div>

      {/* Canvas — fills available space */}
      <canvas
        ref={canvasRef}
        className="rounded-sm"
        style={{
          width: "min(90vw, 520px)",
          height: "min(65vh, 380px)",
          border: "1px solid var(--border-subtle)",
          cursor: "crosshair",
          touchAction: "none",
        }}
      />

      {/* Interaction prompt */}
      <div
        className="mt-2 h-5 text-center"
        style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
      >
        {showPrompt && (
          <span className="tracking-widest" style={{ color: INTERACT_PROMPT }}>
            {showPrompt}
          </span>
        )}
      </div>

      {/* Controls hint */}
      <div
        className="mt-3 flex flex-wrap items-center justify-center gap-4"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--concrete-gray)",
          letterSpacing: "0.1em",
        }}
      >
        <span>WASD — MOVE</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>SPACE — JUMP</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>E — INTERACT</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>TAP TO WALK</span>
      </div>

      {/* Skip + Accessibility buttons */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={skipIntro}
          className="text-xs tracking-widest transition-all duration-150 inline-flex items-center gap-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--concrete-gray)",
            background: "none",
            border: "1px solid var(--border-subtle)",
            padding: "6px 14px",
            cursor: "pointer",
            letterSpacing: "0.12em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-mid)"
            e.currentTarget.style.color = "var(--facility-white)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)"
            e.currentTarget.style.color = "var(--concrete-gray)"
          }}
        >
          SKIP INTRO
          <ArrowChevron size={12} color="var(--concrete-gray)" />
        </button>
        {reduced && (
          <button
            onClick={skipIntro}
            className="text-xs tracking-widest px-4 py-2"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--portal-blue)",
              background: "none",
              border: "1px solid var(--portal-blue)",
              cursor: "pointer",
            }}
          >
            ENTER SITE
          </button>
        )}
      </div>

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

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawStickman(ctx, x, y, carrying, walkFrame, facing, now, state) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(facing, 1)
  ctx.strokeStyle = STICKMAN
  ctx.fillStyle = STICKMAN
  ctx.lineWidth = 2
  ctx.lineCap = "round"

  const isMoving = walkFrame !== 0
  const swing = isMoving ? Math.sin(state.walkTimer * Math.PI * 2) * 0.4 : 0

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
  if (carrying) {
    ctx.moveTo(-6, -3)
    ctx.lineTo(0, -6)
    ctx.lineTo(6, -3)
  } else {
    ctx.moveTo(-7, 1 + swing * 5)
    ctx.lineTo(0, -2)
    ctx.lineTo(7, 1 - swing * 5)
  }
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

function drawCube(ctx, x, y, now) {
  const half = CUBE_SIZE / 2
  const bevel = 3
  ctx.save()

  // Contact shadow
  ctx.beginPath()
  ctx.ellipse(x, y + half + 3, half * 0.8, 3, 0, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(0,0,0,0.35)"
  ctx.fill()

  // Cube body — beveled rectangle
  ctx.beginPath()
  ctx.moveTo(x - half + bevel, y - half)
  ctx.lineTo(x + half - bevel, y - half)
  ctx.lineTo(x + half, y - half + bevel)
  ctx.lineTo(x + half, y + half - bevel)
  ctx.lineTo(x + half - bevel, y + half)
  ctx.lineTo(x - half + bevel, y + half)
  ctx.lineTo(x - half, y + half - bevel)
  ctx.lineTo(x - half, y - half + bevel)
  ctx.closePath()
  ctx.fillStyle = CUBE_BODY
  ctx.fill()

  // Top bevel highlight
  ctx.beginPath()
  ctx.moveTo(x - half + bevel, y - half)
  ctx.lineTo(x + half - bevel, y - half)
  ctx.lineTo(x + half - bevel, y - half + 1)
  ctx.lineTo(x - half + bevel, y - half + 1)
  ctx.closePath()
  ctx.fillStyle = CUBE_BODY_LIGHT
  ctx.fill()

  // Left bevel highlight
  ctx.beginPath()
  ctx.moveTo(x - half, y - half + bevel)
  ctx.lineTo(x - half + 1, y - half + bevel)
  ctx.lineTo(x - half + 1, y + half - bevel)
  ctx.lineTo(x - half, y + half - bevel)
  ctx.closePath()
  ctx.fillStyle = CUBE_BODY_LIGHT
  ctx.fill()

  // Right bevel shadow
  ctx.beginPath()
  ctx.moveTo(x + half, y - half + bevel)
  ctx.lineTo(x + half - 1, y - half + bevel)
  ctx.lineTo(x + half - 1, y + half - bevel)
  ctx.lineTo(x + half, y + half - bevel)
  ctx.closePath()
  ctx.fillStyle = "rgba(0,0,0,0.2)"
  ctx.fill()

  // Bottom bevel shadow
  ctx.beginPath()
  ctx.moveTo(x - half + bevel, y + half)
  ctx.lineTo(x + half - bevel, y + half)
  ctx.lineTo(x + half - bevel, y + half - 1)
  ctx.lineTo(x - half + bevel, y + half - 1)
  ctx.closePath()
  ctx.fillStyle = "rgba(0,0,0,0.2)"
  ctx.fill()

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.1)"
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(x - half + bevel, y - half)
  ctx.lineTo(x + half - bevel, y - half)
  ctx.lineTo(x + half, y - half + bevel)
  ctx.lineTo(x + half, y + half - bevel)
  ctx.lineTo(x + half - bevel, y + half)
  ctx.lineTo(x - half + bevel, y + half)
  ctx.lineTo(x - half, y + half - bevel)
  ctx.lineTo(x - half, y - half + bevel)
  ctx.closePath()
  ctx.stroke()

  // Heart decal — two circles + triangle
  const hx = x
  const hy = y - 1
  ctx.fillStyle = CUBE_HEART
  // Left bump
  ctx.beginPath()
  ctx.arc(hx - 3.5, hy - 2, 2.8, 0, Math.PI * 2)
  ctx.fill()
  // Right bump
  ctx.beginPath()
  ctx.arc(hx + 3.5, hy - 2, 2.8, 0, Math.PI * 2)
  ctx.fill()
  // Bottom point
  ctx.beginPath()
  ctx.moveTo(hx - 6, hy)
  ctx.lineTo(hx, hy + 6)
  ctx.lineTo(hx + 6, hy)
  ctx.fill()

  // Heart inner highlight
  ctx.fillStyle = CUBE_HEART_DARK
  ctx.beginPath()
  ctx.arc(hx - 1, hy - 1, 1.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
