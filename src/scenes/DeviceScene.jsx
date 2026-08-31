import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useState, useCallback, useEffect, useMemo, memo } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import {
  WebGLErrorBoundary,
  DeviceSVGFallback,
} from "../components/WebGLFallback"

// ─── Color constants ──────────────────────────────────────────────────────────
const PORTAL_BLUE = new THREE.Color("#1E90FF")
const PORTAL_ORANGE = new THREE.Color("#FF7A1A")
const GUNMETAL = new THREE.Color("#1A1A1E")
const CORE_DEFAULT = new THREE.Color("#2FA8FF")

// ─── The ASHPD device model ───────────────────────────────────────────────────
function Device({ coreColor, firePulse }) {
  const groupRef = useRef()
  const coreRef = useRef()
  const coreMatRef = useRef()

  useFrame(() => {
    if (coreMatRef.current) {
      coreMatRef.current.emissive.lerp(coreColor, 0.12)
      coreMatRef.current.emissiveIntensity =
        firePulse > 0 ? 2.5 + Math.sin(Date.now() * 0.02) * 0.5 : 1.2
    }
  })

  const shellMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#E8E8E5"),
        roughness: 0.82,
        metalness: 0.05,
      }),
    [],
  )

  const barrelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GUNMETAL,
        roughness: 0.55,
        metalness: 0.7,
      }),
    [],
  )

  const coreMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0A1A2E"),
      emissive: CORE_DEFAULT.clone(),
      emissiveIntensity: 2.0,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92,
    })
    coreMatRef.current = m
    return m
  }, [])

  const armMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#111114"),
        roughness: 0.6,
        metalness: 0.85,
      }),
    [],
  )

  const cableMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0D0D10"),
        roughness: 0.9,
        metalness: 0.2,
      }),
    [],
  )

  const emblemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C0C0BC"),
        roughness: 0.3,
        metalness: 0.8,
      }),
    [],
  )

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* EMITTER BARREL — stepped cylindrical rings */}
      <mesh position={[-0.35, 0, 0]} material={barrelMat} castShadow>
        <cylinderGeometry args={[0.18, 0.19, 0.22, 32]} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} material={barrelMat} castShadow>
        <cylinderGeometry args={[0.155, 0.175, 0.18, 32]} />
      </mesh>
      <mesh position={[-0.72, 0, 0]} material={barrelMat} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.15, 32]} />
      </mesh>
      <mesh position={[-0.845, 0, 0]} material={barrelMat} castShadow>
        <cylinderGeometry args={[0.105, 0.125, 0.1, 32]} />
      </mesh>
      {/* Emitter aperture glow ring — larger */}
      <mesh position={[-0.9, 0, 0]} material={coreMat} ref={coreRef}>
        <torusGeometry args={[0.09, 0.022, 16, 48]} />
      </mesh>
      {/* Dark void inside barrel tip */}
      <mesh position={[-0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* WEDGE / FIN HOUSING */}
      <mesh position={[-0.15, 0, 0]} material={shellMat} castShadow>
        <sphereGeometry
          args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]}
        />
      </mesh>
      <mesh
        position={[-0.08, 0.15, 0.1]}
        rotation={[0.3, 0, 0.2]}
        material={shellMat}
        castShadow
      >
        <boxGeometry args={[0.18, 0.12, 0.04]} />
      </mesh>

      {/* APERTURE EMBLEM */}
      <group position={[-0.12, 0.17, 0.12]} rotation={[0, -0.4, 0]}>
        <mesh material={emblemMat}>
          <torusGeometry args={[0.055, 0.009, 8, 32]} />
        </mesh>
        <mesh material={emblemMat}>
          <torusGeometry args={[0.038, 0.007, 8, 32]} />
        </mesh>
        <mesh material={emblemMat}>
          <torusGeometry args={[0.022, 0.005, 8, 32]} />
        </mesh>
        <mesh material={emblemMat}>
          <circleGeometry args={[0.01, 16]} />
        </mesh>
      </group>

      {/* CORE TUBE — brighter */}
      <mesh
        position={[0.12, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={coreMat}
        castShadow
      >
        <cylinderGeometry args={[0.055, 0.055, 0.38, 24]} />
      </mesh>
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.36, 24]} />
        <meshBasicMaterial color={CORE_DEFAULT} transparent opacity={0.45} />
      </mesh>
      <mesh
        position={[0.32, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={coreMat}
      >
        <cylinderGeometry args={[0.058, 0.058, 0.025, 24]} />
      </mesh>
      <mesh
        position={[-0.08, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={coreMat}
      >
        <cylinderGeometry args={[0.058, 0.058, 0.025, 24]} />
      </mesh>

      {/* MAIN BODY — large oval rear pod */}
      <mesh
        position={[0.52, 0, 0]}
        scale={[1.4, 1, 1]}
        material={shellMat}
        castShadow
      >
        <sphereGeometry args={[0.32, 32, 32]} />
      </mesh>
      <mesh
        position={[0.58, 0.22, 0.08]}
        rotation={[0.2, 0, 0]}
        material={shellMat}
      >
        <boxGeometry args={[0.25, 0.06, 0.04]} />
      </mesh>
      <mesh position={[0.45, 0.32, 0]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          emissive={coreColor}
          emissiveIntensity={1.5}
          color={new THREE.Color("#050508")}
        />
      </mesh>
      {[-0.05, 0, 0.05].map((z, i) => (
        <mesh key={i} position={[0.78, 0, z]} material={barrelMat}>
          <boxGeometry args={[0.04, 0.18, 0.008]} />
        </mesh>
      ))}

      {/* CATCHER ARMS — front pair */}
      <group position={[-0.45, 0, 0]} rotation={[0, 0, 0.42]}>
        <mesh material={armMat} castShadow>
          <cylinderGeometry args={[0.018, 0.012, 0.38, 8]} />
        </mesh>
        <mesh
          position={[0, 0.2, 0]}
          rotation={[0.6, 0, -0.3]}
          material={armMat}
        >
          <cylinderGeometry args={[0.013, 0.009, 0.22, 8]} />
        </mesh>
      </group>
      <group position={[-0.45, 0, 0]} rotation={[0, 0, -0.42]}>
        <mesh material={armMat} castShadow>
          <cylinderGeometry args={[0.018, 0.012, 0.38, 8]} />
        </mesh>
        <mesh
          position={[0, 0.2, 0]}
          rotation={[-0.6, 0, -0.3]}
          material={armMat}
        >
          <cylinderGeometry args={[0.013, 0.009, 0.22, 8]} />
        </mesh>
      </group>

      {/* CATCHER ARMS — rear pair */}
      <group position={[0.65, 0, 0]} rotation={[0, 0, 2.3]}>
        <mesh material={armMat} castShadow>
          <cylinderGeometry args={[0.018, 0.012, 0.36, 8]} />
        </mesh>
        <mesh
          position={[0, 0.19, 0]}
          rotation={[0.5, 0, 0.3]}
          material={armMat}
        >
          <cylinderGeometry args={[0.013, 0.009, 0.2, 8]} />
        </mesh>
      </group>
      <group position={[0.65, 0, 0]} rotation={[0, 0, -2.3]}>
        <mesh material={armMat} castShadow>
          <cylinderGeometry args={[0.018, 0.012, 0.36, 8]} />
        </mesh>
        <mesh
          position={[0, 0.19, 0]}
          rotation={[-0.5, 0, 0.3]}
          material={armMat}
        >
          <cylinderGeometry args={[0.013, 0.009, 0.2, 8]} />
        </mesh>
      </group>

      {/* CABLES */}
      <mesh
        position={[-0.3, 0.25, 0.06]}
        rotation={[0.1, 0.2, 1.1]}
        material={cableMat}
      >
        <torusGeometry args={[0.18, 0.008, 8, 32, Math.PI * 1.1]} />
      </mesh>
      <mesh
        position={[0.3, 0.28, -0.04]}
        rotation={[-0.1, -0.1, 0.8]}
        material={cableMat}
      >
        <torusGeometry args={[0.22, 0.007, 8, 32, Math.PI * 1.3]} />
      </mesh>
      <mesh
        position={[0.05, 0.22, 0.1]}
        rotation={[0.2, 0.3, 1.5]}
        material={cableMat}
      >
        <torusGeometry args={[0.14, 0.006, 8, 32, Math.PI * 0.9]} />
      </mesh>

      {/* Panel seam lines */}
      {[
        [-0.05, 0.1],
        [0.2, 0.08],
        [0.45, -0.05],
      ].map(([x, y], i) => (
        <mesh
          key={`seam-${i}`}
          position={[x, y, 0.16]}
          rotation={[0, 0, 0.05 * (i - 1)]}
        >
          <boxGeometry args={[0.12, 0.003, 0.001]} />
          <meshStandardMaterial
            color="#2A2A2E"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Portal ellipse — enhanced with rim + swirl + distorted center ────────────
function Portal({ position, color, visible }) {
  const groupRef = useRef()
  const swirlRef = useRef()
  const matRef = useRef()
  const rimMatRef = useRef()

  useFrame(() => {
    if (!visible) return
    if (swirlRef.current) {
      swirlRef.current.rotation.z += 0.015
    }
    if (rimMatRef.current) {
      rimMatRef.current.emissiveIntensity =
        2.0 + Math.sin(Date.now() * 0.004) * 0.5
    }
  })

  useEffect(() => {
    if (!groupRef.current || !visible) return
    groupRef.current.scale.set(0.01, 0.01, 0.01)
    gsap.to(groupRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
    })
  }, [visible])

  if (!visible) return null

  const hex = "#" + color.getHexString()

  return (
    <group position={position} ref={groupRef}>
      {/* Ambient ground glow — projected onto wall */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glowing rim */}
      <mesh ref={rimMatRef}>
        <torusGeometry args={[0.55, 0.06, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Swirling mid ring */}
      <group ref={swirlRef}>
        <mesh>
          <torusGeometry args={[0.44, 0.025, 12, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[0.44, 0.025, 12, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh rotation={[0, 0, (Math.PI * 2) / 3]}>
          <torusGeometry args={[0.44, 0.025, 12, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Portal void fill — near-black distorted center */}
      <mesh scale={[0.55, 1, 0.55]}>
        <circleGeometry args={[0.88, 64]} />
        <meshBasicMaterial
          color={new THREE.Color("#000005")}
          transparent
          opacity={0.92}
          ref={matRef}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh>
        <torusGeometry args={[0.38, 0.02, 12, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Point light for ambient bleed */}
      <pointLight color={hex} intensity={1.2} distance={2.5} decay={2} />
    </group>
  )
}

// ─── Connection pulse between two portals ─────────────────────────────────────
function PortalLink({ bluePos, orangePos, active }) {
  const particleRef = useRef()
  const progressRef = useRef(0)

  useFrame((_, delta) => {
    if (!active || !particleRef.current) return
    progressRef.current = (progressRef.current + delta * 0.4) % 1
    const t = progressRef.current
    particleRef.current.position.set(
      bluePos[0] + (orangePos[0] - bluePos[0]) * t,
      bluePos[1] + (orangePos[1] - bluePos[1]) * t,
      bluePos[2] + (orangePos[2] - bluePos[2]) * t,
    )
    particleRef.current.material.opacity = Math.sin(t * Math.PI) * 0.8
  })

  if (!active) return null

  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshBasicMaterial
        color={new THREE.Color("#AADAFF")}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

// ─── Particle burst on portal fire ────────────────────────────────────────────
function ParticleBurst({ position, color, active, onDone }) {
  const ref = useRef()
  const startTime = useRef(null)

  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2
      const r = 0.08 + Math.random() * 0.12
      arr.push([
        Math.cos(angle) * r * (0.5 + Math.random()),
        Math.sin(angle) * r * (0.5 + Math.random()),
        (Math.random() - 0.5) * 0.1,
      ])
    }
    return arr
  }, [])

  useFrame(() => {
    if (!active || !ref.current) return
    if (!startTime.current) startTime.current = Date.now()
    const elapsed = (Date.now() - startTime.current) / 1000
    if (elapsed > 0.6) {
      startTime.current = null
      onDone?.()
      return
    }
    const t = elapsed / 0.6
    ref.current.children.forEach((child, i) => {
      const spread = positions[i]
      child.position.set(
        position[0] + spread[0] * t * 3.5,
        position[1] + spread[1] * t * 3.5,
        position[2] + spread[2] * t,
      )
      child.scale.setScalar(Math.max(0, 1 - t * 1.5))
      child.material.opacity = Math.max(0, 1 - t * 1.8)
    })
  })

  if (!active) return null

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Test wall in the background ─────────────────────────────────────────────
function TestWall() {
  return (
    <mesh position={[0, 0, -3.5]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial
        color={new THREE.Color("#111115")}
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  )
}

// ─── Scene lighting ───────────────────────────────────────────────────────────
function Lights({ coreColor }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[4, 5, 3]}
        intensity={0.9}
        color="#F5F0E8"
        castShadow
      />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.3}
        color="#C0D0E8"
      />
      <directionalLight position={[0, -3, 4]} intensity={0.2} color="#FFFFFF" />
      <pointLight
        position={[0.12, 0, 0]}
        intensity={0.8}
        color={coreColor}
        distance={2}
      />
      <pointLight
        position={[-0.9, 0, 0]}
        intensity={0.5}
        color={coreColor}
        distance={1.5}
      />
    </>
  )
}

// ─── Main scene inner (needs useThree context) ────────────────────────────────
function SceneInner({ isDragging, onCoreColorChange, onInteraction }) {
  const deviceRef = useRef()
  const targetRotY = useRef(0)
  const currentRotY = useRef(0)
  const currentRotX = useRef(0)
  const targetRotX = useRef(0)
  const velY = useRef(0)

  const [bluePortalPos, setBluePortalPos] = useState([-1.8, 0.3, -3.4])
  const [orangePortalPos, setOrangePortalPos] = useState([1.6, -0.1, -3.4])
  const [portalState, setPortalState] = useState({ blue: false, orange: false })
  const [particleBurst, setParticleBurst] = useState(null)
  const [coreColor, setCoreColor] = useState(CORE_DEFAULT.clone())
  const [firePulse, setFirePulse] = useState(0)

  const { gl, camera } = useThree()

  // Raycast click position onto the test wall plane (z = -3.5)
  const raycastToWall = useCallback(
    (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
      const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 3.5)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(wallPlane, intersection)
      if (intersection) {
        return [intersection.x, intersection.y, intersection.z]
      }
      return null
    },
    [gl, camera],
  )

  const firePortal = useCallback(
    (type, clientX, clientY) => {
      const color = type === "blue" ? PORTAL_BLUE : PORTAL_ORANGE
      setCoreColor(color.clone())
      onCoreColorChange?.(color)

      // Place portal at click position
      const pos = raycastToWall(clientX, clientY)
      if (pos) {
        if (type === "blue") setBluePortalPos(pos)
        else setOrangePortalPos(pos)
      }

      setPortalState((s) => ({ ...s, [type]: true }))
      setParticleBurst({ color, pos: [-0.9, 0, 0] })
      setFirePulse((n) => n + 1)
      onInteraction?.()
    },
    [onCoreColorChange, raycastToWall, onInteraction],
  )

  // Rotation with scroll + drag + inertia
  useFrame((_, delta) => {
    if (!deviceRef.current) return
    if (!isDragging.current) {
      velY.current *= 0.92
      targetRotY.current += velY.current * delta
    }
    currentRotY.current += (targetRotY.current - currentRotY.current) * 0.08
    currentRotX.current += (targetRotX.current - currentRotX.current) * 0.08
    deviceRef.current.rotation.y = currentRotY.current
    deviceRef.current.rotation.x = currentRotX.current
  })

  useEffect(() => {
    const canvas = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    const onDown = (e) => {
      dragging = true
      isDragging.current = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.style.cursor = "grabbing"
    }

    const onMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      velY.current = dx * 0.008
      targetRotY.current += dx * 0.008
      targetRotX.current = Math.max(
        -0.4,
        Math.min(0.4, targetRotX.current + dy * 0.006),
      )
      lastX = e.clientX
      lastY = e.clientY
    }

    const onUp = () => {
      if (!dragging) return
      dragging = false
      isDragging.current = false
      canvas.style.cursor = "grab"
    }

    const onClick = (e) => {
      const isRight = e.button === 2
      firePortal(isRight ? "orange" : "blue", e.clientX, e.clientY)
    }

    const onContextMenu = (e) => e.preventDefault()

    const onTouchTap = (() => {
      let lastTap = 0
      return (e) => {
        const now = Date.now()
        if (e.touches?.length === 2) {
          firePortal("orange", e.touches[0].clientX, e.touches[0].clientY)
        } else if (now - lastTap < 300) {
          const touch = e.touches[0]
          firePortal("blue", touch.clientX, touch.clientY)
        }
        lastTap = now
      }
    })()

    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointerleave", onUp)
    canvas.addEventListener("contextmenu", onContextMenu)
    canvas.addEventListener("mousedown", onClick)
    canvas.addEventListener("touchstart", onTouchTap, { passive: true })

    canvas.style.cursor = "grab"

    return () => {
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointerleave", onUp)
      canvas.removeEventListener("contextmenu", onContextMenu)
      canvas.removeEventListener("mousedown", onClick)
      canvas.removeEventListener("touchstart", onTouchTap)
    }
  }, [firePortal])

  useEffect(() => {
    const onScroll = () => {
      if (isDragging.current) return
      const progress =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)
      targetRotY.current = progress * Math.PI * 2.5
      targetRotX.current = Math.sin(progress * Math.PI) * 0.15
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <Lights coreColor={coreColor} />
      <TestWall />

      <group ref={deviceRef}>
        <Device coreColor={coreColor} firePulse={firePulse} />
      </group>

      <Portal
        position={bluePortalPos}
        color={PORTAL_BLUE}
        visible={portalState.blue}
      />
      <Portal
        position={orangePortalPos}
        color={PORTAL_ORANGE}
        visible={portalState.orange}
      />

      <PortalLink
        bluePos={bluePortalPos}
        orangePos={orangePortalPos}
        active={portalState.blue && portalState.orange}
      />

      {particleBurst && (
        <ParticleBurst
          position={particleBurst.pos}
          color={particleBurst.color}
          active={true}
          onDone={() => setParticleBurst(null)}
        />
      )}
    </>
  )
}

// ─── WebGL availability check ─────────────────────────────────────────────────
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    )
  } catch {
    return false
  }
}

// ─── Public DeviceScene component ────────────────────────────────────────────
function DeviceScene({ style, onInteraction }) {
  const isDragging = useRef(false)
  const [webglOk] = useState(() => hasWebGL())

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--concrete-gray)",
          letterSpacing: "0.1em",
          textAlign: "center",
          background: "rgba(10,10,12,0.7)",
          padding: "6px 14px",
          border: "1px solid var(--border-subtle)",
          borderRadius: "2px",
        }}
      >
        LEFT-CLICK: BLUE · RIGHT-CLICK: ORANGE · DRAG: ROTATE
      </div>

      {webglOk ? (
        <WebGLErrorBoundary>
          <Canvas
            shadows="percentage"
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
            camera={{ position: [0, 0.3, 3.2], fov: 40 }}
            style={{ background: "transparent" }}
            gl={{ antialias: true, alpha: true }}
          >
            <SceneInner isDragging={isDragging} onInteraction={onInteraction} />
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <DeviceSVGFallback />
        </div>
      )}
    </div>
  )
}

export default memo(DeviceScene)
