const STORAGE_KEY = "chamber-zero-subject"

export function getSubjectNumber() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
  } catch {}
  const num = String(Math.floor(1000 + Math.random() * 9000))
  try {
    localStorage.setItem(STORAGE_KEY, num)
  } catch {}
  return num
}
