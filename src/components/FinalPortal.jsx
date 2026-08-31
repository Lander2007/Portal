import { useState, useRef, useEffect } from "react"
import DebriefPanel from "./DebriefPanel"
import { ArrowChevron } from "./Icons"

const PORTAL_BLUE = "#1E90FF"
const PORTAL_ORANGE = "#FF7A1A"

export default function FinalPortal({
  interactionCount = 0,
  easterEggsFound = 0,
  onExit,
}) {
  const [visible, setVisible] = useState(false)
  const [portalActive, setPortalActive] = useState(false)
  const swirlRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Swirl rotation
  useEffect(() => {
    if (!portalActive) return
    let frame
    const animate = () => {
      if (swirlRef.current) {
        swirlRef.current.style.transform += ""
        const current = parseFloat(swirlRef.current.dataset.rot || "0")
        const next = current + 1.5
        swirlRef.current.dataset.rot = String(next)
        swirlRef.current.style.transform = `rotate(${next}deg)`
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [portalActive])

  useEffect(() => {
    const t = setTimeout(() => setPortalActive(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="chamber-final"
      className="chamber-section relative flex flex-col items-center justify-center text-center"
      style={{ minHeight: "100vh", background: "var(--void-black)" }}
    >
      {/* Ambient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(15,74,128,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 50% 70%, rgba(140,67,16,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Portal visual */}
        <div className="relative" style={{ width: 200, height: 280 }}>
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(30,144,255,0.08) 0%, transparent 70%)`,
              filter: "blur(20px)",
              opacity: portalActive ? 1 : 0,
              transition: "opacity 1s ease",
            }}
          />

          {/* Portal void — dark center */}
          <div
            className="absolute rounded-full"
            style={{
              left: "15%",
              top: "5%",
              width: "70%",
              height: "90%",
              background: "rgba(0,0,5,0.92)",
              border: `3px solid ${PORTAL_BLUE}`,
              boxShadow: `0 0 30px ${PORTAL_BLUE}40, 0 0 60px ${PORTAL_BLUE}15, inset 0 0 30px ${PORTAL_BLUE}10`,
              opacity: portalActive ? 1 : 0,
              transform: portalActive ? "scaleX(0.55) scale(1)" : "scale(0.1)",
              transition:
                "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />

          {/* Swirl rings */}
          <div
            ref={swirlRef}
            className="absolute inset-0 pointer-events-none"
            data-rot="0"
            style={{
              opacity: portalActive ? 0.7 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            {[0, 60, 120].map((rot) => (
              <div
                key={rot}
                className="absolute rounded-full"
                style={{
                  left: "20%",
                  top: "10%",
                  width: "60%",
                  height: "80%",
                  border: `1.5px solid ${PORTAL_BLUE}`,
                  opacity: 0.5,
                  transform: `rotate(${rot}deg)`,
                }}
              />
            ))}
          </div>

          {/* Inner rim glow */}
          <div
            className="absolute rounded-full"
            style={{
              left: "22%",
              top: "12%",
              width: "56%",
              height: "76%",
              border: `1px solid ${PORTAL_BLUE}`,
              opacity: portalActive ? 0.4 : 0,
              transition: "opacity 0.6s ease 0.3s",
            }}
          />

          {/* Point light effect */}
          <div
            className="absolute rounded-full"
            style={{
              left: "35%",
              top: "30%",
              width: "30%",
              height: "40%",
              background: `radial-gradient(ellipse at 50% 50%, ${PORTAL_BLUE}15, transparent)`,
              opacity: portalActive ? 1 : 0,
              transition: "opacity 0.8s ease 0.2s",
            }}
          />
        </div>

        {/* Companion Cube — quiet callback, no interaction */}
        <div
          className="absolute"
          style={{
            right: "calc(50% - 160px)",
            bottom: "calc(50% - 100px)",
            opacity: visible ? 0.35 : 0,
            transition: "opacity 1.2s ease 1s",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28">
            <rect
              x="2"
              y="2"
              width="24"
              height="24"
              fill="#5A5A60"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <circle cx="11" cy="11" r="2.5" fill="#D9A0A0" />
            <circle cx="17" cy="11" r="2.5" fill="#D9A0A0" />
            <polygon points="7,12 14,21 21,12" fill="#D9A0A0" />
          </svg>
        </div>

        {/* Debrief */}
        <DebriefPanel
          interactionCount={interactionCount}
          easterEggsFound={easterEggsFound}
        />

        {/* Exit CTA */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 1.5s",
          }}
        >
          <button
            onClick={onExit}
            className="cta-primary relative inline-flex items-center gap-2 px-8 py-4 text-sm tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--portal-blue)",
              border: "1px solid var(--portal-blue)",
              cursor: "pointer",
              letterSpacing: "0.12em",
              overflow: "hidden",
            }}
          >
            EXIT THROUGH THE APERTURE
            <span
              className="cta-arrow"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <ArrowChevron size={14} color="var(--portal-blue)" />
            </span>
          </button>
          <div
            className="mt-3 text-center text-xs"
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
      </div>
    </section>
  )
}
