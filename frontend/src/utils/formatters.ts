import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DATE_FORMATS, DATE_OUTPUT_FORMAT } from '../constants'

// Enable plugins
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

/**
 * Parse date string using multiple format patterns
 */
function parseDateWithFormats(dateString: string): dayjs.Dayjs {
  if (!dateString) return dayjs()

  for (const format of DATE_FORMATS) {
    const parsed = dayjs(dateString, format)
    if (parsed.isValid()) {
      return parsed
    }
  }

  // Try ISO format as fallback
  const isoDate = dayjs(dateString)
  return isoDate.isValid() ? isoDate : dayjs()
}

export const formatters = {
  /**
   * Format date to readable string (e.g., "Nov 22, 2025, 03:45 PM")
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A'

    const date = parseDateWithFormats(dateString)

    if (!date.isValid()) {
      console.warn('Invalid date string:', dateString)
      return 'Invalid Date'
    }
    return date.format(DATE_OUTPUT_FORMAT)
  },

  /**
   * Format time difference as relative time (e.g., "2 hours ago")
   */
  formatTimeAgo(dateString: string): string {
    if (!dateString) return 'N/A'

    const date = parseDateWithFormats(dateString)

    if (!date.isValid()) {
      console.warn('Invalid date string:', dateString)
      return 'Unknown'
    }
    return date.fromNow()
  },

  /**
   * Format URL for display (extract hostname)
   */
  formatUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  },

  /**
   * Format large numbers with commas
   */
  formatNumber(num: number): string {
    return num.toLocaleString('en-US')
  },
}
