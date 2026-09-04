import { useRef, useState, useCallback, useEffect } from "react"
import { JumpBoosterIcon, SpeedBoosterIcon, ComboIcon, ResetIcon, StatusDot } from "./Icons"

const GEL_BLUE = "#1E90FF"
const GEL_ORANGE = "#FF7A1A"
const GEL_PURPLE = "#A855F7"

// ─── Juice helpers ──────────────────────────────────────────────────────────
function modeColor(mode) {
  if (mode === "propulsion") return GEL_ORANGE
  if (mode === "combo") return GEL_PURPLE
  return GEL_BLUE
}

function hexToRgb(hex) {
  const h = hex.replace("#", "")
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function mixHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bl = Math.round(ca.b + (cb.b - ca.b) * t)
  return `rgb(${r},${g},${bl})`
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

// Sound synthesis using Web Audio API
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    if (type === "bounce") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.12)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.28)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.32)
    } else if (type === "speed") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(80, now)
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.35)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.42)
    } else if (type === "success") {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      osc1.type = "triangle"
      osc2.type = "sine"
      osc1.frequency.setValueAtTime(523.25, now)
      osc1.frequency.setValueAtTime(659.25, now + 0.1)
      osc1.frequency.setValueAtTime(783.99, now + 0.2)
      osc1.frequency.setValueAtTime(1046.5, now + 0.3)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.65)
    }
  } catch {
    // Audio context may be blocked by browser policy until interaction
  }
}

