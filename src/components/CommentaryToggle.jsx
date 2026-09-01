export default function CommentaryToggle({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={active ? "Disable developer commentary" : "Enable developer commentary"}
      className="pointer-events-auto flex items-center justify-center p-2 transition-opacity hover:opacity-100"
      style={{
        color: active ? "var(--signal-amber)" : "var(--concrete-gray)",
        background: "none",
        border: "none",
        cursor: "pointer",
        opacity: 0.7,
      }}
      title="Developer Commentary"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="10" r="0.5" fill="currentColor" />
        <circle cx="8" cy="10" r="0.5" fill="currentColor" />
        <circle cx="16" cy="10" r="0.5" fill="currentColor" />
      </svg>
    </button>
  )
}
