import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Enable plugins
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

export const formatters = {
  /**
   * Format date to readable string (e.g., "Nov 22, 2025, 03:45 PM")
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A'
    
    // Try multiple format patterns (backend sends: "November 22, 2025 at 12:59 PM")
    const formats = [
      'MMMM DD, YYYY [at] hh:mm A',  // November 22, 2025 at 12:59 PM
      'MMMM D, YYYY [at] hh:mm A',   // November 22, 2025 at 12:59 PM (without zero-padding)
      'MMMM DD, YYYY [at] h:mm A',   // November 22, 2025 at 1:59 PM
      'MMMM D, YYYY [at] h:mm A',    // November 22, 2025 at 1:59 PM (without zero-padding)
    ]
    
    let date = dayjs()
    for (const format of formats) {
      const parsed = dayjs(dateString, format)
      if (parsed.isValid()) {
        date = parsed
        break
      }
    }
    
    // If still not valid, try ISO format
    if (!date.isValid()) {
      date = dayjs(dateString)
    }
    
    if (!date.isValid()) {
      console.warn('Invalid date string:', dateString)
      return 'Invalid Date'
    }
    return date.format('MMM DD, YYYY, hh:mm A')
  },

  /**
   * Format time difference as relative time (e.g., "2 hours ago")
   */
  formatTimeAgo(dateString: string): string {
    if (!dateString) return 'N/A'
    
    // Try multiple format patterns (backend sends: "November 22, 2025 at 12:59 PM")
    const formats = [
      'MMMM DD, YYYY [at] hh:mm A',  // November 22, 2025 at 12:59 PM
      'MMMM D, YYYY [at] hh:mm A',   // November 22, 2025 at 12:59 PM (without zero-padding)
      'MMMM DD, YYYY [at] h:mm A',   // November 22, 2025 at 1:59 PM
      'MMMM D, YYYY [at] h:mm A',    // November 22, 2025 at 1:59 PM (without zero-padding)
    ]
    
    let date = dayjs()
    for (const format of formats) {
      const parsed = dayjs(dateString, format)
      if (parsed.isValid()) {
        date = parsed
        break
      }
    }
    
    // If still not valid, try ISO format
    if (!date.isValid()) {
      date = dayjs(dateString)
    }
    
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
