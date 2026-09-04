import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Nav from "./components/Nav"
import PortalTransition from "./components/PortalTransition"
import DeviceScene from "./scenes/DeviceScene"
import GelExplainer from "./components/GelExplainer"
import TrainingGrounds from "./components/TrainingGrounds"
import PortalConcept from "./components/PortalConcept"
import HeroPortalCanvas from "./components/HeroPortalCanvas"
import FacilityQuotes from "./components/FacilityQuotes"
import EnrichmentCenter from "./components/EnrichmentCenter"
import TestComplete from "./components/TestComplete"
import IntroChamber from "./scenes/IntroChamber"
import FinalPortalPuzzle from "./components/FinalPortalPuzzle"
import FinalChamberGate from "./components/FinalChamberGate"
import {
  initConsoleBootLog,
  trackScrollReversal,
  initKeySequence,
  KEY_SEQUENCE_COPY,
  CAKE_LINES,
} from "./lib/easterEggs"
import { getSubjectNumber } from "./lib/subjectNumber"
import { getCommentaryLine } from "./lib/commentary"
import {
  playPortalFire,
  playButtonPress,
  playDoorOpen,
  playPortalCrossing,
  playSwitchActivate,
  startAmbient,
} from "./lib/audioManager"
import CustomCursor from "./components/CustomCursor"
import IdleDimmer from "./components/IdleDimmer"
import PortalPeek from "./components/PortalPeek"
import CommentaryNode from "./components/CommentaryNode"
import Vault from "./components/Vault"
import { ArrowChevron, ScrollChevron, StatusDot } from "./components/Icons"
import { CHAMBER_SECTION_IDS, MAX_CHAMBER } from "./lib/chambers"

const PORTAL_BLUE = "#1E90FF"
const PORTAL_ORANGE = "#FF7A1A"

// ─── Achievement toast ────────────────────────────────────────────────────────
function Toast({
  title,
  body,
  visible,
}: {
  title: string
  body: string
  visible: boolean
}) {
  return (
    <div
      className="fixed right-5 z-[200] max-w-xs"
      style={{
        bottom: "80px",
        fontFamily: "var(--font-mono)",
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 24px))",
        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        background: "rgba(10,10,12,0.97)",
        border: "1px solid var(--portal-orange)",
        padding: "12px 16px",
        boxShadow: `0 0 30px rgba(255,122,26,0.2)`,
      }}
    >
      <div
        className="text-xs mb-1 tracking-widest"
        style={{ color: "var(--portal-orange)" }}
      >
        {title}
      </div>
      <div
        className="text-xs leading-relaxed"
        style={{ color: "var(--concrete-gray)", fontSize: "10px" }}
      >
        {body}
      </div>
    </div>
  )
}

// ─── Key sequence modal ───────────────────────────────────────────────────────
function KeySequenceModal({
  lines,
  visible,
  onClose,
  onOpenVault,
}: {
  lines: string[]
  visible: boolean
  onClose: () => void
  onOpenVault?: () => void
}) {
  if (!visible) return null
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full mx-4 p-8"
        style={{
          background: "var(--void-black)",
          border: "1px solid var(--border-mid)",
          fontFamily: "var(--font-mono)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-xs mb-6 tracking-widest"
          style={{ color: "var(--portal-blue)" }}
        >
          UNAUTHORIZED COMMAND SEQUENCE
        </div>
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-sm leading-relaxed"
            style={{
              color: i === 0 ? "var(--facility-white)" : "var(--concrete-gray)",
              marginBottom: "8px",
            }}
          >
            {i > 0 && (
              <span style={{ color: "var(--portal-blue)", marginRight: "8px" }}>
                ›
              </span>
            )}
            {line}
          </div>
        ))}
        <button
          className="mt-8 text-xs tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          [CLOSE TERMINAL]
        </button>
        {/* Hidden trace: a faint signal for the curious. Leads to the Vault. */}
        <div className="mt-6">
          <button
            className="tracking-widest"
            style={{
              color: "var(--concrete-gray)",
              opacity: 0.35,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "9px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1"
              e.currentTarget.style.color = "var(--portal-blue)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.35"
              e.currentTarget.style.color = "var(--concrete-gray)"
            }}
            onClick={onOpenVault}
          >
            ··· signal detected ··· [trace it]
          </button>
        </div>
      </div>
    </div>
  )
}

