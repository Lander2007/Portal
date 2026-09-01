import { useState } from "react"

export default function CommentaryNode({ note, position = "right" }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute z-20" style={{ ...positionStyle(position) }}>
      {/* Node button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Read developer commentary"
        className="relative flex items-center justify-center"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1px solid var(--signal-amber)",
          background: open
            ? "rgba(217,164,65,0.15)"
            : "rgba(10,10,12,0.8)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: open
            ? "0 0 16px rgba(217,164,65,0.3)"
            : "none",
          backdropFilter: "blur(8px)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--signal-amber)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {/* Commentary panel */}
      {open && (
        <div
          className="absolute"
          style={{
            ...(position === "left"
              ? { right: "36px" }
              : { left: "36px" }),
            top: "-8px",
            width: "260px",
            padding: "14px 16px",
            background: "rgba(10,10,12,0.96)",
            border: "1px solid var(--signal-amber)",
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            lineHeight: "1.6",
            color: "var(--facility-white)",
            boxShadow: "0 0 30px rgba(217,164,65,0.15)",
            backdropFilter: "blur(12px)",
            zIndex: 30,
          }}
        >
          <div
            className="mb-2 text-xs tracking-widest"
            style={{
              color: "var(--signal-amber)",
              fontFamily: "var(--font-mono)",
            }}
          >
            DEVELOPER NOTE
          </div>
          <div style={{ color: "var(--concrete-gray)" }}>{note}</div>
        </div>
      )}
    </div>
  )
}

function positionStyle(position) {
  switch (position) {
    case "left":
      return { left: "16px", top: "50%" }
    case "right":
      return { right: "16px", top: "50%" }
    case "top-right":
      return { right: "16px", top: "16px" }
    case "bottom-right":
      return { right: "16px", bottom: "16px" }
    default:
      return { right: "16px", top: "50%" }
  }
}
