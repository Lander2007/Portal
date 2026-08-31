import { CAKE_LINES } from "../lib/easterEggs"
import { ArrowChevron } from "./Icons"

interface TestCompleteProps {
  interactionCount: number
  onInteraction: () => void
}

export default function TestComplete({
  interactionCount,
  onInteraction,
}: TestCompleteProps) {
  const rating =
    interactionCount === 0
      ? "NON-PARTICIPANT"
      : interactionCount < 3
        ? "ADEQUATE"
        : interactionCount < 8
          ? "SATISFACTORY"
          : interactionCount < 15
            ? "EXEMPLARY"
            : "PORTAL-ENRICHED"

  return (
    <section
      id="chamber-06"
      className="chamber-section flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "100vh",
        background: "var(--void-black)",
        position: "relative",
      }}
    >
      {/* Ambient orange wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(140,67,16,0.07) 0%, transparent 70%)",
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

      <div className="relative z-10 max-w-2xl">
        {/* Status line */}
        <div
          className="text-xs mb-8 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          TEST SEQUENCE CONCLUDED
          <span className="ml-4" style={{ color: "var(--portal-blue)" }}>
            ◉ DEBRIEF
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-bold mb-6 leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 10vw, 100px)",
            color: "var(--facility-white)",
            letterSpacing: "0.02em",
            lineHeight: 0.92,
          }}
        >
          TEST
          <br />
          <span style={{ color: "var(--concrete-gray)" }}>COMPLETE</span>
        </h2>

        {/* Test summary */}
        <div
          className="mt-8 mb-10 p-6 mx-auto max-w-md text-left"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "rgba(10,10,12,0.6)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div
            className="text-xs mb-4 tracking-widest"
            style={{ color: "var(--portal-blue)" }}
          >
            POST-TEST DEBRIEF
          </div>
          {[
            ["TESTS PERFORMED", String(interactionCount)],
            ["SUBJECT RATING", rating],
            ["CAKE STATUS", "PENDING"],
            ["EXIT CLEARANCE", "GRANTED"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between py-2 text-xs"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span style={{ color: "var(--concrete-gray)" }}>{label}</span>
              <span
                style={{
                  color:
                    value === "GRANTED"
                      ? "var(--portal-blue)"
                      : value === "PENDING"
                        ? "var(--portal-orange)"
                        : "var(--facility-white)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mb-8 text-sm"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Your test results have been logged. The Enrichment Center thanks you
          for your participation. You may now proceed to the cake distribution
          area.
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href="#chamber-00"
            className="cta-primary relative inline-flex items-center gap-2 px-6 py-3 text-sm tracking-widest no-underline"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--portal-blue)",
              border: "1px solid var(--portal-blue)",
              letterSpacing: "0.12em",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background =
                "rgba(30,144,255,0.08)"
              ;(e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 20px rgba(30,144,255,0.2)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
            }}
            onClick={onInteraction}
          >
            RETURN TO CHAMBER
            <span
              className="cta-arrow"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <ArrowChevron size={14} color="var(--portal-blue)" />
            </span>
          </a>
        </div>

        {/* Footer */}
        <footer
          className="mt-20 pt-8"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--concrete-gray)",
              }}
            >
              {CAKE_LINES.map((line: string, i: number) => (
                <div
                  key={i}
                  style={{ opacity: i === 0 ? 0.8 : 0.5, marginBottom: "2px" }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--concrete-gray)",
                opacity: 0.4,
                textAlign: "right",
              }}
            >
              <div>CHAMBER ZERO — FAN TRIBUTE</div>
              <div>APERTURE SCIENCE IS A FICTIONAL ENTITY</div>
              <div>PORTAL™ IS A TRADEMARK OF VALVE CORPORATION</div>
              <div>THIS PROJECT CLAIMS NO AFFILIATION</div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
