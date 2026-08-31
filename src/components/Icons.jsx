const ICON_STROKE = 1.5

export function ArrowChevron({
  size = 16,
  color = "currentColor",
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <polyline points="5,3 10,8 5,13" />
    </svg>
  )
}

export function ScrollChevron({
  size = 12,
  color = "currentColor",
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 12 18"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      style={{ display: "block" }}
    >
      <polyline points="2,4 6,10 10,4" />
      <line x1="6" y1="10" x2="6" y2="16" />
    </svg>
  )
}

export function StatusDot({
  size = 8,
  color = "currentColor",
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <circle
        cx="5"
        cy="5"
        r="4"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
      />
      <circle cx="5" cy="5" r="1.8" fill={color} />
    </svg>
  )
}

export function ApertureMenu({
  size = 24,
  color = "currentColor",
  open = false,
  className = "",
}) {
  if (open) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={ICON_STROKE}
        strokeLinecap="square"
        className={className}
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={ICON_STROKE}
      strokeLinecap="square"
      className={className}
    >
      {/* Iris-style aperture segments */}
      <path d="M12,3 L14,8 L12,7 L10,8 Z" />
      <path d="M21,12 L16,14 L17,12 L16,10 Z" />
      <path d="M12,21 L10,16 L12,17 L14,16 Z" />
      <path d="M3,12 L8,10 L7,12 L8,14 Z" />
    </svg>
  )
}
