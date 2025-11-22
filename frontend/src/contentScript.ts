/**
 * Content script injected into web pages
 * Collects page metrics and sends them to background worker for API calls
 * Only records metrics once when page loads
 */

let hasRecordedMetrics = false

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
    const response = await chrome.runtime.sendMessage({
      type: 'COLLECT_METRICS',
      data: {
        url: metrics.url,
        link_count: metrics.linkCount,
        word_count: metrics.wordCount,
        image_count: metrics.imageCount,
        datetime_visited: new Date().toISOString(),
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
 * Send metrics to backend once
 */
async function recordPageMetrics() {
  if (hasRecordedMetrics) {
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
    hasRecordedMetrics = true
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

initializeMetricsCollection()

console.log('Content script loaded on:', window.location.href)
