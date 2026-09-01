import { useEffect, useRef, useState } from "react"

const IDLE_TIMEOUT = 100000 // ~100 seconds
const FADE_DURATION = 3000 // 3 second fade

export default function IdleDimmer({ active = true }) {
  const [dimmed, setDimmed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const resetTimer = () => {
      setDimmed(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setDimmed(true), IDLE_TIMEOUT)
    }

    const events = [
      "mousemove",
      "mousedown",
      "scroll",
      "keydown",
      "touchstart",
    ]
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true }),
    )
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Dim overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          background: "rgba(0, 0, 0, 0.55)",
          opacity: dimmed ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease`,
        }}
      />

      {/* Facility message */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
        style={{
          opacity: dimmed ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease`,
        }}
      >
        <div
          className="text-center px-8"
          style={{
            fontFamily: "var(--font-mono)",
          }}
        >
          <div
            className="text-xs tracking-widest mb-3"
            style={{ color: "var(--signal-amber)" }}
          >
            NOTICE
          </div>
          <div
            className="text-sm leading-relaxed"
            style={{
              color: "var(--concrete-gray)",
              maxWidth: "320px",
            }}
          >
            Power conservation mode engaged.
            <br />
            Please resume testing.
          </div>
          <div
            className="mt-4 text-xs"
            style={{
              color: "var(--concrete-gray)",
              opacity: 0.4,
            }}
          >
            [MOVE MOUSE OR PRESS ANY KEY]
          </div>
        </div>
      </div>
    </>
  )
}
