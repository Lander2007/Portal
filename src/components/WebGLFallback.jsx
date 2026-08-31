import { Component } from "react"

// Static SVG illustration of the ASHPD for no-WebGL environments
export function DeviceSVGFallback() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="w-full"
      style={{ maxWidth: "480px", opacity: 0.85 }}
      aria-label="Aperture Science Handheld Portal Device illustration"
    >
      {/* Main body oval */}
      <ellipse
        cx="270"
        cy="110"
        rx="90"
        ry="60"
        fill="#1A1A1E"
        stroke="#2A2A2E"
        strokeWidth="1.5"
      />
      {/* Shell highlight */}
      <ellipse
        cx="255"
        cy="88"
        rx="55"
        ry="28"
        fill="none"
        stroke="#E8E8E5"
        strokeWidth="0.5"
        opacity="0.15"
      />

      {/* Core tube */}
      <rect
        x="148"
        y="101"
        width="90"
        height="18"
        rx="9"
        fill="#0A1A2E"
        stroke="#1E90FF"
        strokeWidth="1.5"
      />
      <rect
        x="150"
        y="103"
        width="86"
        height="14"
        rx="7"
        fill="#1E90FF"
        opacity="0.25"
      />
      {/* Core glow */}
      <rect
        x="152"
        y="105"
        width="82"
        height="10"
        rx="5"
        fill="#2FA8FF"
        opacity="0.6"
      />

      {/* Wedge shell */}
      <path
        d="M148 80 Q130 100 130 120 Q140 135 158 130 L162 100 Z"
        fill="#1A1A1E"
        stroke="#2A2A2E"
        strokeWidth="1"
      />

      {/* Barrel ring 1 */}
      <ellipse
        cx="118"
        cy="110"
        rx="28"
        ry="22"
        fill="#111114"
        stroke="#1E1E22"
        strokeWidth="1.5"
      />
      {/* Barrel ring 2 */}
      <ellipse
        cx="90"
        cy="110"
        rx="22"
        ry="17"
        fill="#0D0D10"
        stroke="#1A1A1E"
        strokeWidth="1.5"
      />
      {/* Barrel ring 3 */}
      <ellipse
        cx="67"
        cy="110"
        rx="17"
        ry="13"
        fill="#0A0A0C"
        stroke="#151518"
        strokeWidth="1.5"
      />
      {/* Emitter tip */}
      <ellipse
        cx="48"
        cy="110"
        rx="13"
        ry="10"
        fill="#050508"
        stroke="#151518"
        strokeWidth="1"
      />
      {/* Emitter ring glow */}
      <ellipse
        cx="40"
        cy="110"
        rx="8"
        ry="9"
        fill="none"
        stroke="#1E90FF"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <ellipse cx="40" cy="110" rx="5" ry="6" fill="#1E90FF" opacity="0.2" />

      {/* Aperture emblem on wedge */}
      <circle
        cx="140"
        cy="90"
        r="10"
        fill="none"
        stroke="#C0C0BC"
        strokeWidth="1"
        opacity="0.5"
      />
      <circle
        cx="140"
        cy="90"
        r="6"
        fill="none"
        stroke="#C0C0BC"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <circle
        cx="140"
        cy="90"
        r="3"
        fill="none"
        stroke="#C0C0BC"
        strokeWidth="0.6"
        opacity="0.3"
      />
      <circle cx="140" cy="90" r="1.2" fill="#C0C0BC" opacity="0.4" />

      {/* Catcher arm — front top */}
      <line
        x1="120"
        y1="95"
        x2="95"
        y2="68"
        stroke="#111114"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="95"
        y1="68"
        x2="80"
        y2="55"
        stroke="#0D0D10"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Catcher arm — front bottom */}
      <line
        x1="120"
        y1="125"
        x2="95"
        y2="152"
        stroke="#111114"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="95"
        y1="152"
        x2="80"
        y2="165"
        stroke="#0D0D10"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Catcher arm — rear top */}
      <line
        x1="290"
        y1="68"
        x2="316"
        y2="52"
        stroke="#111114"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="316"
        y1="52"
        x2="330"
        y2="42"
        stroke="#0D0D10"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Catcher arm — rear bottom */}
      <line
        x1="290"
        y1="152"
        x2="316"
        y2="168"
        stroke="#111114"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="316"
        y1="168"
        x2="330"
        y2="178"
        stroke="#0D0D10"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Cables */}
      <path
        d="M115 92 Q155 60 240 68 Q280 72 300 72"
        fill="none"
        stroke="#0A0A0C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M118 90 Q160 55 245 64 Q282 68 302 70"
        fill="none"
        stroke="#151518"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M122 88 Q175 50 255 58 Q285 62 305 65"
        fill="none"
        stroke="#0D0D10"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Indicator light */}
      <circle cx="252" cy="68" r="4" fill="#1E90FF" opacity="0.9" />
      <circle
        cx="252"
        cy="68"
        r="7"
        fill="none"
        stroke="#1E90FF"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Vent slits on rear */}
      <line
        x1="340"
        y1="98"
        x2="340"
        y2="122"
        stroke="#0A0A0C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="348"
        y1="94"
        x2="348"
        y2="126"
        stroke="#0A0A0C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="355"
        y1="98"
        x2="355"
        y2="122"
        stroke="#0A0A0C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center"
          style={{ background: "transparent" }}
        >
          <DeviceSVGFallback />
          <div
            className="mt-6 text-xs text-center"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.5,
            }}
          >
            DEVICE RENDER — STATIC MODE
            <br />
            WebGL unavailable in this environment
          </div>
          <div
            className="mt-4 text-xs text-center"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.4,
              fontSize: "10px",
            }}
          >
            LEFT-CLICK: BLUE · RIGHT-CLICK: ORANGE · DRAG: ROTATE
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
