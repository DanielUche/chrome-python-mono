/**
 * Content script injected into web pages
 * Collects page metrics and sends them to background worker for API calls
 * Records metrics on initial load and on SPA navigation
 */

import { logger } from './utils/logger'
import { NAVIGATION } from './constants'

let lastRecordedUrl = ''
let recordMetricsTimeout: ReturnType<typeof setTimeout> | null = null
let lastRecordTime = 0
const MIN_RECORD_INTERVAL = 5000 // Minimum 5 seconds between recordings

/**
 * Debounce function to prevent too many rapid calls
 */
function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (recordMetricsTimeout) {
      clearTimeout(recordMetricsTimeout)
    }
    recordMetricsTimeout = setTimeout(() => {
      func.apply(this, args)
      recordMetricsTimeout = null
    }, wait)
  }
}

/**
 * Get the current timezone offset in hours
 * @returns timezone offset in hours (e.g., 1 for UTC+1, -5 for UTC-5)
 */
function getTimezoneOffset(): number {
  const now = new Date()
  return -now.getTimezoneOffset() / 60
}

/**
 * Extract visible text more accurately by getting text from visible elements only
 * Handles dynamic content better by waiting for content to be truly visible
 */
function getVisibleText(): string {
  // Use innerText which automatically excludes hidden content and scripts
  // But get it after ensuring content is loaded
  const text = document.body.innerText || ''
  return text
}

/**
 * Collect page metrics from the current page
 */
function collectPageMetrics() {
  const links = document.querySelectorAll('a')
  const images = document.querySelectorAll('img')
  
  // Use more accurate visible text extraction
  const visibleText = getVisibleText()
  const words = visibleText.split(/\s+/).filter((word) => word.length > 0)

  return {
    url: window.location.href,
    linkCount: links.length,
    wordCount: words.length,
    imageCount: images.length,
  }
}

/**
 * Send metrics to background worker
 * Background worker will make the actual API call (bypassing CORS)
 */
async function sendMetricsViaBackground(metrics: ReturnType<typeof collectPageMetrics>) {
  try {
    const now = new Date()
    const tzOffsetHours = getTimezoneOffset()
    
    const response = await chrome.runtime.sendMessage({
      type: 'COLLECT_METRICS',
      data: {
        url: metrics.url,
        link_count: metrics.linkCount,
        word_count: metrics.wordCount,
        image_count: metrics.imageCount,
        datetime_visited: now.toISOString(),
        timezone_offset: tzOffsetHours,
      },
    })

    if (response?.success) {
      logger.info('Metrics recorded successfully', { url: metrics.url, data: response.data })
      return response.data
    } else {
      throw new Error(response?.error || 'Unknown error from background')
    }
  } catch (error) {
    logger.error('Failed to send metrics to background', error, { url: metrics.url })
    throw error
  }
}

/**
 * Check if current tab is active/visible
 */
async function isTabActive(): Promise<boolean> {
  // Check if document is visible
  if (document.hidden) {
    return false;
  }
  
  // Also verify this is the active tab via Chrome API
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return false;
    
    // Compare URLs to confirm this is the active tab
    return tab.url === window.location.href;
  } catch (error) {
    // If we can't query tabs, fall back to document.hidden
    logger.debug('Cannot query tabs, using document.hidden', error);
    return !document.hidden;
  }
}

/**
 * Send metrics to backend once per URL
 */
async function recordPageMetrics() {
  const currentUrl = window.location.href

  // Skip if already recorded this URL (check this first before any async work)
  if (lastRecordedUrl === currentUrl) {
    return
  }
  
  // Client-side rate limiting: prevent recording too frequently
  const now = Date.now()
  if (now - lastRecordTime < MIN_RECORD_INTERVAL) {
    logger.debug('Skipping metrics collection - too soon since last record', {
      timeSinceLastRecord: now - lastRecordTime,
      minInterval: MIN_RECORD_INTERVAL
    })
    return
  }
  
  // Only track the currently active tab
  const tabIsActive = await isTabActive();
  if (!tabIsActive) {
    logger.debug('Tab is not active, skipping metrics collection');
    return;
  }

  // Wait a bit for dynamic content to load (especially for SPAs like ChatGPT)
  await new Promise(resolve => setTimeout(resolve, 2000))

  const metrics = collectPageMetrics()

  // Skip restricted domains
  if (NAVIGATION.RESTRICTED_PREFIXES.some(prefix => metrics.url.startsWith(prefix))) {
    return
  }

  try {
    // Check if extension context is still valid
    if (!chrome.runtime) {
      logger.warn('Extension context invalidated', { url: currentUrl })
      return
    }

    // Send metrics to background worker
    await sendMetricsViaBackground(metrics)
    lastRecordedUrl = currentUrl
    lastRecordTime = Date.now() // Update last record time
  } catch (error) {
    logger.error('Failed to record metrics', error, { url: currentUrl })
  }
}

// Record metrics when page finishes loading
async function initializeMetricsCollection() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      logger.debug('DOMContentLoaded event fired')
      await recordPageMetrics()
    })
  } else {
    // DOM is already loaded (for content scripts injected on already-loaded pages)
    logger.debug('DOM already loaded, recording metrics')
    await recordPageMetrics()
  }
}

// Listen for SPA navigation (History API)
let previousUrl = window.location.href

// Debounced version of recordPageMetrics to prevent rapid successive calls
const debouncedRecordMetrics = debounce(recordPageMetrics, NAVIGATION.SPA_DEBOUNCE_DELAY)

const urlObserver = new MutationObserver(async () => {
  const currentUrl = window.location.href
  if (currentUrl !== previousUrl) {
    logger.debug('URL changed detected', { from: previousUrl, to: currentUrl })
    previousUrl = currentUrl
    // Use debounced function instead of setTimeout
    debouncedRecordMetrics()
  }
})

// Scope observation to main content areas (not entire body) for better performance
// Observe head for title changes and main content area for navigation
const observeTargets = [
  ...NAVIGATION.CONTENT_SELECTORS.map(selector => document.querySelector(selector)),
  document.head, // For title changes
].filter(Boolean) as Element[]

// If no specific targets found, fall back to body but with limited scope
const targetToObserve = observeTargets.length > 0 ? observeTargets : [document.body]

// Start observing DOM changes to detect SPA navigation
targetToObserve.forEach((target) => {
  urlObserver.observe(target, {
    childList: true,
    subtree: true,
    attributeFilter: ['href'], // Only observe href attribute changes
  })
})

// Also listen to popstate and pushState events
window.addEventListener('popstate', () => {
  logger.debug('Popstate event fired')
  debouncedRecordMetrics()
})

// Intercept pushState and replaceState
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
  originalPushState.apply(this, args)
  logger.debug('pushState detected')
  debouncedRecordMetrics()
}

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args)
  logger.debug('replaceState detected')
  debouncedRecordMetrics()
}

initializeMetricsCollection()

logger.info('Content script initialized', { url: window.location.href })
