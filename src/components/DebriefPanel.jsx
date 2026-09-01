import { useState, useEffect } from "react"
import { getSubjectNumber } from "../lib/subjectNumber"

// ─── Stat definitions ─────────────────────────────────────────────────────────
// Each stat maps an interaction count range to a facility-voice label.
function classifyRating(count) {
  if (count === 0) return "NON-PARTICIPANT"
  if (count < 3) return "ADEQUATE"
  if (count < 8) return "SATISFACTORY"
  if (count < 15) return "EXEMPLARY"
  return "PORTAL-ENRICHED"
}

function classifyCompliance(easterEggsFound) {
  if (easterEggsFound === 0) return "STANDARD"
  if (easterEggsFound < 3) return "CURIOUS"
  return "UNAUTHORIZED"
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DebriefPanel({
  interactionCount = 0,
  easterEggsFound = 0,
}) {
  const [revealed, setRevealed] = useState(false)
  const [subjectNum] = useState(() => getSubjectNumber())

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300)
    return () => clearTimeout(t)
  }, [])

  const rating = classifyRating(interactionCount)
  const compliance = classifyCompliance(easterEggsFound)

  const stats = [
    ["PORTALS OPENED", String(interactionCount)],
    ["SUBJECT RATING", rating],
    [
      "MATERIALS TESTED",
      interactionCount > 2
        ? "2 OF 3"
        : interactionCount > 0
          ? "1 OF 3"
          : "0 OF 3",
    ],
    ["ANOMALIES DETECTED", `${Math.min(easterEggsFound, 5)} OF 5`],
    ["COMPLIANCE LEVEL", compliance],
    ["EXIT CLEARANCE", "GRANTED"],
  ]

  return (
    <div
      className="w-full max-w-lg mx-auto"
      style={{
        fontFamily: "var(--font-mono)",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Header */}
      <div
        className="text-xs mb-3 tracking-widest text-center"
        style={{ color: "var(--concrete-gray)" }}
      >
        ═══ POST-TEST DEBRIEF ═══
      </div>

      {/* Subject ID */}
      <div
        className="text-center mb-6 text-sm tracking-widest"
        style={{
          color: "var(--facility-white)",
          fontFamily: "var(--font-mono)",
          opacity: revealed ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s",
        }}
      >
        Subject #{subjectNum} — testing complete.
      </div>

      {/* Stats grid */}
      <div
        className="p-6"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "rgba(10,10,12,0.6)",
        }}
      >
        {stats.map(([label, value], i) => (
          <div
            key={label}
            className="flex justify-between items-center py-2.5"
            style={{
              borderBottom:
                i < stats.length - 1
                  ? "1px solid var(--border-subtle)"
                  : "none",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateX(0)" : "translateX(-8px)",
              transition: `opacity 0.4s ease ${0.1 + i * 0.08}s, transform 0.4s ease ${0.1 + i * 0.08}s`,
            }}
          >
            <span
              className="text-xs tracking-wider"
              style={{ color: "var(--concrete-gray)" }}
            >
              {label}
            </span>
            <span
              className="text-xs font-bold tabular-nums"
              style={{
                color:
                  value === "GRANTED"
                    ? "var(--portal-blue)"
                    : value === "UNAUTHORIZED"
                      ? "var(--portal-orange)"
                      : "var(--facility-white)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div
        className="mt-4 text-center text-xs"
        style={{
          color: "var(--concrete-gray)",
          opacity: 0.5,
          letterSpacing: "0.08em",
        }}
      >
        THIS RECORD HAS BEEN LOGGED. RETRIEVAL CODE: CZ-{interactionCount}-
        {easterEggsFound}
      </div>
    </div>
  )
}
