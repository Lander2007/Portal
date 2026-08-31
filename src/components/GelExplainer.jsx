import { useState } from "react"
import GelInteractive from "./GelInteractive"

const GEL_BLUE = "#2FA8FF"
const GEL_ORANGE = "#FF9838"

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
            "radial-gradient(ellipse 40% 50% at 20% 40%, rgba(15,74,128,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 80% 60%, rgba(140,67,16,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Section header */}
      <div className="mb-16">
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
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          GEL PROPERTIES
        </h2>
        <p
          className="max-w-xl text-base leading-relaxed"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Aperture Science Repulsion and Propulsion Gels are fluid compounds
          engineered for surface modification. Subject interaction is required
          for data collection purposes. Informed consent is optional and has
          been waived.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="flex gap-0 mb-10"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {[
          { id: "repulsion", label: "REPULSION GEL", color: GEL_BLUE },
          { id: "propulsion", label: "PROPULSION GEL", color: GEL_ORANGE },
        ].map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setActiveGel(id)}
            className="px-6 py-3 text-xs tracking-widest transition-all duration-150"
            style={{
              fontFamily: "var(--font-mono)",
              color: activeGel === id ? color : "var(--concrete-gray)",
              borderBottom:
                activeGel === id
                  ? `2px solid ${color}`
                  : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              letterSpacing: "0.12em",
              marginBottom: "-1px",
            }}
            onMouseEnter={(e) => {
              if (activeGel !== id) {
                e.currentTarget.style.color = "var(--facility-white)"
                e.currentTarget.style.borderBottomColor = "var(--border-mid)"
              }
            }}
            onMouseLeave={(e) => {
              if (activeGel !== id) {
                e.currentTarget.style.color = "var(--concrete-gray)"
                e.currentTarget.style.borderBottomColor = "transparent"
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Repulsion panel */}
        <div
          className="p-6"
          style={{
            border: "1px solid var(--border-subtle)",
            opacity: activeGel === "repulsion" ? 1 : 0.4,
            transition: "opacity 0.3s",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: GEL_BLUE,
                boxShadow: `0 0 12px ${GEL_BLUE}`,
              }}
            />
            <span
              className="text-xs tracking-widest"
              style={{ color: GEL_BLUE, fontFamily: "var(--font-mono)" }}
            >
              REPULSION GEL — BLUE
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
            Elastic Bounce Compound
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            When applied to a surface, Repulsion Gel causes any object — or test
            subject — that contacts it to bounce uncontrollably at high
            velocity. The gel temporarily suppresses conventional friction
            coefficients and converts all inbound kinetic energy into vertical
            displacement. Practical applications include: reaching elevated
            platforms, clearing impassable gaps, and what facility staff refer
            to as "subject enthusiasm events."
          </p>
          <div
            className="text-xs"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.6,
            }}
          >
            BEHAVIOR: HIGH VERTICAL VELOCITY · ELASTIC DECAY · MULTIPLE BOUNCE
            SEQUENCE
          </div>
        </div>

        {/* Propulsion panel */}
        <div
          className="p-6"
          style={{
            border: "1px solid var(--border-subtle)",
            opacity: activeGel === "propulsion" ? 1 : 0.4,
            transition: "opacity 0.3s",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: GEL_ORANGE,
                boxShadow: `0 0 12px ${GEL_ORANGE}`,
              }}
            />
            <span
              className="text-xs tracking-widest"
              style={{ color: GEL_ORANGE, fontFamily: "var(--font-mono)" }}
            >
              PROPULSION GEL — ORANGE
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
            Friction Elimination Compound
          </h3>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            Propulsion Gel eliminates surface friction entirely. Any object
            moving across a Propulsion-coated surface builds speed with
            virtually no resistance — allowing the test subject to achieve
            velocities sufficient to cross gaps that would otherwise require an
            impractical amount of jumping. Velocity decays slowly after leaving
            the gel surface. The gel does not, contrary to popular belief, make
            things go faster by itself. It simply stops them from slowing down.
            There is a difference.
          </p>
          <div
            className="text-xs"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.6,
            }}
          >
            BEHAVIOR: HORIZONTAL ACCELERATION · MINIMAL FRICTION · SUSTAINED
            GLIDE
          </div>
        </div>
      </div>

      {/* Interactive widget */}
      <div className="mb-6">
        <div
          className="text-xs mb-3 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          INTERACTIVE SIMULATION — DRAG AND FLING THE OBJECT
        </div>
        <GelInteractive
          mode={activeGel === "repulsion" ? "repulsion" : "propulsion"}
          onInteraction={onInteraction}
        />
      </div>

      {/* Conversion Gel footnote */}
      <div
        className="mt-8 p-4"
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
          composition. Applied to non-portalable walls, ceilings, or floors,
          enabling portal placement in otherwise restricted zones. Not available
          for in-field requisition. Not discussed further.
        </div>
      </div>
    </section>
  )
}
