import { useEffect, useRef, useState } from "react"
import { ApertureMenu } from "./Icons"
import MuteToggle from "./MuteToggle"
import CommentaryToggle from "./CommentaryToggle"
import { CHAMBERS, MAX_CHAMBER } from "../lib/chambers"

export default function Nav({
  scrollProgress = 0,
  currentChamber = "00",
  commentaryMode = false,
  onCommentaryToggle,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <>
      {/* Desktop nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none"
        style={{
          fontFamily: "var(--font-mono)",
          background:
            "linear-gradient(90deg, rgba(15,74,128,0.05), transparent 40%, transparent 60%, rgba(140,67,16,0.04))",
        }}
      >
        {/* Chamber readout */}
        <div
          className="pointer-events-auto flex items-center gap-3"
          style={{ color: "var(--facility-white)" }}
        >
          <span
            style={{
              color: "var(--concrete-gray)",
              fontSize: "10px",
              letterSpacing: "0.15em",
            }}
          >
            CHAMBER
          </span>
          <span
            className="text-2xl font-bold tabular-nums"
            style={{
              color: "var(--facility-white)",
              transition: reduced ? "none" : "all 0.4s ease",
              textShadow: `0 0 20px rgba(30, 144, 255, 0.4)`,
            }}
          >
            {currentChamber}
          </span>
          <span
            style={{
              color: "var(--concrete-gray)",
              fontSize: "10px",
              letterSpacing: "0.08em",
            }}
          >
            / {MAX_CHAMBER}
          </span>
        </div>

        {/* Gradient divider line */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[1px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, var(--portal-blue), var(--portal-orange))",
            opacity: 0.5,
          }}
        >
          <div
            className="h-full"
            style={{
              width: `${scrollProgress * 100}%`,
              background: `linear-gradient(90deg, var(--portal-blue), var(--portal-orange))`,
              transition: reduced ? "none" : "width 0.1s linear",
              boxShadow: "0 0 6px var(--portal-blue)",
            }}
          />
        </div>

        {/* Controls: Commentary + Mute + Menu */}
        <div className="pointer-events-auto flex items-center gap-3">
          <CommentaryToggle
            active={commentaryMode}
            onToggle={onCommentaryToggle}
          />
          <MuteToggle />
          <button
            className="flex items-center p-2 group"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
            style={{ color: "var(--facility-white)" }}
          >
            <ApertureMenu
              size={22}
              color="var(--facility-white)"
              open={menuOpen}
            />
          </button>
        </div>
      </nav>

      {/* Dropdown panel */}
      <div
        className="fixed top-0 right-0 z-40 overflow-hidden"
        style={{
          width: menuOpen ? "280px" : "0",
          height: "100vh",
          background: "rgba(10, 10, 12, 0.97)",
          borderLeft: "1px solid var(--border-subtle)",
          transition: reduced
            ? "none"
            : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="flex flex-col justify-center h-full px-8"
          style={{
            opacity: menuOpen ? 1 : 0,
            transition: reduced ? "none" : "opacity 0.2s ease 0.1s",
          }}
        >
          <div
            className="text-xs mb-8 tracking-widest"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
            }}
          >
            APERTURE FACILITY — TEST CHAMBERS
          </div>
          {CHAMBERS.map((c) => (
            <a
              key={c.id}
              href={c.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-baseline gap-4 py-3 border-b group transition-all duration-150"
              style={{
                borderColor: "var(--border-subtle)",
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                borderLeft: "2px solid transparent",
                paddingLeft: "12px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = "var(--portal-blue)"
                e.currentTarget.style.background = "rgba(255,255,255,0.02)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = "transparent"
                e.currentTarget.style.background = "transparent"
              }}
            >
              <span
                className="text-xs tabular-nums"
                style={{
                  color: "var(--concrete-gray)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                [{c.id}]
              </span>
              <span
                className="text-lg font-semibold tracking-wider group-hover:text-white"
                style={{
                  color:
                    c.id === currentChamber
                      ? "var(--facility-white)"
                      : "var(--concrete-gray)",
                  transition: "color 0.2s",
                  letterSpacing: "0.1em",
                }}
              >
                {c.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Mobile bottom status bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 md:hidden"
        style={{
          background: "rgba(10, 10, 12, 0.95)",
          borderTop: "1px solid transparent",
          borderImage:
            "linear-gradient(90deg, var(--portal-blue), var(--portal-orange)) 1",
          fontFamily: "var(--font-mono)",
          backdropFilter: "blur(20px)",
        }}
      >
        <span className="text-xs" style={{ color: "var(--concrete-gray)" }}>
          CHAMBER
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: "var(--facility-white)" }}
        >
          [{currentChamber}]{" "}
          {CHAMBERS.find((c) => c.id === currentChamber)?.label}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{ color: "var(--concrete-gray)" }}
        >
          {Math.round(scrollProgress * 100)}%
        </span>
      </div>

      {/* Backdrop when menu open */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMenuOpen(false)}
          style={{ background: "rgba(0,0,0,0.5)" }}
        />
      )}
    </>
  )
}
