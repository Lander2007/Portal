import { useRef, useEffect, useState } from "react"

const PORTAL_BLUE = "#1E90FF"
const PORTAL_ORANGE = "#FF7A1A"

function PortalDiagram({ animated = true }) {
  const [phase, setPhase] = useState(0) // 0=entry, 1=transit, 2=exit
  const timerRef = useRef(null)

  useEffect(() => {
    if (!animated) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reduced) {
      setPhase(2)
      return
    }

    const cycle = () => {
      setPhase(0)
      timerRef.current = setTimeout(() => {
        setPhase(1)
        timerRef.current = setTimeout(() => {
          setPhase(2)
          timerRef.current = setTimeout(cycle, 1800)
        }, 700)
      }, 1400)
    }
    cycle()
    return () => clearTimeout(timerRef.current)
  }, [animated])

  return (
    <svg
      viewBox="0 0 480 200"
      className="w-full"
      style={{ maxHeight: "200px" }}
      aria-label="Diagram showing an object entering a blue portal on the left and exiting from an orange portal on the right"
    >
      {/* Wall left */}
      <rect x="60" y="20" width="8" height="160" fill="#1A1A1E" />
      {/* Wall right */}
      <rect x="412" y="20" width="8" height="160" fill="#1A1A1E" />

      {/* Blue portal on left wall */}
      <ellipse
        cx="68"
        cy="100"
        rx="10"
        ry="48"
        fill={PORTAL_BLUE}
        opacity="0.15"
      />
      <ellipse
        cx="68"
        cy="100"
        rx="10"
        ry="48"
        fill="none"
        stroke={PORTAL_BLUE}
        strokeWidth="3"
      />
      <ellipse
        cx="68"
        cy="100"
        rx="6"
        ry="38"
        fill="none"
        stroke={PORTAL_BLUE}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <text
        x="68"
        y="166"
        textAnchor="middle"
        fill={PORTAL_BLUE}
        fontSize="9"
        fontFamily="monospace"
      >
        BLUE
      </text>

      {/* Orange portal on right wall */}
      <ellipse
        cx="412"
        cy="100"
        rx="10"
        ry="48"
        fill={PORTAL_ORANGE}
        opacity="0.15"
      />
      <ellipse
        cx="412"
        cy="100"
        rx="10"
        ry="48"
        fill="none"
        stroke={PORTAL_ORANGE}
        strokeWidth="3"
      />
      <ellipse
        cx="412"
        cy="100"
        rx="6"
        ry="38"
        fill="none"
        stroke={PORTAL_ORANGE}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <text
        x="412"
        y="166"
        textAnchor="middle"
        fill={PORTAL_ORANGE}
        fontSize="9"
        fontFamily="monospace"
      >
        ORANGE
      </text>

      {/* Connection line (dashed) */}
      <line
        x1="78"
        y1="100"
        x2="402"
        y2="100"
        stroke="#333340"
        strokeWidth="1"
        strokeDasharray="6 4"
      />

      {/* Object */}
      {phase === 0 && (
        <g>
          <rect x="100" y="88" width="24" height="24" rx="3" fill="#F2F2EF" />
          <text
            x="112"
            y="104"
            textAnchor="middle"
            fill="#0A0A0C"
            fontSize="11"
            fontFamily="monospace"
          >
            □
          </text>
          {/* Velocity arrow */}
          <line
            x1="130"
            y1="100"
            x2="148"
            y2="100"
            stroke="white"
            strokeWidth="1.5"
          />
          <polygon points="148,96 155,100 148,104" fill="white" />
        </g>
      )}
      {phase === 1 && (
        <g>
          {/* Flash at portal entry */}
          <ellipse
            cx="68"
            cy="100"
            rx="14"
            ry="52"
            fill={PORTAL_BLUE}
            opacity="0.35"
          />
          <text
            x="240"
            y="108"
            textAnchor="middle"
            fill="rgba(242,242,239,0.3)"
            fontSize="10"
            fontFamily="monospace"
          >
            IN TRANSIT
          </text>
        </g>
      )}
      {phase === 2 && (
        <g>
          {/* Object exits orange portal */}
          <rect x="356" y="88" width="24" height="24" rx="3" fill="#F2F2EF" />
          {/* Velocity arrow */}
          <line
            x1="382"
            y1="100"
            x2="398"
            y2="100"
            stroke="white"
            strokeWidth="1.5"
          />
          <polygon points="398,96 405,100 398,104" fill="white" />
          {/* Exit flash */}
          <ellipse
            cx="412"
            cy="100"
            rx="14"
            ry="52"
            fill={PORTAL_ORANGE}
            opacity="0.25"
          />
        </g>
      )}

      {/* Momentum label */}
      <text
        x="240"
        y="186"
        textAnchor="middle"
        fill="#8C8C87"
        fontSize="9"
        fontFamily="monospace"
      >
        MOMENTUM PRESERVED
      </text>
    </svg>
  )
}