interface Dot {
  x: number
  y: number
  id: number
}

// ─── Cursor trail on specific element ────────────────────────────────────────
function CursorTrailButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  const [dots, setDots] = useState<Dot[]>([])
  const btnRef = useRef<HTMLAnchorElement>(null)
  let counter = useRef(0)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const id = counter.current++
    setDots((prev) => [...prev.slice(-12), { x: e.clientX, y: e.clientY, id }])
    setTimeout(() => {
      setDots((prev) => prev.filter((d) => d.id !== id))
    }, 500)
  }, [])

  return (
    <a
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      className="cta-primary relative inline-flex items-center gap-2 px-6 py-3 text-sm tracking-widest no-underline"
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--portal-blue)",
        border: "1px solid var(--portal-blue)",
        cursor: "pointer",
        letterSpacing: "0.12em",
      }}
    >
      {children}
      {dots.map((d) => (
        <div
          key={d.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: d.x - 3,
            top: d.y - 3,
            width: 6,
            height: 6,
            background: PORTAL_BLUE,
            opacity: 0.7,
            zIndex: 999,
            animation: "particleFade 0.5s ease forwards",
          }}
        />
      ))}
    </a>
  )
}

// ─── Chamber [00] ENTRY ───────────────────────────────────────────────────────
function ChamberEntry({
  onEnter,
  interactionCount,
  commentaryMode,
}: {
  onEnter: () => void
  interactionCount: number
  commentaryMode: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="chamber-00"
      className="chamber-section relative flex flex-col items-center justify-center select-none"
      style={{ minHeight: "100vh", background: "var(--void-black)", userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Ambient color wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(15,74,128,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(140,67,16,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Portal click canvas — behind text */}
      <HeroPortalCanvas />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Centered hero content */}
      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center">
        {/* Facility ID */}
        <div
          className="text-xs mb-8 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
            animation: loaded
              ? "heroReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards"
              : "none",
            opacity: loaded ? undefined : 0,
          }}
        >
          APERTURE SCIENCE COMPUTER-AIDED ENRICHMENT CENTER
          <span
            className="ml-4 status-dot"
            style={{ color: "var(--portal-blue)" }}
          >
            <StatusDot size={8} color="var(--portal-blue)" />
          </span>
          <span style={{ color: "var(--portal-blue)" }}> SYSTEMS NOMINAL</span>
          <span
            className="ml-4"
            style={{ color: "var(--concrete-gray)", opacity: 0.6 }}
          >
            · SUBJECT #{useMemo(() => getSubjectNumber(), [])}
          </span>
        </div>

        {/* Main title */}
        <div
          className="text-xs mb-3 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
            animation: loaded
              ? "heroReveal 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s forwards"
              : "none",
            opacity: loaded ? undefined : 0,
          }}
        >
          [00] ENTRY
        </div>
        <h1
          className="font-bold mb-2 leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(64px, 14vw, 140px)",
            letterSpacing: "0.02em",
            lineHeight: 0.92,
          }}
        >
          <span
            className="hero-heading-chamber hero-gradient-text"
            style={{
              display: "block",
              animation: loaded
                ? "heroReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards"
                : "none",
              opacity: loaded ? undefined : 0,
            }}
          >
            CHAMBER
          </span>
          <svg
            style={{ display: "block", width: "100%", height: "1em" }}
            viewBox="0 0 400 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="zeroStrokeGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="var(--portal-blue)" />
                <stop offset="100%" stopColor="var(--portal-orange)" />
              </linearGradient>
            </defs>
            <text
              x="200"
              y="82"
              textAnchor="middle"
              fill="none"
              stroke="url(#zeroStrokeGrad)"
              strokeWidth="2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "96px",
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              ZERO
            </text>
          </svg>
        </h1>

        <div
          className="mt-8 mb-10 text-base leading-relaxed max-w-lg"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
            animation: loaded
              ? "heroReveal 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s forwards"
              : "none",
            opacity: loaded ? undefined : 0,
          }}
        >
          Welcome to the Aperture Science enrichment facility. You have been
          selected for participation in a series of tests involving the Aperture
          Science Handheld Portal Device. Please do not be alarmed. The exit is
          clearly marked.
          <br />
          <br />
          <span style={{ color: "var(--facility-white)", fontSize: "0.85em" }}>
            (The exit is not clearly marked.)
          </span>
        </div>

        <div
          className="flex gap-4 flex-wrap justify-center items-center"
          style={{
            animation: loaded
              ? "heroReveal 0.6s cubic-bezier(0.16,1,0.3,1) 1.1s forwards"
              : "none",
            opacity: loaded ? undefined : 0,
          }}
        >
          <CursorTrailButton href="#chamber-01">
            ENTER TESTING AREA
            <span
              className="cta-arrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <ArrowChevron size={14} color="var(--portal-blue)" />
            </span>
          </CursorTrailButton>
          <a
            href="#chamber-02"
            className="cta-secondary-orange relative inline-flex items-center gap-2 px-6 py-3 text-sm tracking-widest no-underline"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--portal-orange)",
              border: "1px solid var(--portal-orange)",
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            SKIP TO MATERIALS
            <ArrowChevron size={14} color="var(--portal-orange)" />
          </a>
        </div>

        {/* Interaction hint */}
        <div
          className="mt-8 text-xs tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
            opacity: 0.5,
          }}
        >
          LEFT-CLICK: BLUE PORTAL · RIGHT-CLICK: ORANGE PORTAL
        </div>
      </div>

      {/* Interaction counter */}
      {interactionCount > 0 && (
        <div
          className="absolute top-20 right-6 z-20"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--concrete-gray)",
            letterSpacing: "0.1em",
          }}
        >
          TESTS: {interactionCount}
        </div>
      )}

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--concrete-gray)",
          letterSpacing: "0.15em",
        }}
      >
        <div>SCROLL</div>
        <ScrollChevron size={10} color="var(--concrete-gray)" />
      </div>

      {/* Portal-peek: glimpse the facility */}
      <PortalPeek
        targetId="chamber-06"
        label="THE FACILITY"
        position="bottom-left"
        color="blue"
      />

      {/* Developer commentary node */}
      {commentaryMode && (
        <CommentaryNode
          position="top-right"
          note="The hero uses a layered canvas system: rings spawn on click, with a flash burst, outer/inner rings, radial glow, dark core, and orbiting particles — all driven by a single RAF loop that self-terminates when idle."
        />
      )}
    </section>
  )
}

