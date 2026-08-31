import { useRef, useState, useCallback, useEffect } from "react"

const GEL_BLUE = "#1E90FF"
const GEL_ORANGE = "#FF7A1A"
const GEL_WHITE = "#E6F0FA"

// Sound synthesis using Web Audio API
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    if (type === "bounce") {
      // Bouncy elastic spring sound
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
      // Supersonic whoosh sound
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
      // Aperture success chime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      osc1.type = "triangle"
      osc2.type = "sine"
      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1) // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2) // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.3) // C6
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.65)
    }
  } catch {
    // Audio context may be blocked by browser autoplay policy until interaction
  }
}

export default function GelInteractive({ mode = "repulsion", onInteraction }) {
  const canvasRef = useRef(null)
  const animRef = useRef(0)
  const soundEnabled = useRef(true)

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
    speedLines: [],
    shockwaves: [],
    statusText: "READY FOR LAUNCH",
    targetHit: false,
    comboStage: 0,
  })

  const [telemetry, setTelemetry] = useState({
    velocity: 0,
    altitude: 0,
    friction: 0.85,
    bounceFactor: 1.0,
    status: "READY FOR LAUNCH",
    targetReached: false,
  })

  // Sync mode changes
  useEffect(() => {
    stateRef.current.mode = mode
    resetSimulation(mode)
  }, [mode])

  const resetSimulation = useCallback((currentMode) => {
    const s = stateRef.current
    s.mode = currentMode
    s.particles = []
    s.speedLines = []
    s.shockwaves = []
    s.targetHit = false
    s.comboStage = 0

    if (currentMode === "repulsion") {
      // Repulsion: place subject above the drop platform
      s.x = 100
      s.y = 70
      s.vx = 1.2
      s.vy = 0
      s.statusText = "DROP FROM HEIGHT TO TRIGGER SUPER JUMP"
    } else if (currentMode === "propulsion") {
      // Propulsion: place subject at runway start
      s.x = 60
      s.y = 210
      s.vx = 0
      s.vy = 0
      s.statusText = "PRESS 'IGNITE SPEED RUN' FOR ZERO-FRICTION SPRINT"
    } else {
      // Combo stunt
      s.x = 50
      s.y = 210
      s.vx = 0
      s.vy = 0
      s.statusText = "COMBO: SPRINT ON ORANGE GEL -> LAUNCH ON BLUE RAMP"
    }
  }, [])

  // Trigger demo action
  const triggerAction = useCallback(() => {
    const s = stateRef.current
    onInteraction?.()

    if (s.mode === "repulsion") {
      // Drop high from apex
      s.x = 220
      s.y = 40
      s.vx = 1.5
      s.vy = 2.0
      s.targetHit = false
      s.statusText = "FREEFALLING TOWARDS BLUE REPULSION GEL..."
    } else if (s.mode === "propulsion") {
      // Supersonic boost
      s.x = 60
      s.y = 210
      s.vx = 16.5
      s.vy = 0
      s.targetHit = false
      s.statusText = "SUPERSONIC ACCELERATION ENGAGED (µ = 0.000)"
      if (soundEnabled.current) playSound("speed")
    } else {
      // Combo launch
      s.x = 50
      s.y = 210
      s.vx = 15.0
      s.vy = 0
      s.comboStage = 1
      s.targetHit = false
      s.statusText = "ACCELERATING ACROSS ORANGE TRACK..."
      if (soundEnabled.current) playSound("speed")
    }
  }, [onInteraction])

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

      // ─── Draw Aperture Facility Background ────────────────────────────────
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

      // Hazard stripes on boundaries
      ctx.fillStyle = "rgba(255, 122, 26, 0.08)"
      ctx.fillRect(0, H - 12, W, 12)

      // ─── MODE 1: REPULSION GEL (SUPER JUMP BOOSTER) ───────────────────────
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

        // Goal Indicator Beacon
        ctx.font = "9px monospace"
        ctx.fillStyle = s.targetHit ? "#FFFFFF" : "var(--concrete-gray)"
        ctx.fillText(
          s.targetHit ? "✓ CATWALK REACHED" : "ELEVATED GOAL [18.4m]",
          highPlatform.x + 10,
          highPlatform.y - 24,
        )

        // ─── Blue Repulsion Gel Pool (Animated fluid surface) ───
        const gelGrad = ctx.createLinearGradient(0, floorY, 0, H)
        gelGrad.addColorStop(0, GEL_BLUE)
        gelGrad.addColorStop(1, "rgba(15, 74, 128, 0.4)")
        ctx.fillStyle = gelGrad
        ctx.beginPath()
        ctx.moveTo(gelLeft, floorY)
        // Gel wave animation
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

        // Gel Surface Glow
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

        // Gel Label
        ctx.font = "10px monospace"
        ctx.fillStyle = GEL_BLUE
        ctx.fillText("▲ REPULSION GEL [SUPER JUMP ZONE] ▲", gelLeft + 15, floorY + 28)

        // ─── Physics ───
        if (!s.isDragging) {
          s.vy += 28.0 * dt // Gravity
          s.x += s.vx
          s.y += s.vy

          // Left/Right bounds
          if (s.x < 20) {
            s.x = 20
            s.vx = Math.abs(s.vx) * 0.8
          }
          if (s.x > W - 20) {
            s.x = W - 20
            s.vx = -Math.abs(s.vx) * 0.8
          }

          // Catwalk landing
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
              s.statusText = "✓ SUPER JUMP SUCCESSFUL — HIGH LEDGE CLEARED!"
              if (soundEnabled.current) playSound("success")
            }
          }

          // Floor / Gel contact
          if (s.y >= floorY - 18) {
            s.y = floorY - 18
            const isOnGel = s.x >= gelLeft && s.x <= gelRight

            if (isOnGel) {
              // 🚀 SUPER BOUNCE (Repulsion Jump Boost)
              const inboundSpeed = Math.abs(s.vy)
              s.vy = -Math.max(16.5, inboundSpeed * 1.35) // Super bounce multiplier
              s.vx = (highPlatform.x + 40 - s.x) * 0.022 // Trajectory towards catwalk
              s.jumpCount++
              s.statusText = `⚡ SUPER JUMP BOOST FIRED! VELOCITY: ${Math.abs(s.vy * 3.5).toFixed(1)} m/s`

              if (soundEnabled.current) playSound("bounce")

              // Spawn shockwave ring
              s.shockwaves.push({
                x: s.x,
                y: floorY,
                r: 5,
                maxR: 60,
                alpha: 0.9,
                color: GEL_BLUE,
              })

              // Spawn splash particles
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
              // Normal floor damping
              s.vy = -Math.abs(s.vy) * 0.25
              s.vx *= 0.8
              if (Math.abs(s.vy) < 1.0) s.vy = 0
            }
          }
        }
      }

      // ─── MODE 2: PROPULSION GEL (SPEED BOOSTER / ZERO FRICTION) ───────────
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

        // Start platform
        ctx.fillStyle = "#16161D"
        ctx.fillRect(startX, trackY, gelStartX - startX, 40)

        // Hazard Pit (Acid gap)
        ctx.fillStyle = "rgba(180, 40, 20, 0.2)"
        ctx.fillRect(pitStartX, trackY + 8, pitEndX - pitStartX, 50)
        ctx.strokeStyle = "rgba(255, 60, 40, 0.4)"
        ctx.strokeRect(pitStartX, trackY + 8, pitEndX - pitStartX, 50)

        // Spikes / Hazard Warning
        ctx.font = "9px monospace"
        ctx.fillStyle = "#FF4444"
        ctx.fillText("▲ HAZARD GAP (42.0m) ▲", pitStartX + 12, trackY + 36)

        // Far landing platform
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
          s.targetHit ? "✓ SPEED GATE CLEARED" : "VELOCITY GATE [120+ km/h]",
          speedGateX - 60,
          trackY - 60,
        )

        // ─── Orange Propulsion Gel Strip ───
        const gelGrad = ctx.createLinearGradient(gelStartX, 0, gelEndX, 0)
        gelGrad.addColorStop(0, "rgba(255, 122, 26, 0.4)")
        gelGrad.addColorStop(1, GEL_ORANGE)
        ctx.fillStyle = gelGrad
        ctx.fillRect(gelStartX, trackY, gelEndX - gelStartX, 10)

        // Flowing Propulsion Chevron Arrows
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

        // Glow line
        ctx.shadowColor = GEL_ORANGE
        ctx.shadowBlur = 16
        ctx.strokeStyle = GEL_ORANGE
        ctx.lineWidth = 2
        ctx.strokeRect(gelStartX, trackY, gelEndX - gelStartX, 10)
        ctx.shadowBlur = 0

        // Track Label
        ctx.font = "10px monospace"
        ctx.fillStyle = GEL_ORANGE
        ctx.fillText("▶▶ PROPULSION GEL [ZERO FRICTION SPEED RUNWAY] ▶▶", gelStartX + 10, trackY + 28)

        // ─── Physics ───
        if (!s.isDragging) {
          const isOnOrangeGel = s.x >= gelStartX && s.x <= gelEndX && s.y >= trackY - 24

          if (isOnOrangeGel) {
            // ⚡ Zero friction + forward thrust acceleration
            s.vx += 32.0 * dt
            s.vx = Math.min(s.vx, 22.0) // Top speed cap
            s.vy = 0
            s.y = trackY - 18

            // Speed lines & sparks
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
            // In the air over the hazard pit!
            s.vy += 22.0 * dt // Gravity
          } else if (s.x >= landStartX) {
            // Landed on far side
            s.vy = 0
            s.y = trackY - 18
            s.vx *= 0.94 // Natural deceleration

            if (s.x >= speedGateX - 10 && !s.targetHit) {
              s.targetHit = true
              s.statusText = "✓ SUPERSONIC SPEED GAP CLEARED — TARGET ACHIEVED!"
              if (soundEnabled.current) playSound("success")
            }
          } else {
            // Normal track
            s.vx *= 0.92
          }

          s.x += s.vx
          s.y += s.vy

          // Fall into hazard pit reset
          if (s.y > trackY + 30) {
            s.x = 60
            s.y = trackY - 18
            s.vx = 0
            s.vy = 0
            s.statusText = "INSUFFICIENT SPEED — REPOSITIONING TEST SUBJECT"
          }
        }
      }

      // ─── MODE 3: COMBO STUNT (SPEED RUN + BOUNCE RAMP) ───────────────────
      else {
        const trackY = 220
        const orangeStartX = 40
        const orangeEndX = 260
        const blueRampX = 280
        const catwalkX = 460
        const catwalkY = 70

        // Orange runway
        ctx.fillStyle = GEL_ORANGE
        ctx.fillRect(orangeStartX, trackY, orangeEndX - orangeStartX, 8)

        // Angled Blue Gel Jump Ramp
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

        // High Exit Catwalk
        ctx.fillStyle = "#1E1E28"
        ctx.fillRect(catwalkX, catwalkY, 120, 12)
        ctx.strokeStyle = "var(--portal-blue)"
        ctx.strokeRect(catwalkX, catwalkY, 120, 12)

        ctx.font = "9px monospace"
        ctx.fillStyle = s.targetHit ? "#FFFFFF" : "var(--concrete-gray)"
        ctx.fillText(
          s.targetHit ? "✓ COMBO STUNT COMPLETE!" : "HIGH APERTURE EXIT [24.0m]",
          catwalkX,
          catwalkY - 12,
        )

        // Physics
        if (!s.isDragging) {
          if (s.x >= orangeStartX && s.x <= orangeEndX) {
            // Accelerate on orange
            s.vx += 30.0 * dt
            s.vx = Math.min(s.vx, 20.0)
            s.y = trackY - 18
          } else if (s.x >= blueRampX && s.x <= blueRampX + 45 && s.y >= trackY - 35) {
            // 🚀 Hit Blue Ramp -> Launch into high parabola
            s.vy = -17.5
            s.vx = 11.0
            if (soundEnabled.current) playSound("bounce")
            s.statusText = "MOMENTUM REDIRECTED — LAUNCHING SKYWARD!"
          } else {
            s.vy += 22.0 * dt
          }

          s.x += s.vx
          s.y += s.vy

          // Land on catwalk
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
              s.statusText = "✓ PERFECT MOMENTUM CONVERSION!"
              if (soundEnabled.current) playSound("success")
            }
          }

          // Ground bounce
          if (s.y > trackY + 40) {
            s.x = 50
            s.y = trackY - 18
            s.vx = 0
            s.vy = 0
          }
        }
      }

      // ─── Render Shockwaves ────────────────────────────────────────────────
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

      // ─── Render Particles ─────────────────────────────────────────────────
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

      // ─── Render Speed Lines (When traveling fast) ─────────────────────────
      const currentSpeed = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      if (currentSpeed > 6.0) {
        ctx.strokeStyle = s.mode === "propulsion" ? GEL_ORANGE : GEL_BLUE
        ctx.lineWidth = 1.5
        ctx.globalAlpha = Math.min(0.7, currentSpeed / 20.0)
        for (let i = 0; i < 4; i++) {
          const lx = s.x - s.vx * (i + 1) * 2
          const ly = s.y - s.vy * (i + 1) * 2 + (i - 2) * 4
          ctx.beginPath()
          ctx.moveTo(lx, ly)
          ctx.lineTo(lx - s.vx * 3, ly - s.vy * 3)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      // ─── Render Aperture Test Subject ─────────────────────────────────────
      const bodyColor = s.mode === "propulsion" ? GEL_ORANGE : GEL_BLUE
      const posX = s.x
      const posY = s.y

      // Subject glow
      ctx.shadowColor = bodyColor
      ctx.shadowBlur = 12
      ctx.fillStyle = bodyColor
      ctx.beginPath()
      ctx.arc(posX, posY - 6, 8, 0, Math.PI * 2) // Head
      ctx.fill()
      ctx.shadowBlur = 0

      // Subject Torso & Limbs
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(posX, posY + 2)
      ctx.lineTo(posX, posY + 16) // Torso

      // Arms & Legs animation
      const legAnim = Math.sin(now * 0.03 * currentSpeed) * 8
      ctx.moveTo(posX, posY + 16)
      ctx.lineTo(posX - 6 + legAnim, posY + 28) // Left leg
      ctx.moveTo(posX, posY + 16)
      ctx.lineTo(posX + 6 - legAnim, posY + 28) // Right leg

      ctx.moveTo(posX, posY + 6)
      ctx.lineTo(posX - 10 - legAnim, posY + 14) // Left arm
      ctx.moveTo(posX, posY + 6)
      ctx.lineTo(posX + 10 + legAnim, posY + 14) // Right arm
      ctx.stroke()

      // Update Telemetry
      setTelemetry({
        velocity: currentSpeed * 3.6, // km/h
        altitude: Math.max(0, (240 - posY) * 0.1), // meters
        friction: s.mode === "propulsion" ? 0.0 : 0.85,
        bounceFactor: s.mode === "repulsion" ? 3.2 : 0.3,
        status: s.statusText,
        targetReached: s.targetHit,
      })

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [mode])

  // Mouse / Touch Drag to fling subject
  const onPointerDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    stateRef.current.isDragging = true
    stateRef.current.x = clickX
    stateRef.current.y = clickY
    stateRef.current.vx = 0
    stateRef.current.vy = 0
    stateRef.current.statusText = "DRAGGING SUBJECT — RELEASE TO LAUNCH"
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
    if (!stateRef.current.isDragging) return
    stateRef.current.isDragging = false
    stateRef.current.vx = 2.0
    stateRef.current.vy = 1.0
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
      {/* Simulation Telemetry HUD */}
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
          <span style={{ color: mode === "repulsion" ? GEL_BLUE : GEL_ORANGE }}>
            ● {mode === "repulsion" ? "REPULSION GEL (JUMP BOOSTER)" : mode === "propulsion" ? "PROPULSION GEL (SPEED BOOSTER)" : "COMBO STUNT"}
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            VELOCITY: <strong className="text-white">{telemetry.velocity.toFixed(1)} km/h</strong>
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            ALTITUDE: <strong className="text-white">{telemetry.altitude.toFixed(1)} m</strong>
          </span>
          <span style={{ color: "var(--concrete-gray)" }}>
            FRICTION: <strong className="text-white">{telemetry.friction.toFixed(3)} µ</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerAction}
            className="px-3 py-1 text-xs font-bold tracking-wider rounded transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: mode === "repulsion" ? GEL_BLUE : GEL_ORANGE,
              color: "#050508",
              cursor: "pointer",
            }}
          >
            {mode === "repulsion" ? "▲ DROP & JUMP BOOST" : mode === "propulsion" ? "▶ IGNITE SPEED RUN" : "⚡ LAUNCH COMBO"}
          </button>
          <button
            onClick={() => resetSimulation(mode)}
            className="px-3 py-1 text-xs tracking-wider border rounded transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              borderColor: "var(--border-subtle)",
              color: "var(--concrete-gray)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
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
          className="absolute bottom-2 left-4 px-2 py-1 rounded"
          style={{
            background: "rgba(5, 5, 8, 0.75)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: telemetry.targetReached ? "#FFFFFF" : "var(--concrete-gray)",
            border: "1px solid var(--border-subtle)",
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
