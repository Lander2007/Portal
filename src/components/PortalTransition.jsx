import { useEffect, useRef, useState } from "react"

export default function PortalTransition({ active = false, onComplete }) {
  const [phase, setPhase] = useState("idle") // idle | expand | hold | contract
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (reduced) {
      onComplete?.()
      return
    }

    setPhase("expand")
    timerRef.current = setTimeout(() => {
      setPhase("hold")
      timerRef.current = setTimeout(() => {
        onComplete?.()
        setPhase("contract")
        timerRef.current = setTimeout(() => setPhase("idle"), 500)
      }, 300)
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [active])

  if (phase === "idle") return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Radial wipe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--void-black)",
          clipPath:
            phase === "expand" || phase === "hold"
              ? "ellipse(120% 120% at 50% 50%)"
              : "ellipse(0% 0% at 50% 50%)",
          transition:
            phase === "expand"
              ? "clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
              : phase === "contract"
                ? "clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
        }}
      />

      {/* Portal ring */}
      <div
        style={{
          position: "relative",
          width: "min(60vw, 360px)",
          height: "min(80vh, 480px)",
          borderRadius: "50%",
          border: "3px solid transparent",
          background:
            "linear-gradient(var(--void-black), var(--void-black)) padding-box, linear-gradient(135deg, var(--portal-blue), var(--portal-orange)) border-box",
          boxShadow: `0 0 40px var(--portal-blue), 0 0 80px rgba(30, 144, 255, 0.3), inset 0 0 40px rgba(30, 144, 255, 0.1)`,
          transform:
            phase === "expand" || phase === "hold"
              ? "scaleX(0.55) scale(1)"
              : "scaleX(0.55) scale(0.1)",
          transition:
            phase === "expand"
              ? "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : phase === "contract"
                ? "transform 0.5s ease-in"
                : "none",
        }}
      />

      {/* Chromatic aberration flicker */}
      {phase === "hold" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(30, 144, 255, 0.03)",
            animation: "coreFlash 0.15s ease",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  )
}
