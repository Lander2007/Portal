export default function EnrichmentCenter() {
  return (
    <section
      id="chamber-06"
      className="chamber-section"
      style={{ background: "var(--void-black)", position: "relative" }}
    >
      {/* Ambient cyan wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 40% 50%, rgba(58,166,166,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div
            className="text-xs mb-3 tracking-widest"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
            }}
          >
            [06] THE FACILITY
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--facility-white)",
              letterSpacing: "0.04em",
            }}
          >
            THE ENRICHMENT
            <br />
            CENTER
          </h2>
          <p
            className="max-w-xl text-base leading-relaxed mb-12"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-body)",
            }}
          >
            The Aperture Science Enrichment Center is a facility dedicated to
            the betterment of humanity through rigorous scientific testing. All
            testing is voluntary. All participation is mandatory.
          </p>
        </div>

        {/* Blueprint SVG */}
        <div
          className="mb-12 p-6"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="text-xs mb-4 tracking-widest"
            style={{
              color: "var(--concrete-gray)",
              fontFamily: "var(--font-mono)",
              opacity: 0.6,
            }}
          >
            FACILITY LAYOUT — LEVEL B — NOT TO SCALE
          </div>
          <svg
            viewBox="0 0 800 300"
            className="w-full"
            style={{ maxHeight: "300px" }}
            aria-label="Simplified blueprint of the Aperture Science Enrichment Center"
          >
            {/* Grid background */}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`gh${i}`}
                x1={0}
                y1={i * 15}
                x2={800}
                y2={i * 15}
                stroke="#1E90FF"
                strokeWidth="0.3"
                opacity="0.1"
              />
            ))}
            {Array.from({ length: 54 }).map((_, i) => (
              <line
                key={`gv${i}`}
                x1={i * 15}
                y1={0}
                x2={i * 15}
                y2={300}
                stroke="#1E90FF"
                strokeWidth="0.3"
                opacity="0.1"
              />
            ))}

            {/* Main corridors */}
            <rect
              x="40"
              y="60"
              width="160"
              height="180"
              fill="none"
              stroke="#1E90FF"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x="120"
              y="155"
              textAnchor="middle"
              fill="#1E90FF"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.7"
            >
              TEST CHAMBERS
            </text>

            <rect
              x="220"
              y="90"
              width="120"
              height="120"
              fill="none"
              stroke="#FF7A1A"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x="280"
              y="155"
              textAnchor="middle"
              fill="#FF7A1A"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.7"
            >
              CENTRAL HUB
            </text>

            <rect
              x="360"
              y="60"
              width="100"
              height="180"
              fill="none"
              stroke="#1E90FF"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x="410"
              y="155"
              textAnchor="middle"
              fill="#1E90FF"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.7"
            >
              GEL LABS
            </text>

            <rect
              x="480"
              y="100"
              width="140"
              height="100"
              fill="none"
              stroke="#1E90FF"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x="550"
              y="155"
              textAnchor="middle"
              fill="#1E90FF"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.7"
            >
              OBSERVATION
            </text>

            <rect
              x="640"
              y="60"
              width="120"
              height="180"
              fill="none"
              stroke="#FF7A1A"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text
              x="700"
              y="155"
              textAnchor="middle"
              fill="#FF7A1A"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.7"
            >
              EXIT CORRIDOR
            </text>

            {/* Connecting corridors */}
            <line
              x1="200"
              y1="150"
              x2="220"
              y2="150"
              stroke="#1E90FF"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="340"
              y1="150"
              x2="360"
              y2="150"
              stroke="#1E90FF"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="460"
              y1="150"
              x2="480"
              y2="150"
              stroke="#1E90FF"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="620"
              y1="150"
              x2="640"
              y2="150"
              stroke="#1E90FF"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Portal indicators */}
            <ellipse
              cx="210"
              cy="150"
              rx="4"
              ry="12"
              fill="#1E90FF"
              opacity="0.8"
            />
            <ellipse
              cx="630"
              cy="150"
              rx="4"
              ry="12"
              fill="#FF7A1A"
              opacity="0.8"
            />

            {/* Legend */}
            <rect
              x="40"
              y="260"
              width="8"
              height="8"
              fill="none"
              stroke="#1E90FF"
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x="54"
              y="268"
              fill="#8C8C87"
              fontSize="8"
              fontFamily="monospace"
            >
              TEST AREA
            </text>
            <rect
              x="160"
              y="260"
              width="8"
              height="8"
              fill="none"
              stroke="#FF7A1A"
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x="174"
              y="268"
              fill="#8C8C87"
              fontSize="8"
              fontFamily="monospace"
            >
              RESTRICTED
            </text>
            <ellipse
              cx="290"
              cy="264"
              rx="3"
              ry="8"
              fill="#1E90FF"
              opacity="0.8"
            />
            <text
              x="298"
              y="268"
              fill="#8C8C87"
              fontSize="8"
              fontFamily="monospace"
            >
              PORTAL SITE
            </text>
          </svg>
        </div>

        {/* Lore entries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "CONSTRUCTION",
              body: "Founded in 1947 as a shower curtain manufacturer, Aperture Science pivoted to handheld quantum tunneling devices after a corporate restructuring that nobody questioned.",
            },
            {
              title: "FACILITY SCALE",
              body: "The Enrichment Center extends approximately 4.2 kilometers below the surface of Michigan. The exact depth is classified because the measurement device was lost in Testing Chamber 14.",
            },
            {
              title: "STAFFING",
              body: "Current staffing levels are sufficient for all testing operations. This message is generated automatically every cycle. No human has verified it in 11 years.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5"
              style={{
                border: "1px solid var(--border-subtle)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div
                className="text-xs mb-3 tracking-wider"
                style={{
                  color: "var(--portal-orange)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                }}
              >
                {item.title}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{
                  color: "var(--concrete-gray)",
                  fontFamily: "var(--font-body)",
                  lineHeight: "1.7",
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