export default function GelInteractive({ mode = "repulsion", onInteraction }) {
  const canvasRef = useRef(null)
  const animRef = useRef(0)
  const soundEnabled = useRef(true)
  const reducedRef = useRef(false)

  // Simulation state
  const stateRef = useRef({
    mode: "repulsion",
    x: 80,
    y: 80,
    vx: 0,
    vy: 0,
    targetX: 80,
    targetY: 80,
    isDragging: false,
    onGround: false,
    jumpCount: 0,
    speedFactor: 1,
    particles: [],
    trail: [],
    shockwaves: [],
    statusText: "READY FOR LAUNCH",
    targetHit: false,
    comboStage: 0,
    // ── Juice state ──
    squash: 1, // 1 = neutral; <1 squashed, >1 stretched (volume-preserving)
    prevVy: 0, // vertical velocity last frame (arc-peak detection)
    coatTimer: 0, // gel-coat glow after launch (1 → 0)
    settleT: -1, // settle compress-and-release progress (-1 = inactive)
    restFrames: 0, // consecutive low-speed frames (rest detection)
    spawnT: 1, // mode-switch ease progress (1 = settled)
    spawnFrom: null,
    spawnTo: null,
    colorFrom: GEL_BLUE,
    colorTo: GEL_BLUE,
    shake: 0, // container shake magnitude (px)
    reduced: false,
  })

  // Raw per-frame physics values (written by the RAF loop, never rendered).
  const telemetryRaw = useRef({ velocity: 0, altitude: 0 })
  const statusSyncRef = useRef({ status: "", targetReached: false })

  const [telemetry, setTelemetry] = useState({
    velocity: 0,
    altitude: 0,
    friction: 0.85,
    bounceFactor: 1.0,
    status: "READY FOR LAUNCH",
    targetReached: false,
  })

  // Track prefers-reduced-motion (shake + squash are gated on this)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedRef.current = mq.matches
    stateRef.current.reduced = mq.matches
    const handler = (e) => {
      reducedRef.current = e.matches
      stateRef.current.reduced = e.matches
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Smooth-count the velocity/altitude readouts toward the raw physics values.
  // Numbers glide instead of snapping, and React re-renders at ~10Hz rather
  // than once per animation frame.
  useEffect(() => {
    const id = setInterval(() => {
      const raw = telemetryRaw.current
      setTelemetry((prev) => {
        const velocity = prev.velocity + (raw.velocity - prev.velocity) * 0.45
        const altitude = prev.altitude + (raw.altitude - prev.altitude) * 0.45
        if (
          Math.abs(velocity - prev.velocity) < 0.005 &&
          Math.abs(altitude - prev.altitude) < 0.005
        ) {
          return prev
        }
        return { ...prev, velocity, altitude }
      })
    }, 100)
    return () => clearInterval(id)
  }, [])

  // Push status text / target flag to React only when they actually change.
  const syncStatus = useCallback((s) => {
    const sync = statusSyncRef.current
    if (sync.status !== s.statusText || sync.targetReached !== s.targetHit) {
      sync.status = s.statusText
      sync.targetReached = s.targetHit
      setTelemetry((prev) => ({
        ...prev,
        status: s.statusText,
        targetReached: s.targetHit,
        friction: s.mode === "propulsion" ? 0.0 : 0.85,
        bounceFactor: s.mode === "repulsion" ? 3.2 : 0.3,
      }))
    }
  }, [])

  // Gel splatter burst + ripple at the launch point. Sells the idea that the
  // subject is coated in a viscous substance, not following a physics curve.
  const launchBurst = useCallback((s, color) => {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2
      const spd = 1.5 + Math.random() * 4.5
      s.particles.push({
        x: s.x + (Math.random() - 0.5) * 10,
        y: s.y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1.5,
        r: Math.random() * 3.5 + 1.5,
        color,
        alpha: 1,
        life: 0.7,
      })
    }
    s.shockwaves.push({
      x: s.x,
      y: s.y,
      r: 6,
      maxR: 48,
      alpha: 0.8,
      color,
    })
    s.coatTimer = 1
    // A fresh launch cancels any pending settle animation.
    s.settleT = -1
    s.restFrames = 0
  }, [])

  // Sync mode changes — eased gel-drip transition, never an instant snap.
  useEffect(() => {
    resetSimulation(mode)
  }, [mode])

  const resetSimulation = useCallback((currentMode) => {
    const s = stateRef.current
    // Capture the outgoing gel color BEFORE switching modes so the subject
    // visibly drains the old color and refills with the new one.
    const outgoingColor = modeColor(s.mode)
    const from = { x: s.x, y: s.y }
    let to
    if (currentMode === "repulsion") {
      to = { x: 100, y: 70, vx: 1.2, vy: 0 }
      s.statusText = "DROP FROM HEIGHT TO TRIGGER SUPER JUMP"
    } else if (currentMode === "propulsion") {
      to = { x: 60, y: 210, vx: 0, vy: 0 }
      s.statusText = "PRESS 'IGNITE SPEED RUN' FOR ZERO-FRICTION SPRINT"
    } else {
      to = { x: 50, y: 210, vx: 0, vy: 0 }
      s.statusText = "COMBO: SPRINT ON ORANGE GEL -> LAUNCH ON BLUE RAMP"
    }
    // Ease from wherever the subject is to the new start position, draining
    // the old gel color out and refilling with the new one on the way.
    s.spawnFrom = from
    s.spawnTo = to
    s.colorFrom = outgoingColor
    s.colorTo = modeColor(currentMode)
    s.spawnT = 0
    s.mode = currentMode
    s.particles = []
    s.trail = []
    s.shockwaves = []
    s.targetHit = false
    s.comboStage = 0
    s.squash = 1
    s.coatTimer = 0
    s.settleT = -1
    s.restFrames = 0
    s.shake = 0
    s.isDragging = false
    syncStatus(s)
  }, [syncStatus])

  const triggerAction = useCallback(() => {
    const s = stateRef.current
    onInteraction?.()
    // A triggered launch is a real launch: full juice, no settle pending.
    s.spawnT = 1
    s.settleT = -1
    s.restFrames = 0

    if (s.mode === "repulsion") {
      s.x = 220
      s.y = 40
      s.vx = 1.5
      s.vy = 2.0
      s.targetHit = false
      s.statusText = "FREEFALLING TOWARDS BLUE REPULSION GEL..."
      launchBurst(s, GEL_BLUE)
    } else if (s.mode === "propulsion") {
      s.x = 60
      s.y = 210
      s.vx = 16.5
      s.vy = 0
      s.targetHit = false
      s.statusText = "SUPERSONIC ACCELERATION ENGAGED (µ = 0.000)"
      launchBurst(s, GEL_ORANGE)
      if (soundEnabled.current) playSound("speed")
    } else {
      s.x = 50
      s.y = 210
      s.vx = 15.0
      s.vy = 0
      s.comboStage = 1
      s.targetHit = false
      s.statusText = "ACCELERATING ACROSS ORANGE TRACK..."
      launchBurst(s, GEL_ORANGE)
      if (soundEnabled.current) playSound("speed")
    }
    syncStatus(s)
  }, [onInteraction, launchBurst, syncStatus])

  // Canvas render and physics engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let lastTime = performance.now()

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const s = stateRef.current
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      // ─── Facility Background ───
      ctx.fillStyle = "#0A0A0E"
      ctx.fillRect(0, 0, W, H)

      // Chamber wall grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 36) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Hazard boundary
      ctx.fillStyle = "rgba(255, 122, 26, 0.08)"
      ctx.fillRect(0, H - 12, W, 12)

      // ─── Container shake (felt, not seen: a few px, fast decay) ───
      ctx.save()
      if (s.shake > 0.05 && !s.reduced) {
        ctx.translate(
          (Math.random() - 0.5) * 2 * s.shake,
          (Math.random() - 0.5) * 2 * s.shake,
        )
      }
      s.shake = Math.max(0, s.shake - dt * 16)

      // ─── Mode-switch spawn easing ───
      let spawnEasing = false
      if (s.spawnT < 1 && !s.isDragging) {
        spawnEasing = true
        s.spawnT = Math.min(1, s.spawnT + dt / 0.55)
        const t = easeOutCubic(s.spawnT)
        s.x = s.spawnFrom.x + (s.spawnTo.x - s.spawnFrom.x) * t
        s.y = s.spawnFrom.y + (s.spawnTo.y - s.spawnFrom.y) * t
        s.vx = 0
        s.vy = 0
        if (s.spawnT >= 1) {
          s.vx = s.spawnTo.vx
          s.vy = s.spawnTo.vy
          // Arriving in a fresh coat of gel: a soft ripple on arrival.
          s.shockwaves.push({
            x: s.x,
            y: s.y,
            r: 5,
            maxR: 40,
            alpha: 0.6,
            color: s.colorTo,
          })
          s.coatTimer = Math.max(s.coatTimer, 0.7)
        }
      }
      const bodyColor =
        s.spawnT < 1 ? mixHex(s.colorFrom, s.colorTo, easeOutCubic(s.spawnT)) : modeColor(s.mode)

      // ─── MODE 1: REPULSION GEL ───
      if (s.mode === "repulsion") {
        const floorY = 240
        const gelLeft = 140
        const gelRight = 320
        const highPlatform = { x: 440, y: 80, w: 140, h: 14 }
        const targetBtn = { x: 510, y: 74, r: 10 }

        // Lower floor
        ctx.fillStyle = "#16161D"
        ctx.fillRect(0, floorY, W, H - floorY)

        // Upper high platform / catwalk
        ctx.fillStyle = "#1E1E28"
        ctx.fillRect(highPlatform.x, highPlatform.y, highPlatform.w, highPlatform.h)
        ctx.strokeStyle = "var(--portal-blue)"
        ctx.lineWidth = 2
        ctx.strokeRect(highPlatform.x, highPlatform.y, highPlatform.w, highPlatform.h)

        // Catwalk guard rail
        ctx.strokeStyle = "rgba(255,255,255,0.2)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(highPlatform.x, highPlatform.y - 18)
        ctx.lineTo(highPlatform.x + highPlatform.w, highPlatform.y - 18)
        for (let rx = highPlatform.x; rx <= highPlatform.x + highPlatform.w; rx += 28) {
          ctx.moveTo(rx, highPlatform.y)
          ctx.lineTo(rx, highPlatform.y - 18)
        }
        ctx.stroke()

        // Goal Target Button
        ctx.beginPath()
        ctx.arc(targetBtn.x, targetBtn.y, targetBtn.r, 0, Math.PI * 2)
        ctx.fillStyle = s.targetHit ? "var(--portal-blue)" : "rgba(30, 144, 255, 0.3)"
        ctx.fill()
        ctx.strokeStyle = "var(--portal-blue)"
        ctx.lineWidth = 2
        ctx.stroke()

        // Goal Indicator
        ctx.font = "9px monospace"
        ctx.fillStyle = s.targetHit ? "#FFFFFF" : "var(--concrete-gray)"
        ctx.fillText(
          s.targetHit ? "STATUS: ELEVATED LEDGE REACHED" : "ELEVATED GOAL [18.4M]",
          highPlatform.x + 10,
          highPlatform.y - 24,
        )

        // Blue Repulsion Gel Pool
        const gelGrad = ctx.createLinearGradient(0, floorY, 0, H)
        gelGrad.addColorStop(0, GEL_BLUE)
        gelGrad.addColorStop(1, "rgba(15, 74, 128, 0.4)")
        ctx.fillStyle = gelGrad
        ctx.beginPath()
        ctx.moveTo(gelLeft, floorY)
        const waveOffset = Math.sin(now * 0.006) * 3
        ctx.quadraticCurveTo(
          (gelLeft + gelRight) / 2,
          floorY - 6 + waveOffset,
          gelRight,
          floorY,
        )
        ctx.lineTo(gelRight, floorY + 18)
        ctx.lineTo(gelLeft, floorY + 18)
        ctx.closePath()
        ctx.fill()

        ctx.shadowColor = GEL_BLUE
        ctx.shadowBlur = 16
        ctx.strokeStyle = GEL_BLUE
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(gelLeft, floorY)
        ctx.quadraticCurveTo(
          (gelLeft + gelRight) / 2,
          floorY - 6 + waveOffset,
          gelRight,
          floorY,
        )
        ctx.stroke()
        ctx.shadowBlur = 0

        // Label
        ctx.font = "10px monospace"
        ctx.fillStyle = GEL_BLUE
        ctx.fillText("REPULSION GEL // VERTICAL JUMP ZONE", gelLeft + 15, floorY + 28)

        // Physics
        if (!s.isDragging && !spawnEasing) {
          s.vy += 28.0 * dt
          s.x += s.vx
          s.y += s.vy

          if (s.x < 20) {
            s.x = 20
            s.vx = Math.abs(s.vx) * 0.8
          }
          if (s.x > W - 20) {
            s.x = W - 20
            s.vx = -Math.abs(s.vx) * 0.8
          }

          if (
            s.x >= highPlatform.x &&
            s.x <= highPlatform.x + highPlatform.w &&
            s.y >= highPlatform.y - 18 &&
            s.y <= highPlatform.y + 4 &&
            s.vy > 0
          ) {
            s.y = highPlatform.y - 18
            s.vy = 0
            s.vx *= 0.6
            if (!s.targetHit) {
              s.targetHit = true
              s.statusText = "SUPER JUMP SUCCESSFUL — HIGH LEDGE CLEARED"
              if (soundEnabled.current) playSound("success")
            }
          }

          if (s.y >= floorY - 18) {
            s.y = floorY - 18
            const isOnGel = s.x >= gelLeft && s.x <= gelRight

            if (isOnGel) {
              const inboundSpeed = Math.abs(s.vy)
              s.vy = -Math.max(16.5, inboundSpeed * 1.35)
              s.vx = (highPlatform.x + 40 - s.x) * 0.022
              s.jumpCount++
              s.statusText = `SUPER JUMP BOOST FIRED // VELOCITY: ${Math.abs(s.vy * 3.5).toFixed(1)} M/S`

              // Impact squash + shake scaled by inbound speed.
              if (!s.reduced) {
                s.squash = 0.58
                if (inboundSpeed > 13) s.shake = Math.min(6, 2.5 + inboundSpeed * 0.18)
              }

              if (soundEnabled.current) playSound("bounce")

              s.shockwaves.push({
                x: s.x,
                y: floorY,
                r: 5,
                maxR: 60,
                alpha: 0.9,
                color: GEL_BLUE,
              })

              for (let i = 0; i < 18; i++) {
                s.particles.push({
                  x: s.x + (Math.random() - 0.5) * 20,
                  y: floorY,
                  vx: (Math.random() - 0.5) * 8,
                  vy: -Math.random() * 9 - 4,
                  r: Math.random() * 4 + 2,
                  color: GEL_BLUE,
                  alpha: 1,
                  life: 0.6,
                })
              }
            } else {
              s.vy = -Math.abs(s.vy) * 0.25
              s.vx *= 0.8
              if (Math.abs(s.vy) < 1.0) s.vy = 0
              // Dull thud on bare concrete: a whisper of squash, no shake.
              if (!s.reduced && Math.abs(s.prevVy) > 6) s.squash = 0.85
            }
          }

          // Rest detection: settled on the platform or dead floor.
          const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
          const resting =
            (s.y === highPlatform.y - 18 || (s.y === floorY - 18 && Math.abs(s.vy) < 0.01)) &&
            speed < 0.7
          if (resting) {
            s.restFrames++
            if (s.restFrames === 25 && s.settleT === -1) {
              s.settleT = 0
              s.statusText = "SUBJECT AT REST — GEL COATING NOMINAL"
            }
          } else {
            s.restFrames = 0
          }
        }
      }

      // ─── MODE 2: PROPULSION GEL ───
      else if (s.mode === "propulsion") {
        const trackY = 220
        const startX = 20
        const gelStartX = 80
        const gelEndX = 340
        const pitStartX = 350
        const pitEndX = 480
        const landStartX = 485
        const landEndX = W - 20
        const speedGateX = 540

        ctx.fillStyle = "#16161D"
        ctx.fillRect(startX, trackY, gelStartX - startX, 40)

        // Hazard Pit
        ctx.fillStyle = "rgba(180, 40, 20, 0.2)"
        ctx.fillRect(pitStartX, trackY + 8, pitEndX - pitStartX, 50)
        ctx.strokeStyle = "rgba(255, 60, 40, 0.4)"
        ctx.strokeRect(pitStartX, trackY + 8, pitEndX - pitStartX, 50)

        ctx.font = "9px monospace"
        ctx.fillStyle = "#FF4444"
        ctx.fillText("HAZARD PIT // SPAN: 42.0M", pitStartX + 12, trackY + 36)

        // Landing platform
        ctx.fillStyle = "#1E1E28"
        ctx.fillRect(landStartX, trackY, landEndX - landStartX, 40)
        ctx.strokeStyle = "var(--portal-orange)"
        ctx.lineWidth = 2
        ctx.strokeRect(landStartX, trackY, landEndX - landStartX, 40)

        // Velocity Speed Gate
        ctx.strokeStyle = s.targetHit ? "var(--portal-orange)" : "rgba(255, 122, 26, 0.4)"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(speedGateX, trackY - 50)
        ctx.lineTo(speedGateX, trackY)
        ctx.stroke()

        ctx.font = "9px monospace"
        ctx.fillStyle = s.targetHit ? "#FFFFFF" : "var(--concrete-gray)"
        ctx.fillText(
          s.targetHit ? "STATUS: VELOCITY GATE CLEARED" : "VELOCITY GATE [120+ KM/H]",
          speedGateX - 60,
          trackY - 60,
        )

        // Orange Propulsion Gel Strip
        const gelGrad = ctx.createLinearGradient(gelStartX, 0, gelEndX, 0)
        gelGrad.addColorStop(0, "rgba(255, 122, 26, 0.4)")
        gelGrad.addColorStop(1, GEL_ORANGE)
        ctx.fillStyle = gelGrad
        ctx.fillRect(gelStartX, trackY, gelEndX - gelStartX, 10)

        const flowOffset = (now * 0.2) % 30
        ctx.strokeStyle = "#FFF2E0"
        ctx.lineWidth = 2
        for (let ax = gelStartX + flowOffset; ax < gelEndX; ax += 30) {
          ctx.beginPath()
          ctx.moveTo(ax, trackY + 2)
          ctx.lineTo(ax + 6, trackY + 5)
          ctx.lineTo(ax, trackY + 8)
          ctx.stroke()
        }

        ctx.shadowColor = GEL_ORANGE
        ctx.shadowBlur = 16
        ctx.strokeStyle = GEL_ORANGE
        ctx.lineWidth = 2
        ctx.strokeRect(gelStartX, trackY, gelEndX - gelStartX, 10)
        ctx.shadowBlur = 0

        ctx.font = "10px monospace"
        ctx.fillStyle = GEL_ORANGE
        ctx.fillText("PROPULSION GEL // ZERO-FRICTION RUNWAY", gelStartX + 10, trackY + 28)

        if (!s.isDragging && !spawnEasing) {
          const isOnOrangeGel = s.x >= gelStartX && s.x <= gelEndX && s.y >= trackY - 24

          if (isOnOrangeGel) {
            s.vx += 32.0 * dt
            s.vx = Math.min(s.vx, 22.0)
            s.vy = 0
            s.y = trackY - 18

            if (Math.random() < 0.6) {
              s.particles.push({
                x: s.x,
                y: trackY - 2 + Math.random() * 4,
                vx: -Math.random() * 8 - 2,
                vy: (Math.random() - 0.5) * 3,
                r: Math.random() * 3 + 1,
                color: GEL_ORANGE,
                alpha: 1,
                life: 0.4,
              })
            }
          } else if (s.x > gelEndX && s.x < landStartX) {
            s.vy += 22.0 * dt
          } else if (s.x >= landStartX) {
            s.vy = 0
            s.y = trackY - 18
            s.vx *= 0.94

            if (s.x >= speedGateX - 10 && !s.targetHit) {
              s.targetHit = true
              s.statusText = "SUPERSONIC SPEED GAP CLEARED // TARGET ACHIEVED"
              // Gate smash: celebratory burst + a nudge of shake.
              launchBurst(s, GEL_ORANGE)
              if (!s.reduced) s.shake = Math.max(s.shake, 3)
              if (soundEnabled.current) playSound("success")
            }
          } else {
            s.vx *= 0.92
          }

          s.x += s.vx
          s.y += s.vy

          if (s.y > trackY + 30) {
            s.x = 60
            s.y = trackY - 18
            s.vx = 0
            s.vy = 0
            s.statusText = "INSUFFICIENT SPEED — REPOSITIONING TEST SUBJECT"
          }

          // Rest detection: rolled to a stop on the landing platform.
          if (s.x >= landStartX && Math.abs(s.vx) < 0.45 && s.vy === 0) {
            s.restFrames++
            if (s.restFrames === 25 && s.settleT === -1) {
              s.settleT = 0
              s.statusText = "SUBJECT AT REST — GEL COATING NOMINAL"
            }
          } else {
            s.restFrames = 0
          }
        }
      }

      // ─── MODE 3: COMBO STUNT ───
      else {
        const trackY = 220
        const orangeStartX = 40
        const orangeEndX = 260
        const blueRampX = 280
        const catwalkX = 460
        const catwalkY = 70

        ctx.fillStyle = GEL_ORANGE
        ctx.fillRect(orangeStartX, trackY, orangeEndX - orangeStartX, 8)

        // Angled Blue Ramp
        ctx.fillStyle = GEL_BLUE
        ctx.beginPath()
        ctx.moveTo(blueRampX, trackY)
        ctx.lineTo(blueRampX + 45, trackY - 25)
        ctx.lineTo(blueRampX + 45, trackY)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = "#1E1E28"
        ctx.fillRect(catwalkX, catwalkY, 120, 12)
        ctx.strokeStyle = "var(--portal-blue)"
        ctx.strokeRect(catwalkX, catwalkY, 120, 12)

        ctx.font = "9px monospace"
        ctx.fillStyle = s.targetHit ? "#FFFFFF" : "var(--concrete-gray)"
        ctx.fillText(
          s.targetHit ? "STATUS: COMBO STUNT COMPLETE" : "HIGH APERTURE EXIT [24.0M]",
          catwalkX,
          catwalkY - 12,
        )

        if (!s.isDragging && !spawnEasing) {
          if (s.x >= orangeStartX && s.x <= orangeEndX) {
            s.vx += 30.0 * dt
            s.vx = Math.min(s.vx, 20.0)
            s.y = trackY - 18
          } else if (s.x >= blueRampX && s.x <= blueRampX + 45 && s.y >= trackY - 35) {
            s.vy = -17.5
            s.vx = 11.0
            if (!s.reduced) {
              s.squash = 1.3 // launch stretch off the ramp
              s.shake = Math.max(s.shake, 2.5)
            }
            if (soundEnabled.current) playSound("bounce")
            s.statusText = "MOMENTUM REDIRECTED — LAUNCHING SKYWARD"
          } else {
            s.vy += 22.0 * dt
          }

          s.x += s.vx
          s.y += s.vy

          if (
            s.x >= catwalkX &&
            s.x <= catwalkX + 120 &&
            s.y >= catwalkY - 20 &&
            s.y <= catwalkY + 4 &&
            s.vy > 0
          ) {
            s.y = catwalkY - 18
            s.vy = 0
            s.vx *= 0.6
            if (!s.targetHit) {
              s.targetHit = true
              s.statusText = "PERFECT MOMENTUM CONVERSION ACHIEVED"
              launchBurst(s, GEL_PURPLE)
              if (soundEnabled.current) playSound("success")
            }
          }

          if (s.y > trackY + 40) {
            s.x = 50
            s.y = trackY - 18
            s.vx = 0
            s.vy = 0
          }

          // Rest detection: parked on the catwalk.
          if (s.y === catwalkY - 18 && Math.abs(s.vx) < 0.45) {
            s.restFrames++
            if (s.restFrames === 25 && s.settleT === -1) {
              s.settleT = 0
              s.statusText = "SUBJECT AT REST — GEL COATING NOMINAL"
            }
          } else if (s.y !== catwalkY - 18) {
            s.restFrames = 0
          }
        }
      }

      // ─── Squash & stretch spring ───
      // Arc-peak stretch: vertical velocity flips from rising to falling.
      if (!s.isDragging && !spawnEasing && !s.reduced) {
        if (s.prevVy < -1 && s.vy >= -1 && s.mode !== "propulsion") {
          s.squash = 1.3
        }
        // Fast glide stretches the subject slightly along its motion.
        const glideSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
        if (s.mode === "propulsion" && glideSpeed > 12) {
          s.squash += (1.14 - s.squash) * Math.min(1, dt * 6)
        } else {
          s.squash += (1 - s.squash) * Math.min(1, dt * 9)
        }
      }
      s.prevVy = s.vy

      // ─── Settle animation progress ───
      let settleScale = 1
      if (s.settleT >= 0) {
        s.settleT = Math.min(1, s.settleT + dt / 0.4)
        settleScale = 1 - Math.sin(s.settleT * Math.PI) * 0.16
        if (s.settleT >= 1) s.settleT = -1
      }

      // ─── Gel-coat glow decay ───
      if (s.coatTimer > 0) s.coatTimer = Math.max(0, s.coatTimer - dt * 1.4)

      // ─── Motion trail history (tapered ribbon, not a uniform line) ───
      const trailSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (!s.isDragging && trailSpeed > 1.2) {
        s.trail.push({ x: s.x, y: s.y - 6 })
        if (s.trail.length > 26) s.trail.shift()
      } else if (s.trail.length > 0) {
        s.trail.shift()
        if (trailSpeed < 0.4) s.trail.shift()
      }

      // ─── Render Shockwaves ───
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i]
        sw.r += (sw.maxR - sw.r) * 0.15
        sw.alpha *= 0.88
        ctx.strokeStyle = sw.color
        ctx.lineWidth = 2.5
        ctx.globalAlpha = sw.alpha
        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
        if (sw.alpha < 0.05) s.shockwaves.splice(i, 1)
      }

      // ─── Render Particles ───
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3
        p.alpha -= 0.04
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        if (p.alpha <= 0) s.particles.splice(i, 1)
      }

      // ─── Render Tapered Gradient Trail ───
      // Brighter near the subject, fading to transparent; width tapers
      // toward the tail.
      if (s.trail.length > 1) {
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length
          ctx.strokeStyle = bodyColor
          ctx.globalAlpha = t * 0.45
          ctx.lineWidth = 1 + t * 6
          ctx.beginPath()
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
          ctx.lineTo(s.trail[i].x, s.trail[i].y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      // ─── Render Aperture Test Subject (squash & stretch) ───
      const currentSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      const posX = s.x
      const posY = s.y
      const sq = s.reduced ? 1 : s.squash * settleScale
      const sqX = 1 / Math.sqrt(Math.max(0.3, sq))

      // Gel-coat aura just after launch / arrival.
      if (s.coatTimer > 0) {
        const auraR = 20 + 14 * s.coatTimer
        const aura = ctx.createRadialGradient(posX, posY - 6, 4, posX, posY - 6, auraR)
        aura.addColorStop(0, bodyColor)
        aura.addColorStop(1, "rgba(0,0,0,0)")
        ctx.globalAlpha = 0.35 * s.coatTimer
        ctx.beginPath()
        ctx.arc(posX, posY - 6, auraR, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.save()
      ctx.translate(posX, posY - 6)
      ctx.scale(sqX, sq)
      ctx.shadowColor = bodyColor
      ctx.shadowBlur = 12
      ctx.fillStyle = bodyColor
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      ctx.shadowBlur = 0

      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(posX, posY + 2)
      ctx.lineTo(posX, posY + 16)

      const legAnim = Math.sin(now * 0.03 * currentSpeed) * 8
      ctx.moveTo(posX, posY + 16)
      ctx.lineTo(posX - 6 + legAnim, posY + 28)
      ctx.moveTo(posX, posY + 16)
      ctx.lineTo(posX + 6 - legAnim, posY + 28)

      ctx.moveTo(posX, posY + 6)
      ctx.lineTo(posX - 10 - legAnim, posY + 14)
      ctx.moveTo(posX, posY + 6)
      ctx.lineTo(posX + 10 + legAnim, posY + 14)
      ctx.stroke()

      ctx.restore() // container shake

      // ─── Telemetry (raw values for the smooth-counted HUD) ───
      telemetryRaw.current = {
        velocity: currentSpeed * 3.6,
        altitude: Math.max(0, (240 - posY) * 0.1),
      }
      syncStatus(s)

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [mode, syncStatus])

  // Drag & Fling
  const onPointerDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const s = stateRef.current
    // Grabbing the subject cancels any in-flight mode-switch glide.
    s.spawnT = 1
    s.isDragging = true
    s.x = e.clientX - rect.left
    s.y = e.clientY - rect.top
    s.vx = 0
    s.vy = 0
    s.trail = []
    s.settleT = -1
    s.restFrames = 0
    s.statusText = "DRAGGING SUBJECT — RELEASE TO LAUNCH"
    syncStatus(s)
  }

  const onPointerMove = (e) => {
    if (!stateRef.current.isDragging) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    stateRef.current.x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left))
    stateRef.current.y = Math.max(20, Math.min(canvas.height - 20, e.clientY - rect.top))
  }

  const onPointerUp = () => {
    const s = stateRef.current
    if (!s.isDragging) return
    s.isDragging = false
    s.vx = 2.0
    s.vy = 1.0
    // Releasing a drag is a launch: splatter + ripple + fresh coat.
    launchBurst(s, modeColor(s.mode))
    onInteraction?.()
  }

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        background: "rgba(10, 10, 14, 0.95)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "4px",
      }}
    >
      {/* Telemetry HUD */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b flex-wrap gap-2"
        style={{
          borderColor: "var(--border-subtle)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5" style={{ color: mode === "repulsion" ? GEL_BLUE : mode === "propulsion" ? GEL_ORANGE : GEL_PURPLE }}>
            <StatusDot size={6} color={mode === "repulsion" ? GEL_BLUE : mode === "propulsion" ? GEL_ORANGE : GEL_PURPLE} />
            {mode === "repulsion" ? "REPULSION GEL (JUMP BOOSTER)" : mode === "propulsion" ? "PROPULSION GEL (SPEED BOOSTER)" : "COMBO STUNT"}
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            VELOCITY: <strong className="text-white tabular-nums">{telemetry.velocity.toFixed(1)} KM/H</strong>
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            ALTITUDE: <strong className="text-white tabular-nums">{telemetry.altitude.toFixed(1)} M</strong>
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            FRICTION: <strong className="text-white">{telemetry.friction.toFixed(3)} µ</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerAction}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider rounded transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: mode === "repulsion" ? GEL_BLUE : mode === "propulsion" ? GEL_ORANGE : GEL_PURPLE,
              color: "#050508",
              cursor: "pointer",
            }}
          >
            {mode === "repulsion" ? (
              <>
                <JumpBoosterIcon size={12} color="#050508" />
                DROP & JUMP BOOST
              </>
            ) : mode === "propulsion" ? (
              <>
                <SpeedBoosterIcon size={12} color="#050508" />
                IGNITE SPEED RUN
              </>
            ) : (
              <>
                <ComboIcon size={12} color="#050508" />
                LAUNCH COMBO
              </>
            )}
          </button>
          <button
            onClick={() => resetSimulation(mode)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs tracking-wider border rounded transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              borderColor: "var(--border-subtle)",
              color: "var(--concrete-gray)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ResetIcon size={11} color="var(--concrete-gray)" />
            RESET
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={640}
          height={280}
          className="w-full block"
          style={{ height: "280px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />

        {/* Live Status Message */}
        <div
          className="absolute bottom-2 left-4 px-2.5 py-1 rounded"
          style={{
            background: "rgba(5, 5, 8, 0.85)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: telemetry.targetReached ? "#FFFFFF" : "var(--concrete-gray)",
            border: "1px solid var(--border-subtle)",
            letterSpacing: "0.06em",
          }}
        >
          {telemetry.status}
        </div>

        <div
          className="absolute bottom-2 right-4 text-[9px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--concrete-gray)",
            opacity: 0.6,
          }}
        >
          CLICK & DRAG TO FLING SUBJECT
        </div>
      </div>
    </div>
  )
}
