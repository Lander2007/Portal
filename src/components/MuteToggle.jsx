import { useState, useEffect } from "react"
import { getMuted, toggleMute, startAmbient } from "../lib/audioManager"

function SpeakerIcon({ muted, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? (
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  )
}

export default function MuteToggle() {
  const [muted, setMuted] = useState(() => getMuted())

  useEffect(() => {
    // Start ambient on first user interaction if unmuted
    if (!muted) {
      const start = () => {
        startAmbient()
        window.removeEventListener("click", start)
        window.removeEventListener("keydown", start)
      }
      window.addEventListener("click", start)
      window.addEventListener("keydown", start)
      return () => {
        window.removeEventListener("click", start)
        window.removeEventListener("keydown", start)
      }
    }
  }, [muted])

  const handleToggle = () => {
    const newMuted = toggleMute()
    setMuted(newMuted)
    if (!newMuted) {
      startAmbient()
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      className="pointer-events-auto flex items-center justify-center p-2 transition-opacity hover:opacity-100"
      style={{
        color: "var(--concrete-gray)",
        background: "none",
        border: "none",
        cursor: "pointer",
        opacity: 0.7,
      }}
    >
      <SpeakerIcon muted={muted} size={18} />
    </button>
  )
}
