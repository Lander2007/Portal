// Chamber Zero — Chamber Registry (single source of truth)
// The CHAMBER 0X/0Y readout, nav menu, and scroll-spy all derive from this
// list. To add a chamber: append an entry (ids stay sequential) and add the
// matching <section id="chamber-XX"> in scroll order in App.
// Hidden/secret chambers (e.g. The Vault) are intentionally NOT listed here
// so they never appear in the nav readout or affect the visible total.

export const CHAMBERS = [
  { id: "00", label: "ENTRY", href: "#chamber-00" },
  { id: "01", label: "THE DEVICE", href: "#chamber-01" },
  { id: "02", label: "MATERIALS", href: "#chamber-02" },
  { id: "03", label: "TRAINING GROUNDS", href: "#chamber-03" },
  { id: "04", label: "SCIENCE", href: "#chamber-04" },
  { id: "05", label: "RECORDS", href: "#chamber-05" },
  { id: "06", label: "THE FACILITY", href: "#chamber-06" },
  { id: "07", label: "TEST COMPLETE", href: "#chamber-07" },
]

// DOM ids in scroll order, for the scroll-spy in App.
export const CHAMBER_SECTION_IDS = CHAMBERS.map((c) => `chamber-${c.id}`)

// Displayed as the "/ 0Y" total. Always the last visible chamber id.
export const MAX_CHAMBER = CHAMBERS[CHAMBERS.length - 1].id
