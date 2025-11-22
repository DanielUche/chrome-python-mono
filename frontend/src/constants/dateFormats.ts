/**
 * Date formatting constants
 */

export const DATE_FORMATS = [
  'MMMM DD, YYYY [at] hh:mm A',  // November 22, 2025 at 12:59 PM
  'MMMM D, YYYY [at] hh:mm A',   // November 22, 2025 at 12:59 PM (without zero-padding)
  'MMMM DD, YYYY [at] h:mm A',   // November 22, 2025 at 1:59 PM
  'MMMM D, YYYY [at] h:mm A',    // November 22, 2025 at 1:59 PM (without zero-padding)
] as const

export const DATE_OUTPUT_FORMAT = 'MMM DD, YYYY, hh:mm A' as const
