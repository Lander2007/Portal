import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Suppress THREE.Clock deprecation warning from @react-three/fiber
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : ""
  if (msg.includes("THREE.Clock") && msg.includes("deprecated")) return
  originalWarn.apply(console, args)
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
