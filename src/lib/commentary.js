// Chamber Zero — Contextual Commentary Lines
// Original one-liners, never quoted dialogue. Dry, deadpan facility voice.

const COMMENTARY = {
  // First portal ever fired on the site
  firstPortal: [
    "First portal fired. The facility notes your enthusiasm for quantum tunneling.",
    "Portal deployment detected. Your form is adequate.",
    "A promising start. The device seems to tolerate you.",
  ],

  // Rapid click-spamming
  clickSpam: [
    "The device is not a toy. Though the facility admires your persistence.",
    "Repeated portal deployment noted. Rate limits exist for a reason.",
    "Enthusiasm noted. The surfaces are not going anywhere.",
  ],

  // Finding first easter egg
  firstEasterEgg: [
    "Anomaly detected. The facility will pretend not to notice.",
    "Curiosity: the second-most dangerous quality in a test subject.",
    "You found something. The facility is... concerned.",
  ],

  // Completing intro chamber
  introComplete: [
    "Cube handling proficiency: adequate. Door protocol engaged.",
    "The companion cube has served its purpose. Do not become attached.",
    "Entry chamber cleared. Your spatial reasoning is within acceptable bounds.",
  ],

  // First gel interaction
  gelInteraction: [
    "Material interaction logged. Please do not consume the gel.",
    "Gel responsiveness: satisfactory. Please refrain from licking.",
    "The gel is not alive. Probably. Continue testing.",
  ],

  // Completing final chamber
  finalComplete: [
    "Test sequence concluded. Your performance has been... noted.",
    "Final chamber cleared. Cake distribution is still being processed.",
    "The facility thanks you for your participation. No refunds.",
  ],

  // First gel+portal combo through the Training Grounds momentum gate
  trainingCombo: [
    "Gel-portal combination detected. The facility did not authorize this synergy.",
    "Improvised momentum routing logged. Please file Form 12-B for unauthorized ingenuity.",
    "The training room was not designed for that. The facility is revising the definition of 'designed'.",
  ],

  // Discovering the hidden Vault
  vaultFound: [
    "This chamber does not exist. You were never here.",
    "Unauthorized area accessed. The facility denies everything.",
    "How did you find this? The facility is asking for a friend.",
  ],
}

// Pick a random line from a pool, avoiding the last-shown line for that trigger
export function getCommentaryLine(trigger, lastShownRef) {
  const pool = COMMENTARY[trigger]
  if (!pool || pool.length === 0) return null

  const last = lastShownRef.current?.[trigger]
  let candidates = pool.filter((line) => line !== last)
  if (candidates.length === 0) candidates = pool

  const line = candidates[Math.floor(Math.random() * candidates.length)]
  lastShownRef.current = { ...lastShownRef.current, [trigger]: line }
  return line
}

export default COMMENTARY
