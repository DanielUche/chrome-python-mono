/**
 * Content script injected into web pages
 * Collects page metrics and sends them to background worker for API calls
 * Records metrics on initial load and on SPA navigation
 */

let lastRecordedUrl = ''

/**
 * Get the current timezone offset in hours
 * @returns timezone offset in hours (e.g., 1 for UTC+1, -5 for UTC-5)
 */
function getTimezoneOffset(): number {
  const now = new Date()
  return -now.getTimezoneOffset() / 60
}

/**
 * Collect page metrics from the current page
 */
function collectPageMetrics() {
  const links = document.querySelectorAll('a')
  const words = document.body.innerText.split(/\s+/).filter((word) => word.length > 0)
  const images = document.querySelectorAll('img')

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
      console.log('Metrics recorded successfully:', response.data)
      return response.data
    } else {
      throw new Error(response?.error || 'Unknown error from background')
    }
  } catch (error) {
    console.error('Failed to send metrics to background:', error)
    throw error
  }
}

/**
 * Send metrics to backend once per URL
 */
async function recordPageMetrics() {
  const currentUrl = window.location.href

  // Skip if already recorded this URL
  if (lastRecordedUrl === currentUrl) {
    return
  }

  const metrics = collectPageMetrics()

  // Skip restricted domains
  if (metrics.url.startsWith('chrome://') || metrics.url.startsWith('about:')) {
    return
  }

  try {
    // Check if extension context is still valid
    if (!chrome.runtime) {
      console.warn('Extension context invalidated')
      return
    }

    // Send metrics to background worker
    await sendMetricsViaBackground(metrics)
    lastRecordedUrl = currentUrl
  } catch (error) {
    console.error('Failed to record metrics:', error)
  }
}

// Record metrics when page finishes loading
async function initializeMetricsCollection() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('DOMContentLoaded event fired')
      await recordPageMetrics()
    })
  } else {
    // DOM is already loaded (for content scripts injected on already-loaded pages)
    console.log('DOM already loaded, recording metrics')
    await recordPageMetrics()
  }
}

// Also record on page load for more accurate metrics
window.addEventListener('load', async () => {
  console.log('Page load event fired')
  // Record metrics once page is fully loaded
  await recordPageMetrics()
})

// Listen for SPA navigation (History API)
let previousUrl = window.location.href
const urlObserver = new MutationObserver(async () => {
  const currentUrl = window.location.href
  if (currentUrl !== previousUrl) {
    console.log('URL changed from', previousUrl, 'to', currentUrl)
    previousUrl = currentUrl
    // Wait a bit for the SPA to render new content
    setTimeout(async () => {
      await recordPageMetrics()
    }, 500)
  }
})

// Start observing DOM changes to detect SPA navigation
urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
})

// Also listen to popstate and pushState events
window.addEventListener('popstate', async () => {
  console.log('Popstate event fired')
  setTimeout(async () => {
    await recordPageMetrics()
  }, 500)
})

// Intercept pushState and replaceState
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
  originalPushState.apply(this, args)
  console.log('pushState detected')
  setTimeout(async () => {
    await recordPageMetrics()
  }, 500)
}

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args)
  console.log('replaceState detected')
  setTimeout(async () => {
    await recordPageMetrics()
  }, 500)
}

initializeMetricsCollection()

console.log('Content script loaded on:', window.location.href)