// ─── Chamber [01] THE DEVICE ─────────────────────────────────────────────────
function ChamberDevice({
  onInteraction,
  commentaryMode,
}: {
  onInteraction: () => void
  commentaryMode: boolean
}) {
  return (
    <section
      id="chamber-01"
      className="chamber-section"
      style={{
        minHeight: "120vh",
        background: "var(--void-black)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "auto 1fr",
        gap: "0",
        padding: 0,
        alignItems: "start",
        position: "relative",
      }}
    >
      {/* Ambient blue wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 70% 50%, rgba(15,74,128,0.10) 0%, transparent 70%)",
        }}
      />
      {/* Left copy panel */}
      <div
        className="flex flex-col justify-center px-8 md:px-16 py-16 md:py-24"
        style={{ gridColumn: "1", gridRow: "1 / 3", minHeight: "100vh" }}
      >
        <div
          className="text-xs mb-6 tracking-widest"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
          }}
        >
          [01] THE DEVICE
        </div>
        <h2
          className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--facility-white)",
            letterSpacing: "0.04em",
          }}
        >
          HANDHELD
          <br />
          PORTAL
          <br />
          DEVICE
        </h2>
        <p
          className="text-sm leading-relaxed mb-4 max-w-sm"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          The Aperture Science Handheld Portal Device creates stable
          inter-spatial portals on portal-compatible surfaces. The device
          operates via focused quantum tunneling — the specifics of which are
          classified.
        </p>
        <p
          className="text-sm leading-relaxed mb-8 max-w-sm"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-body)",
          }}
        >
          Features include: a stepped emitter barrel, articulated catcher-arm
          assembly, an emissive core tube, and a rear pod containing the primary
          power cell. The device weighs slightly more than it should.
        </p>

        {/* Spec list */}
        {[
          ["STATUS", "ACTIVE"],
          ["PORTAL COLOR A", "BLUE  ●"],
          ["PORTAL COLOR B", "ORANGE ●"],
          ["CORE STATUS", "NOMINAL"],
          ["SAFETY RATING", "PROVISIONAL"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-2"
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
            }}
          >
            <span style={{ color: "var(--concrete-gray)" }}>{label}</span>
            <span
              style={{
                color: value.includes("BLUE")
                  ? PORTAL_BLUE
                  : value.includes("ORANGE")
                    ? PORTAL_ORANGE
                    : "var(--facility-white)",
              }}
            >
              {value}
            </span>
          </div>
        ))}

        <div
          className="mt-8 text-xs leading-relaxed"
          style={{
            color: "var(--concrete-gray)",
            fontFamily: "var(--font-mono)",
            opacity: 0.6,
          }}
        >
          INTERACT: DRAG TO ROTATE · LEFT-CLICK: FIRE BLUE PORTAL
          <br />
          RIGHT-CLICK: FIRE ORANGE PORTAL · TOUCH: TAP / TWO-FINGER TAP
        </div>
      </div>

      {/* 3D canvas */}
      <div
        style={{
          gridColumn: "2",
          gridRow: "1 / 3",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "transparent",
        }}
      >
        <DeviceScene
          style={{ width: "100%", height: "100%" }}
          onInteraction={onInteraction}
        />
      </div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 768px) {
          #chamber-01 {
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
          }
          #chamber-01 > :first-child {
            order: 2;
            padding: 40px 20px 80px !important;
          }
          #chamber-01 > :last-child {
            order: 1;
            height: 55vh !important;
            width: 100% !important;
            position: relative !important;
          }
        }
      `}</style>

      {/* Portal-peek: glimpse the final chamber */}
      <PortalPeek
        targetId="chamber-final-gate"
        label="FINAL CHAMBER"
        position="bottom-right"
        color="orange"
      />

      {/* Developer commentary node */}
      {commentaryMode && (
        <CommentaryNode
          position="bottom-left"
          note="The 3D portal gun is built entirely from Three.js primitives — cylinders, spheres, toruses. No imported models. The portal ellipses use GSAP for scale-in animation, which is the only GSAP usage in the entire codebase."
        />
      )}
    </section>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentChamber, setCurrentChamber] = useState("00")
  const [toast, setToast] = useState({ visible: false, title: "", body: "" })
  const [keyModal, setKeyModal] = useState(false)
  const [transitionActive, setTransitionActive] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [introComplete, setIntroComplete] = useState(false)
  const [easterEggsFound, setEasterEggsFound] = useState(0)
  const [exitTransition, setExitTransition] = useState(false)
  const [showPuzzle, setShowPuzzle] = useState(false)
  const [commentaryMode, setCommentaryMode] = useState(false)
  const [showVault, setShowVault] = useState(false)
  const [pendingCommentary, setPendingCommentary] = useState<{
    trigger: string
    line: string
  } | null>(null)
  const lastScrollY = useRef(0)
  const commentaryLastShown = useRef({})
  const commentaryFired = useRef(new Set())
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const incrementInteractions = useCallback(() => {
    setInteractionCount((n) => n + 1)
  }, [])

  const incrementEasterEggs = useCallback(() => {
    setEasterEggsFound((n) => n + 1)
  }, [])

  const showCommentary = useCallback(
    (trigger: string) => {
      if (commentaryFired.current.has(trigger)) {
        console.log(`[commentary] trigger "${trigger}" already fired, skipping`)
        return
      }
      commentaryFired.current.add(trigger)
      const line = getCommentaryLine(trigger, commentaryLastShown)
      if (!line) {
        console.log(`[commentary] no line found for trigger "${trigger}"`)
        return
      }
      console.log(`[commentary] queuing: "${trigger}" → "${line}"`)
      setPendingCommentary({ trigger, line })
    },
    [],
  )

  // Process pending commentary when toast is clear
  useEffect(() => {
    if (!pendingCommentary) return
    if (toast.visible) {
      console.log("[commentary] toast busy, waiting...")
      return
    }
    const { line } = pendingCommentary
    console.log(`[commentary] displaying: "${line}"`)
    setPendingCommentary(null)
    setToast({ visible: true, title: "FACILITY LOG", body: line })
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current)
    toastHideTimer.current = setTimeout(() => {
      setToast((prev) => {
        if (prev.title === "FACILITY LOG") {
          return { visible: false, title: "", body: "" }
        }
        return prev
      })
    }, 6000)
  }, [pendingCommentary, toast.visible])

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    setTransitionActive(true)
    // Fire commentary after a short delay so the transition plays first
    setTimeout(() => {
      showCommentary("introComplete")
    }, 2000)
  }, [showCommentary])

  const openVault = useCallback(() => {
    setKeyModal(false)
    setShowVault(true)
    incrementEasterEggs()
    showCommentary("vaultFound")
  }, [incrementEasterEggs, showCommentary])

  const handleFinalExit = useCallback(() => {    setExitTransition(true)
    showCommentary("finalComplete")
    setTimeout(() => {
      setShowPuzzle(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setToast((prev) => {
        // If commentary is still showing, let it finish; otherwise show exit toast
        if (prev.visible && prev.title === "FACILITY LOG") return prev
        return {
          visible: true,
          title: "TEST SEQUENCE CONCLUDED",
          body: "Test subject clearance verified. Returning to facility entrance.",
        }
      })
      setTimeout(() => {
        setToast((prev) => {
          if (prev.title === "TEST SEQUENCE CONCLUDED") {
            return { visible: false, title: "", body: "" }
          }
          return prev
        })
      }, 5000)
    }, 600)
  }, [showCommentary])

  // Lock body scrolling while in intro chamber
  useEffect(() => {
    if (!introComplete) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [introComplete])

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0
      setScrollProgress(progress)

      // Determine current chamber (derived from the chamber registry)
      const sections = CHAMBER_SECTION_IDS
      const isAtBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 60
      if (isAtBottom) {
        setCurrentChamber(MAX_CHAMBER)
      } else {
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i])
          if (
            el &&
            el.getBoundingClientRect().top <= window.innerHeight * 0.45
          ) {
            setCurrentChamber(sections[i].replace("chamber-", ""))
            break
          }
        }
      }

      // Track scroll reversals for achievement
      const dir = scrollY > lastScrollY.current ? 1 : -1
      trackScrollReversal(dir, (title: string, body: string) => {
        setToast({ visible: true, title, body })
        incrementEasterEggs()
        showCommentary("firstEasterEgg")
        setTimeout(() => {
          setToast((prev) => {
            if (prev.title === title) {
              return { visible: false, title: "", body: "" }
            }
            return prev
          })
        }, 5000)
      })
      lastScrollY.current = scrollY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Easter eggs
  useEffect(() => {
    initConsoleBootLog()
    const cleanup = initKeySequence(() => {
      setKeyModal(true)
      incrementEasterEggs()
      showCommentary("firstEasterEgg")
    })
    return cleanup
  }, [incrementEasterEggs, showCommentary])

  // Commentary: first portal fired
  useEffect(() => {
    const onFirstPortal = () => {
      console.log("[commentary] portal-fired event received")
      showCommentary("firstPortal")
    }
    window.addEventListener("portal-fired", onFirstPortal)
    return () => window.removeEventListener("portal-fired", onFirstPortal)
  }, [showCommentary])

  // Commentary: click spam detection
  useEffect(() => {
    const clicks: number[] = []
    const onClick = () => {
      const now = Date.now()
      clicks.push(now)
      // Keep only clicks from last 2 seconds
      while (clicks.length > 0 && clicks[0] < now - 2000) clicks.shift()
      if (clicks.length >= 6) {
        showCommentary("clickSpam")
        clicks.length = 0
      }
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [showCommentary])

  // Audio: play portal fire SFX on portal-fired events
  useEffect(() => {
    const onPortalFired = (e: Event) => {
      const color = (e as CustomEvent).detail?.color || "blue"
      console.log(`[audio] portal-fired: ${color}`)
      playPortalFire(color)
    }
    const onButtonPress = () => playButtonPress()
    const onDoorOpen = () => playDoorOpen()
    const onPortalCrossing = () => playPortalCrossing()
    const onSwitchActivate = () => playSwitchActivate()

    window.addEventListener("portal-fired", onPortalFired)
    window.addEventListener("audio:button-press", onButtonPress)
    window.addEventListener("audio:door-open", onDoorOpen)
    window.addEventListener("audio:portal-crossing", onPortalCrossing)
    window.addEventListener("audio:switch-activate", onSwitchActivate)
    return () => {
      window.removeEventListener("portal-fired", onPortalFired)
      window.removeEventListener("audio:button-press", onButtonPress)
      window.removeEventListener("audio:door-open", onDoorOpen)
      window.removeEventListener("audio:portal-crossing", onPortalCrossing)
      window.removeEventListener("audio:switch-activate", onSwitchActivate)
    }
  }, [])

  return (
    <div
      style={{
        background: "var(--void-black)",
        color: "var(--facility-white)",
        minHeight: "100vh",
      }}
    >
      {/* Custom cursor (site-wide, disabled on touch devices) */}
      <CustomCursor />

      {/* Idle power conservation dimmer */}
      <IdleDimmer active={introComplete} />

      {/* Intro chamber (loading gate) */}
      {!introComplete && <IntroChamber onComplete={handleIntroComplete} />}

      {introComplete && !showPuzzle && (
        <Nav
          scrollProgress={scrollProgress}
          currentChamber={currentChamber}
          commentaryMode={commentaryMode}
          onCommentaryToggle={() => setCommentaryMode((v) => !v)}
        />
      )}

      {/* Portal transition overlay */}
      <PortalTransition
        active={transitionActive}
        onComplete={() => setTransitionActive(false)}
      />

      {/* Exit portal transition */}
      <PortalTransition
        active={exitTransition}
        onComplete={() => setExitTransition(false)}
      />

      {/* CHAMBERS */}
      <ChamberEntry
        onEnter={() => setTransitionActive(true)}
        interactionCount={interactionCount}
        commentaryMode={commentaryMode}
      />
      <div className="hazard-stripe" />
      <ChamberDevice
        onInteraction={incrementInteractions}
        commentaryMode={commentaryMode}
      />
      <div className="hazard-stripe" />
      <GelExplainer
        onInteraction={() => {
          incrementInteractions()
          showCommentary("gelInteraction")
        }}
      />
      {commentaryMode && (
        <div className="relative" style={{ height: 0 }}>
          <CommentaryNode
            position="top-right"
            note="The gel physics sim runs a full gravity/bounce engine on a 2D canvas. Repulsion gel converts downward velocity to upward bounce; propulsion gel applies zero-friction acceleration. All in ~800 lines of vanilla canvas math."
          />
        </div>
      )}
      <div className="hazard-stripe" />
      <TrainingGrounds
        onInteraction={() => {
          incrementInteractions()
        }}
        onComboReward={() => {
          incrementInteractions()
          showCommentary("trainingCombo")
        }}
      />
      {commentaryMode && (
        <div className="relative" style={{ height: 0 }}>
          <CommentaryNode
            position="top-right"
            note="Training Grounds is the first room where portals preserve momentum: your exit velocity equals your entry velocity. Gel speed in, gate speed out. The gate threshold is tuned so walking and jumping can never satisfy it."
          />
        </div>
      )}
      <div className="hazard-stripe" />
      <PortalConcept />
      <div className="hazard-stripe" />
      <FacilityQuotes />
      <div className="hazard-stripe" />
      <EnrichmentCenter />
      <div className="hazard-stripe" />
      <TestComplete
        interactionCount={interactionCount}
        onInteraction={incrementInteractions}
      />
      <div className="hazard-stripe" />

      {/* Final chamber — gated behind click */}
      {!showPuzzle && <FinalChamberGate onEnter={() => setShowPuzzle(true)} />}
      {showPuzzle && (
        <FinalPortalPuzzle
          interactionCount={interactionCount}
          easterEggsFound={easterEggsFound}
          onExit={handleFinalExit}
        />
      )}

      {/* Toast */}
      <Toast visible={toast.visible} title={toast.title} body={toast.body} />

      {/* Key sequence modal */}
      <KeySequenceModal
        lines={KEY_SEQUENCE_COPY}
        visible={keyModal}
        onClose={() => setKeyModal(false)}
        onOpenVault={openVault}
      />

      {/* The Vault — hidden chamber, never in the nav or counter */}
      <Vault visible={showVault} onClose={() => setShowVault(false)} />

      {/* Mobile bottom spacer for nav bar */}
      <div className="h-12 md:hidden" />
    </div>
  )
}
