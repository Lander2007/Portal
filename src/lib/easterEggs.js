// Chamber Zero — Easter Egg Registry
// All copy is original. No in-game dialogue reproduced.

export function initConsoleBootLog() {
  const lines = [
    "%cCHAMBER ZERO FACILITY SYSTEMS v4.1.0",
    "Calibrating motivational emitters.............. OK",
    "Loading test subject database.................. 0 records found",
    "Initializing portal surface registry........... WARNING: walls not portal-compatible",
    "Checking cake inventory........................",
    "Cake inventory check........................... [REDACTED]",
    "Quantum tunneling subsystem.................... NOMINAL",
    "Aperture-grade safety protocols................ DISABLED (saves time)",
    "Handheld Portal Device firmware................ v0.0.1-unofficial",
    "Ethics compliance module....................... timeout",
    "",
    "%cFACILITY READY. Please proceed to the testing area.",
    "%cNote: This computer has been flagged for unauthorized creative expression.",
    "%cThe preceding flag has also been flagged. Ignore both.",
  ]

  const base =
    "color: #1E90FF; font-family: 'Share Tech Mono', monospace; font-size: 11px;"
  const muted = "color: #8C8C87; font-family: monospace; font-size: 10px;"
  const warn = "color: #FF7A1A; font-family: monospace; font-size: 10px;"

  let delay = 0
  lines.forEach((line, i) => {
    setTimeout(() => {
      if (i === 0) console.log(line, base)
      else if (i >= lines.length - 3) console.log(line, warn)
      else console.log(line, muted)
    }, delay)
    delay += i === 0 ? 0 : 60 + Math.random() * 40
  })
}

// Track scroll reversals for "achievement unlocked" toast
let scrollReversalCount = 0
let lastScrollDir = 0
let achievementFired = false

export function trackScrollReversal(dir, onAchievement) {
  if (achievementFired) return
  if (dir !== lastScrollDir && lastScrollDir !== 0) {
    scrollReversalCount++
    if (scrollReversalCount >= 5) {
      achievementFired = true
      onAchievement(
        "ACHIEVEMENT UNLOCKED",
        "Indecisive Navigator — reversed scroll direction 5 times. The facility admires your commitment to uncertainty.",
      )
    }
  }
  lastScrollDir = dir
}

// Konami-style key sequence: up up down down left right b a → joke sequence
const TARGET_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
]
let keyBuffer = []

export function initKeySequence(onTrigger) {
  const handleKey = (e) => {
    keyBuffer.push(e.code)
    if (keyBuffer.length > TARGET_SEQUENCE.length) {
      keyBuffer = keyBuffer.slice(-TARGET_SEQUENCE.length)
    }
    if (JSON.stringify(keyBuffer) === JSON.stringify(TARGET_SEQUENCE)) {
      keyBuffer = []
      onTrigger()
    }
  }
  window.addEventListener("keydown", handleKey)
  return () => window.removeEventListener("keydown", handleKey)
}

export const KEY_SEQUENCE_COPY = [
  "UNAUTHORIZED COMMAND SEQUENCE DETECTED.",
  "Reviewing footage...",
  "The facility notes your interest in classic gaming inputs.",
  "You have been awarded 0 test points.",
  "Please return to assigned chamber.",
  "Thank you for your continued participation.",
]

export const CAKE_LINES = [
  "Morale Enrichment Center — Level B",
  "Baked goods distribution: pending",
  "Dietary restriction field: [BLANK]",
  "Estimated fulfillment: upon completion of all tests",
  "Amendment 1: all tests",
  "Amendment 2: there are no further amendments",
]
