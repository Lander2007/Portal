// Chamber Zero — Centralized Audio Manager
// All sounds are procedural via Web Audio API — no audio files needed.
// Ambient hum, portal SFX, interaction sounds, all gated behind a global mute flag.

let audioCtx = null
let masterGain = null
let ambientNode = null
let ambientGain = null
let muted = true
const MUTED_KEY = "chamber-zero-muted"

function ensureContext() {
  if (audioCtx) return audioCtx
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = audioCtx.createGain()
  masterGain.gain.value = muted ? 0 : 0.5
  masterGain.connect(audioCtx.destination)
  return audioCtx
}

// ─── Mute persistence ────────────────────────────────────────────────────────
export function getMuted() {
  try {
    const stored = localStorage.getItem(MUTED_KEY)
    if (stored !== null) return stored === "true"
  } catch {}
  return true // default muted
}

export function setMuted(value) {
  muted = value
  try {
    localStorage.setItem(MUTED_KEY, String(value))
  } catch {}
  if (masterGain) {
    masterGain.gain.setTargetAtTime(value ? 0 : 0.5, audioCtx.currentTime, 0.05)
  }
  if (ambientGain) {
    ambientGain.gain.setTargetAtTime(
      value ? 0 : 0.06,
      audioCtx.currentTime,
      0.3,
    )
  }
}

export function toggleMute() {
  setMuted(!muted)
  return muted
}

export function isMuted() {
  return muted
}

// ─── Ambient facility hum ─────────────────────────────────────────────────────
export function startAmbient() {
  if (ambientNode) return
  ensureContext()

  ambientGain = audioCtx.createGain()
  ambientGain.gain.value = muted ? 0 : 0.06

  // Low drone — facility hum
  const osc1 = audioCtx.createOscillator()
  osc1.type = "sine"
  osc1.frequency.value = 55
  const g1 = audioCtx.createGain()
  g1.gain.value = 0.5
  osc1.connect(g1).connect(ambientGain)

  // Sub harmonic
  const osc2 = audioCtx.createOscillator()
  osc2.type = "sine"
  osc2.frequency.value = 110
  const g2 = audioCtx.createGain()
  g2.gain.value = 0.2
  osc2.connect(g2).connect(ambientGain)

  // Very quiet high whine — ventilation
  const osc3 = audioCtx.createOscillator()
  osc3.type = "sine"
  osc3.frequency.value = 440
  const g3 = audioCtx.createGain()
  g3.gain.value = 0.015
  osc3.connect(g3).connect(ambientGain)

  ambientGain.connect(masterGain)
  osc1.start()
  osc2.start()
  osc3.start()
  ambientNode = { osc1, osc2, osc3 }
}

export function stopAmbient() {
  if (!ambientNode) return
  try {
    ambientNode.osc1.stop()
    ambientNode.osc2.stop()
    ambientNode.osc3.stop()
  } catch {}
  ambientNode = null
  ambientGain = null
}

// ─── SFX: Portal fire (whoosh) ────────────────────────────────────────────────
export function playPortalFire(color = "blue") {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime
  const baseFreq = color === "blue" ? 800 : 600

  // Noise burst
  const bufferSize = audioCtx.sampleRate * 0.25
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0.3, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

  // Bandpass sweep
  const filter = audioCtx.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.setValueAtTime(baseFreq, now)
  filter.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.15)
  filter.Q.value = 2

  // Tonal ping
  const osc = audioCtx.createOscillator()
  osc.type = "sine"
  osc.frequency.setValueAtTime(baseFreq, now)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.2)

  const oscGain = audioCtx.createGain()
  oscGain.gain.setValueAtTime(0.15, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

  noise.connect(filter).connect(noiseGain).connect(masterGain)
  osc.connect(oscGain).connect(masterGain)

  noise.start(now)
  osc.start(now)
  noise.stop(now + 0.3)
  osc.stop(now + 0.25)
}

// ─── SFX: Button press (mechanical thunk) ─────────────────────────────────────
export function playButtonPress() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  osc.type = "square"
  osc.frequency.setValueAtTime(120, now)
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.08)

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

  osc.connect(gain).connect(masterGain)
  osc.start(now)
  osc.stop(now + 0.12)
}

// ─── SFX: Door open (mechanical slide/hiss) ───────────────────────────────────
export function playDoorOpen() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime

  // Low rumble
  const osc = audioCtx.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(60, now)
  osc.frequency.linearRampToValueAtTime(80, now + 0.3)

  const oscGain = audioCtx.createGain()
  oscGain.gain.setValueAtTime(0.12, now)
  oscGain.gain.linearRampToValueAtTime(0.06, now + 0.3)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  // Hiss noise
  const bufferSize = audioCtx.sampleRate * 0.5
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const env = Math.pow(1 - i / bufferSize, 2)
    data[i] = (Math.random() * 2 - 1) * env
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 2000

  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0.08, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

  osc.connect(oscGain).connect(masterGain)
  noise.connect(filter).connect(noiseGain).connect(masterGain)

  osc.start(now)
  noise.start(now)
  osc.stop(now + 0.55)
  noise.stop(now + 0.55)
}

// ─── SFX: Gel bounce chime ────────────────────────────────────────────────────
export function playGelBounce() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  osc.type = "sine"
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.15)

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

  osc.connect(gain).connect(masterGain)
  osc.start(now)
  osc.stop(now + 0.22)
}

// ─── SFX: Gel speed whoosh ────────────────────────────────────────────────────
export function playGelSpeed() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime
  const bufferSize = audioCtx.sampleRate * 0.3
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.4
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.setValueAtTime(600, now)
  filter.frequency.linearRampToValueAtTime(2000, now + 0.15)
  filter.Q.value = 3

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  noise.connect(filter).connect(gain).connect(masterGain)
  noise.start(now)
  noise.stop(now + 0.35)
}

// ─── SFX: Portal crossing (whoosh + pop) ──────────────────────────────────────
export function playPortalCrossing() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime

  // Whoosh
  const bufferSize = audioCtx.sampleRate * 0.3
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.5
  }
  const noise = audioCtx.createBufferSource()
  noise.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.exponentialRampToValueAtTime(1600, now + 0.2)

  const noiseGain = audioCtx.createGain()
  noiseGain.gain.setValueAtTime(0.2, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  // Pop
  const pop = audioCtx.createOscillator()
  pop.type = "sine"
  pop.frequency.setValueAtTime(1200, now + 0.12)
  pop.frequency.exponentialRampToValueAtTime(200, now + 0.2)

  const popGain = audioCtx.createGain()
  popGain.gain.setValueAtTime(0.2, now + 0.12)
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

  noise.connect(filter).connect(noiseGain).connect(masterGain)
  pop.connect(popGain).connect(masterGain)

  noise.start(now)
  pop.start(now + 0.12)
  noise.stop(now + 0.35)
  pop.stop(now + 0.28)
}

// ─── SFX: Switch activation (electronic confirm) ──────────────────────────────
export function playSwitchActivate() {
  if (muted) return
  ensureContext()

  const now = audioCtx.currentTime

  const osc1 = audioCtx.createOscillator()
  osc1.type = "sine"
  osc1.frequency.setValueAtTime(523, now)
  osc1.frequency.setValueAtTime(659, now + 0.06)
  osc1.frequency.setValueAtTime(784, now + 0.12)

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.setValueAtTime(0.15, now + 0.15)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc1.connect(gain).connect(masterGain)
  osc1.start(now)
  osc1.stop(now + 0.32)
}
