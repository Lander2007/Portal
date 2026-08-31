import { useState } from "react"
import GelInteractive from "./GelInteractive"

const GEL_BLUE = "#1E90FF"
const GEL_ORANGE = "#FF7A1A"
const GEL_PURPLE = "#A855F7"

export default function GelExplainer({ onInteraction }) {
  const [activeGel, setActiveGel] = useState("repulsion")

  return (
    <section
      id="chamber-02"
      className="chamber-section"
      style={{ background: "var(--void-black)", position: "relative" }}
    >
      {/* Ambient wash — split blue/orange */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 50% at 20% 40%, rgba(15,74,128,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 60%, rgba(140,67,16,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Section header */}
      <div className="mb-12">
        <div
          className="text-xs mb-3 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          [02] MATERIALS TESTING
        </div>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          GEL MOBILITY COMPOUNDS
        </h2>
        <p
          className="max-w-2xl text-base leading-relaxed"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Aperture Science fluid mobility compounds alter surface dynamics to grant super-human traversal abilities:{" "}
          <strong style={{ color: GEL_BLUE }}>Blue Repulsion Gel acts as a vertical jump booster</strong> to launch test subjects to high platforms, while{" "}
          <strong style={{ color: GEL_ORANGE }}>Orange Propulsion Gel acts as a zero-friction speed booster</strong> to sprint across impassable chasms.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="flex gap-2 mb-8 flex-wrap"
        style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}
      >
        {[
          { id: "repulsion", label: "▲ BLUE GEL: JUMP BOOSTER", color: GEL_BLUE },
          { id: "propulsion", label: "▶ ORANGE GEL: SPEED BOOSTER", color: GEL_ORANGE },
          { id: "combo", label: "⚡ COMBO: SPEED + JUMP STUNT", color: GEL_PURPLE },
        ].map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => {
              setActiveGel(id)
              onInteraction?.()
            }}
            className="px-5 py-2.5 text-xs font-bold tracking-widest transition-all duration-150 rounded"
            style={{
              fontFamily: "var(--font-mono)",
              color: activeGel === id ? "#0A0A0E" : color,
              background: activeGel === id ? color : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeGel === id ? color : "var(--border-subtle)"}`,
              cursor: "pointer",
              letterSpacing: "0.1em",
              boxShadow: activeGel === id ? `0 0 16px ${color}40` : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="mb-10">
        <div
          className="text-xs mb-3 tracking-widest flex items-center justify-between"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>INTERACTIVE TESTING CHAMBER — PHYSICS SIMULATOR</span>
          <span style={{ color: activeGel === "repulsion" ? GEL_BLUE : activeGel === "propulsion" ? GEL_ORANGE : GEL_PURPLE }}>
            CURRENT SIMULATION: {activeGel.toUpperCase()}
          </span>
        </div>
        <GelInteractive
          mode={activeGel}
          onInteraction={onInteraction}
        />
      </div>

      {/* Two-panel layout explaining mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Repulsion panel (Jump Booster) */}
        <div
          className="p-6 transition-all"
          style={{
            border: `1px solid ${activeGel === "repulsion" ? GEL_BLUE : "var(--border-subtle)"}`,
            background: activeGel === "repulsion" ? "rgba(30, 144, 255, 0.04)" : "transparent",
            opacity: activeGel === "repulsion" ? 1 : 0.6,
          }}
          onClick={() => setActiveGel("repulsion")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: GEL_BLUE,
                  boxShadow: `0 0 12px ${GEL_BLUE}`,
                }}
              />
              <span
                className="text-xs tracking-widest font-bold"
                style={{ color: GEL_BLUE, fontFamily: "var(--font-mono)" }}
              >
                REPULSION GEL — JUMP BOOSTER
              </span>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded border"
              style={{ borderColor: GEL_BLUE, color: GEL_BLUE, fontFamily: "var(--font-mono)" }}
            >
              +320% VERTICAL ELASTICITY
            </span>
          </div>

          <h3
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--facility-white)",
              letterSpacing: "0.05em",
            }}
          >
            Vertical Super-Bounce Pad
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            Surfaces coated in Repulsion Gel convert 100% of downward kinetic momentum into explosive vertical spring velocity. 
            Falling from even modest heights triggers an elastic super-jump, allowing test subjects to ascend to elevated catwalks and leap across giant vertical obstacles without requiring a jetpack.
          </p>
          <div
            className="text-xs"
            style={{
              color: GEL_BLUE,
              fontFamily: "var(--font-mono)",
              opacity: 0.85,
            }}
          >
            FUNCTION: SUPER JUMP · HIGH-ALTITUDE RECOVERY · MOMENTUM MULTIPLIER
          </div>
        </div>

        {/* Propulsion panel (Speed Booster) */}
        <div
          className="p-6 transition-all"
          style={{
            border: `1px solid ${activeGel === "propulsion" ? GEL_ORANGE : "var(--border-subtle)"}`,
            background: activeGel === "propulsion" ? "rgba(255, 122, 26, 0.04)" : "transparent",
            opacity: activeGel === "propulsion" ? 1 : 0.6,
          }}
          onClick={() => setActiveGel("propulsion")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: GEL_ORANGE,
                  boxShadow: `0 0 12px ${GEL_ORANGE}`,
                }}
              />
              <span
                className="text-xs tracking-widest font-bold"
                style={{ color: GEL_ORANGE, fontFamily: "var(--font-mono)" }}
              >
                PROPULSION GEL — SPEED BOOSTER
              </span>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded border"
              style={{ borderColor: GEL_ORANGE, color: GEL_ORANGE, fontFamily: "var(--font-mono)" }}
            >
              µ = 0.000 (ZERO FRICTION)
            </span>
          </div>

          <h3
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--facility-white)",
              letterSpacing: "0.05em",
            }}
          >
            Supersonic Frictionless Runway
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            Propulsion Gel totally eliminates surface friction (`µ = 0.000`). Test subjects sprinting across an orange runway continuously accelerate into supersonic speeds (180+ km/h) without deceleration. 
            This extreme horizontal velocity enables jumping across massive acid pits, hazard canyons, and security barriers.
          </p>
          <div
            className="text-xs"
            style={{
              color: GEL_ORANGE,
              fontFamily: "var(--font-mono)",
              opacity: 0.85,
            }}
          >
            FUNCTION: SUPERSONIC SPEED · FRICTION ELIMINATION · CHASM CROSSING
          </div>
        </div>
      </div>

      {/* Conversion Gel footnote */}
      <div
        className="mt-6 p-4 rounded"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          className="text-xs mb-1"
          style={{ color: "var(--concrete-gray)", opacity: 0.5 }}
        >
          APPENDIX — THIRD COMPOUND
        </div>
        <div
          className="text-xs leading-relaxed"
          style={{ color: "var(--concrete-gray)" }}
        >
          <span style={{ color: "var(--facility-white)" }}>Conversion Gel</span>{" "}
          (white) — renders any surface portal-compatible regardless of material
          composition. Formulated from ground lunar rocks. Highly toxic if ingested. Do not breathe dust.
        </div>
      </div>
    </section>
  )
}
