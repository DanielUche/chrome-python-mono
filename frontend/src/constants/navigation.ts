

export const NAVIGATION = {
  /** Delay for SPA navigation detection (ms) */
  SPA_DEBOUNCE_DELAY: 500,
  
  /** Restricted URL prefixes that should not be tracked */
  RESTRICTED_PREFIXES: ['chrome://', 'chrome-extension://', 'about:', 'file://'] as const,
  
  /** DOM selectors for main content areas to observe */
  CONTENT_SELECTORS: ['main', '#root', '#app', '[role="main"]'] as const,
} as const
