export const validators = {
  /**
   * Validate if string is a valid URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Validate if URL has http(s) protocol
   */
  hasProtocol(url: string): boolean {
    return /^https?:\/\//.test(url)
  },

  /**
   * Normalize URL by adding protocol if missing
   */
  normalizeUrl(url: string): string {
    if (!this.hasProtocol(url)) {
      return `https://${url}`
    }
    return url
  },

  /**
   * Check if URL is from a restricted domain
   */
  isRestrictedDomain(url: string): boolean {
    const restricted = ['chrome://', 'chrome-extension://', 'about:', 'file://']
    return restricted.some((prefix) => url.startsWith(prefix))
  },
}
