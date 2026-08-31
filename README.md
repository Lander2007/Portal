# Portal
An original, Portal-inspired interactive 3D website — a fan tribute to Valve's Portal series, built as a single-scroll narrative experience with an interactive portal device, scroll-driven 3D, and a couple of the game's signature mechanics reimagined for the web.

This is an unofficial fan project. Not affiliated with or endorsed by Valve Corporation. No trademarked assets, logos, or in-game dialogue are reproduced — the visual language is an original interpretation inspired by the game's aesthetic.

Live demo

[link-to-deployment]

Features
Diegetic navigation — a facility-style "chamber" readout and scroll-progress meter instead of a conventional navbar
Interactive 3D device — an original stylized handheld portal device, built in React Three Fiber, that:
Rotates with scroll (GSAP ScrollTrigger)
Can be freely dragged/orbited by the user, with momentum on release
Fires a blue portal on left-click and an orange portal on right-click, with an emissive core that reflects the last-fired color
Gel mechanics, explained and interactive
Repulsion Gel (blue) — bounce physics
Propulsion Gel (orange) — speed/low-friction physics
A hands-on widget lets you fling an object between both modes
Portal transition — a full-screen radial wipe with chromatic-aberration flicker between key sections, echoing the game's core teleportation concept
Easter eggs — a handful of original, hidden touches scattered through the page (console log, scroll-based achievement toast, key-sequence trigger, and more) — go find them
Fully responsive, touch-friendly, and respects prefers-reduced-motion
Tech stack
React 19 + Vite
React Three Fiber + drei — 3D scene and device model
GSAP + ScrollTrigger — scroll choreography and transitions
Zustand (or plain React state) — interaction state
Getting started
Prerequisites
Node.js 18+
npm (or yarn/pnpm)
Installation
bash
git clone https://github.com/<your-username>/chamber-zero.git
cd chamber-zero
npm install
Development
bash
npm run dev

The site runs at http://localhost:5173 by default.

Build
bash
npm run build
npm run preview
Project structure
├── public/
│   └── models/
│       └── device.glb          # optional final 3D model asset
├── src/
│   ├── scenes/
│   │   └── DeviceScene.jsx     # 3D canvas, model, drag/scroll rotation, portal firing
│   ├── components/
│   │   ├── Nav.jsx             # chamber nav + progress meter
│   │   ├── PortalTransition.jsx
│   │   ├── GelInteractive.jsx  # blue (bounce) / orange (slide) widget
│   │   ├── GelExplainer.jsx    # gel lore/explainer section
│   │   └── PortalConcept.jsx   # "how portals work" explainer
│   ├── lib/
│   │   └── easterEggs.js       # centralized easter-egg triggers/copy
│   └── styles/
│       └── tokens.css          # color palette as CSS variables
└── README.md
Color palette
Token	Value	Use
--void-black	
#0A0A0C	backdrop / page background
--facility-white	
#F2F2EF	primary surfaces / device shell
--concrete-gray	
#8C8C87	secondary text, muted UI
--portal-blue	
#1E90FF	blue portal
--portal-orange	
#FF7A1A	orange portal
--gel-blue	
#2FA8FF	Repulsion Gel (bounce)
--gel-orange	
#FF9838	Propulsion Gel (speed)
Interaction guide
Scroll through the hero to rotate the device
Click and drag the device to free-rotate it
Left-click the device to fire a blue portal · right-click to fire an orange one
Toggle the gel widget to switch between bounce (blue) and slide (orange) physics
Roadmap / known gaps
 Swap the primitive-built placeholder device for the final .glb model
 Add sound design (portal-fire cue, gel splat, ambient hum)
 Additional easter eggs
Credits

Built by [your name/handle]. Inspired by Valve's Portal and Portal 2. All original assets, copy, and code in this repository are original work — no game assets are included.

License

[MIT / your license of choice]
