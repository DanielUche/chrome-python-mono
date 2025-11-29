/**
 * Get the current timezone offset in hours
 * @returns timezone offset in hours (e.g., 1 for UTC+1, -5 for UTC-5)
 */
export function getTimezoneOffset(): number {
  const now = new Date()
  return -now.getTimezoneOffset() / 60
}