export default function PortalConcept() {
  return (
    <section
      id="chamber-04"
      className="chamber-section"
      style={{ background: "rgba(14, 14, 20, 0.98)", position: "relative" }}
    >
      {/* Ambient blue wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(15,74,128,0.10) 0%, transparent 70%)",
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
          [04] SCIENCE
        </div>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          HOW PORTALS
          <br />
          WORK
        </h2>
        <p
          className="max-w-xl text-base leading-relaxed"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          This section is mandatory for all new test subjects. Familiarity with
          portal mechanics will not reduce test difficulty. It will, however,
          reduce the number of accidents classified as "unexpected."
        </p>
      </div>

      {/* Core concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--facility-white)",
              letterSpacing: "0.08em",
            }}
          >
            THE FUNDAMENTAL PRINCIPLE
          </h3>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            Two portals — one blue, one orange — form a single, continuous,
            connected surface. When both are open simultaneously, they are
            effectively the same opening in space, regardless of how far apart
            they are physically.
          </p>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            Anything passing through one portal exits immediately from the
            other, preserving its speed, direction, and angular momentum. The
            distance between portals is irrelevant — they do not transmit
            objects; they{" "}
            <em style={{ color: "var(--facility-white)" }}>are</em> the same
            place.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            This has implications. Falling into a floor portal and exiting from
            a wall portal converts downward velocity into horizontal velocity —
            enabling the test subject to "throw" themselves across rooms at high
            speed. This is called "flinging," and is encouraged. The cleanup
            crew has been briefed.
          </p>
        </div>

        <div>
          {/* Diagram */}
          <div
            className="p-4 mb-4"
            style={{
              border: "1px solid var(--border-subtle)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <PortalDiagram animated={true} />
          </div>
          <div
            className="text-xs"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.6,
            }}
          >
            FIG. 3A — OBJECT TRAVERSAL ACROSS LINKED PORTAL PAIR. SPATIAL
            DISPLACEMENT: IRRELEVANT.
          </div>
        </div>
      </div>

      {/* Key properties grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          {
            num: "01",
            title: "LINKED SURFACES",
            body: "Two portals form a single surface. Entering one exits the other — no delay, no speed limit.",
          },
          {
            num: "02",
            title: "MOMENTUM PRESERVED",
            body: "All velocity — horizontal, vertical, angular — transfers unchanged. Physics continues from where it left off.",
          },
          {
            num: "03",
            title: "ORIENTATION MATTERS",
            body: "If a portal faces a different direction than the one entered, the exit direction changes accordingly. Plan ahead.",
          },
        ].map(({ num, title, body }) => (
          <div
            key={num}
            className="p-5"
            style={{
              border: "1px solid var(--border-subtle)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <div
              className="text-xs mb-3 tabular-nums"
              style={{
                color: "var(--concrete-gray)",
                fontFamily: "var(--font-mono)",
                opacity: 0.5,
              }}
            >
              {num}
            </div>
            <div
              className="text-sm font-semibold mb-2 tracking-wider"
              style={{
                color: "var(--facility-white)",
                fontFamily: "var(--font-display)",
              }}
            >
              {title}
            </div>
            <div
              className="text-xs leading-relaxed"
              style={{
                color: "var(--concrete-gray)",
                fontFamily: "var(--font-body)",
              }}
            >
              {body}
            </div>
          </div>
        ))}
      </div>

      {/* Portal pair visual */}
      <div
        className="flex items-center gap-6 p-6"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            style={{
              width: "48px",
              height: "80px",
              borderRadius: "50%",
              border: `3px solid ${PORTAL_BLUE}`,
              boxShadow: `0 0 20px ${PORTAL_BLUE}60, inset 0 0 20px ${PORTAL_BLUE}20`,
              background: "rgba(0,0,8,0.9)",
            }}
          />
          <span
            className="text-xs"
            style={{ color: PORTAL_BLUE, fontFamily: "var(--font-mono)" }}
          >
            ENTRY
          </span>
        </div>
        <div className="flex-1 text-center">
          <div
            className="text-xs mb-1"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ════════ SINGLE SURFACE ════════
          </div>
          <div
            className="text-xs"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.4,
            }}
          >
            physical distance: negligible
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            style={{
              width: "48px",
              height: "80px",
              borderRadius: "50%",
              border: `3px solid ${PORTAL_ORANGE}`,
              boxShadow: `0 0 20px ${PORTAL_ORANGE}60, inset 0 0 20px ${PORTAL_ORANGE}20`,
              background: "rgba(8,4,0,0.9)",
            }}
          />
          <span
            className="text-xs"
            style={{ color: PORTAL_ORANGE, fontFamily: "var(--font-mono)" }}
          >
            EXIT
          </span>
        </div>
      </div>
    </section>
  )
}
