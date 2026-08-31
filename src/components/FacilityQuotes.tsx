import { useState, useEffect, useRef } from "react"

const LOG_ENTRIES = [
  {
    id: "LOG-0147",
    date: "CYCLE 7, DAY 312",
    classification: "DECLASSIFIED",
    title: "SUBJECT BOUNCE TRAJECTORY",
    body: "Test subject bounce trajectory exceeded projected parameters by 340%. Ceiling tile replacement requisition submitted. Ceiling has been billed to the testing budget. Subject was asked to rate the experience. Subject declined.",
  },
  {
    id: "LOG-0203",
    date: "CYCLE 9, DAY 48",
    classification: "INTERNAL",
    title: "GEL APPLICATION INCIDENT",
    body: "Propulsion gel applied to floor of Observation Deck 4B by unknown party. Junior researcher Holtzmann attempted to cross the room at approximately 42 km/h. Door frame required medical attention. The gel was supposed to be in Storage 7.",
  },
  {
    id: "LOG-0089",
    date: "CYCLE 3, DAY 801",
    classification: "RESTRICTED",
    title: "PORTAL DEVICE CALIBRATION",
    body: "Handheld Portal Device firmware update resulted in the device rendering shortbread cookies instead of functioning. Engineering has been told to stop using the 3D printer for personal projects. Cookies were acceptable.",
  },
  {
    id: "LOG-0312",
    date: "CYCLE 12, DAY 15",
    classification: "DECLASSIFIED",
    title: "CAKE PROTOCOL VIOLATION",
    body: "Subject 4791 stopped mid-test to inquire about cake availability. Negotiations continued for 3 hours. Cake was delivered to Testing Chamber 9. Subject completed the test. Cake was not delivered to Subject 4791.",
  },
  {
    id: "LOG-0455",
    date: "CYCLE 15, DAY 203",
    classification: "INTERNAL",
    title: "MORALE ENRICHMENT UPDATE",
    body: "Morale enrichment committee has approved the installation of motivational posters in all testing corridors. Posters read: 'You are doing great.' and 'The exit is that way.' Third poster has been censored.",
  },
  {
    id: "LOG-0198",
    date: "CYCLE 8, DAY 567",
    classification: "RESTRICTED",
    title: "UNAUTHORIZED PORTAL PAINTING",
    body: "Someone has painted blue and orange ellipses on the walls of the cafeteria. They are not functional portals. Several staff members attempted to walk through them. IT has requested that this incident not be mentioned in the quarterly report.",
  },
]

export default function FacilityQuotes() {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<number>(0)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LOG_ENTRIES.length)
    }, 6000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const entry = LOG_ENTRIES[activeIndex]

  return (
    <section
      id="chamber-05"
      className="chamber-section"
      style={{ background: "rgba(8, 8, 12, 0.98)", position: "relative" }}
    >
      {/* Ambient amber wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 60% 50%, rgba(217,164,65,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="mb-16">
        <div
          className="text-xs mb-3 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          FACILITY RECORDS
        </div>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          TEST
          <br />
          OBSERVATIONS
        </h2>
        <p
          className="max-w-xl text-base leading-relaxed"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Selected excerpts from the Aperture Science test observation archive.
          All entries have been reviewed and approved by the Enrichment Center
          ethics committee. The ethics committee has also been reviewed.
        </p>
      </div>

      {/* Log display */}
      <div className="max-w-3xl">
        {/* Navigation tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {LOG_ENTRIES.map((log, i) => (
            <button
              key={log.id}
              onClick={() => {
                setActiveIndex(i)
                clearInterval(intervalRef.current)
              }}
              className="px-3 py-1.5 text-xs tracking-widest transition-all duration-150"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  i === activeIndex
                    ? "var(--portal-blue)"
                    : "var(--concrete-gray)",
                background:
                  i === activeIndex ? "rgba(30,144,255,0.08)" : "transparent",
                border: `1px solid ${
                  i === activeIndex
                    ? "var(--portal-blue)"
                    : "var(--border-subtle)"
                }`,
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
              onMouseEnter={(e) => {
                if (i !== activeIndex) {
                  e.currentTarget.style.borderColor = "var(--border-mid)"
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                }
              }}
              onMouseLeave={(e) => {
                if (i !== activeIndex) {
                  e.currentTarget.style.borderColor = "var(--border-subtle)"
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              {log.id}
            </button>
          ))}
        </div>

        {/* Active log entry */}
        <div
          className="p-6 md:p-8 transition-opacity duration-300"
          style={{
            background: "rgba(10,10,12,0.6)",
            border: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span
                className="text-xs tracking-widest"
                style={{ color: "var(--portal-blue)" }}
              >
                {entry.id}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--concrete-gray)", opacity: 0.4 }}
              >
                |
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--concrete-gray)" }}
              >
                {entry.date}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5"
              style={{
                color:
                  entry.classification === "DECLASSIFIED"
                    ? "var(--portal-orange)"
                    : "var(--concrete-gray)",
                border: `1px solid ${
                  entry.classification === "DECLASSIFIED"
                    ? "var(--portal-orange)"
                    : "var(--border-subtle)"
                }`,
                letterSpacing: "0.1em",
              }}
            >
              {entry.classification}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold mb-4 tracking-wider"
            style={{
              color: "var(--facility-white)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.08em",
            }}
          >
            {entry.title}
          </h3>

          {/* Body */}
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
              lineHeight: "1.8",
            }}
          >
            {entry.body}
          </p>

          {/* Redaction mark */}
          <div
            className="mt-4 text-xs"
            style={{ color: "var(--concrete-gray)", opacity: 0.3 }}
          >
            ═══ END OF EXCERPT ═══
          </div>
        </div>
      </div>
    </section>
  )
}
