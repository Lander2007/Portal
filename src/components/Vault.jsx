import { useEffect, useState } from "react"

// ─── The Vault — hidden bonus chamber ─────────────────────────────────────────
// Not listed in the chamber registry, nav, or counter. Reachable only through
// the key-sequence easter egg. The discovery is the reward: a short personal
// note in the creator's own voice (the one place the facility voice drops).

export default function Vault({ visible, onClose }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!visible) return
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 350)
    return () => clearTimeout(t)
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => {
      if (e.code === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full mx-4 p-8"
        style={{
          background: "var(--void-black)",
          border: "1px solid var(--portal-blue)",
          boxShadow: "0 0 60px rgba(30,144,255,0.15)",
          fontFamily: "var(--font-mono)",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-xs mb-2 tracking-widest"
          style={{ color: "var(--portal-orange)" }}
        >
          ▓▓ UNLISTED CHAMBER ▓▓
        </div>
        <div
          className="text-2xl font-bold mb-6 tracking-wider"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.08em",
          }}
        >
          THE VAULT
        </div>

        <div
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--facility-white)" }}
        >
          Hi. This room isn&apos;t on any map, so I can drop the act for a
          minute.
        </div>
        <div
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--concrete-gray)" }}
        >
          I built Chamber Zero to learn how game feel actually works — why a
          bounce with squash reads as joy and one without reads as a bug, why
          a portal that keeps your momentum feels like flying and one that
          doesn&apos;t feels like a loading screen. Every room here is a small
          answer to a question I couldn&apos;t stop poking at.
        </div>
        <div
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--concrete-gray)" }}
        >
          You typed a thirty-year-old cheat code into a fan site to find this.
          That tells me you poke at walls too. Keep doing that — there&apos;s
          almost always something behind them.
        </div>
        <div
          className="text-xs mb-8 tracking-widest"
          style={{ color: "var(--concrete-gray)", opacity: 0.6 }}
        >
          — THE DEVELOPER
        </div>

        <div
          className="text-[10px] mb-6 tracking-widest"
          style={{ color: "var(--concrete-gray)", opacity: 0.45 }}
        >
          THIS CHAMBER APPEARS ON NO MAP. THE COUNTER WILL NEVER KNOW YOU WERE
          HERE.
        </div>

        <button
          className="text-xs tracking-widest"
          style={{
            color: "var(--portal-blue)",
            background: "none",
            border: "1px solid var(--portal-blue)",
            padding: "8px 16px",
            cursor: "pointer",
            letterSpacing: "0.12em",
          }}
          onClick={onClose}
        >
          [RETURN TO ASSIGNED CHAMBER]
        </button>
      </div>
    </div>
  )
}
