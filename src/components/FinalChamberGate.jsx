import { useState } from "react"
import { ArrowChevron } from "./Icons"

export default function FinalChamberGate({ onEnter }) {
  const [hovered, setHovered] = useState(false)

  return (
    <section
      id="chamber-final-gate"
      className="chamber-section relative flex flex-col items-center justify-center text-center"
      style={{ minHeight: "60vh", background: "var(--void-black)" }}
    >
      {/* Ambient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(15,74,128,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="text-xs tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ONE TEST REMAINS
        </div>

        <button
          onClick={onEnter}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="cta-primary relative inline-flex items-center gap-2 px-10 py-5 text-sm tracking-widest"
          style={{
            fontFamily: "var(--font-mono)",
            color: hovered ? "var(--void-black)" : "var(--portal-blue)",
            background: hovered ? "var(--portal-blue)" : "transparent",
            border: "1px solid var(--portal-blue)",
            cursor: "pointer",
            letterSpacing: "0.12em",
            overflow: "hidden",
            transition:
              "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease",
            boxShadow: hovered ? "0 0 30px rgba(30,144,255,0.3)" : "none",
            transform: hovered ? "translateY(-1px) scale(1.02)" : "none",
          }}
        >
          ENTER THE CHAMBER
          <span
            className="cta-arrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <ArrowChevron
              size={14}
              color={hovered ? "var(--void-black)" : "var(--portal-blue)"}
            />
          </span>
        </button>

        <div
          className="text-xs"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
            opacity: 0.4,
            letterSpacing: "0.08em",
          }}
        >
          THE FINAL ASSESSMENT AWAITS
        </div>
      </div>
    </section>
  )
}
