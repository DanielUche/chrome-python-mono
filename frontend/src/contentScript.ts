/**
 * Content script injected into web pages
 * Collects page metrics and sends them to background worker
 * Only sends metrics when the tab is active
 */

import { TIMING } from './constants/timing'

let metricsIntervalId: number | null = null
let isTabActive = false

/**
 * Check if the current tab is active and update flag
 */
async function updateTabActiveStatus() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const activeTabUrl = tabs[0]?.url
    const currentTabUrl = window.location.href
    isTabActive = activeTabUrl === currentTabUrl
  } catch (error) {
    console.warn('Could not determine tab active status:', error)
    isTabActive = true // Assume active if we can't check
  }
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
 * Stop sending metrics (when extension context is invalidated)
 */
function stopMetrics() {
  if (metricsIntervalId !== null) {
    clearInterval(metricsIntervalId)
    metricsIntervalId = null
    console.log('Stopped metrics collection due to extension invalidation')
  }
}

/**
 * Reinitialize metrics collection
 */
function reinitializeMetrics() {
  stopMetrics()
  sendMetrics()
  metricsIntervalId = window.setInterval(sendMetrics, TIMING.METRICS_COLLECTION_INTERVAL)
  console.log('Reinitialized metrics collection')
}

/**
 * Send metrics to background worker (only if tab is active)
 */
function sendMetrics() {
  // Only send metrics if this tab is active
  if (!isTabActive) {
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
      stopMetrics()
      return
    }

    chrome.runtime.sendMessage(
      {
        type: 'COLLECT_METRICS',
        data: metrics,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          // Extension context may have been invalidated
          const errorMsg = chrome.runtime.lastError?.message ?? ''
          if (errorMsg.includes('invalidated')) {
            console.warn('Extension context invalidated')
            stopMetrics()
          } else {
            console.error('Error sending metrics:', chrome.runtime.lastError)
          }
        } else {
          console.log('Metrics recorded:', response)
        }
      }
    )
  } catch (error) {
    console.error('Failed to send metrics:', error)
    stopMetrics()
  }
}

// Listen for extension reload (detect by trying to send a ping)
function setupExtensionReloadDetection() {
  setInterval(() => {
    if (chrome.runtime && metricsIntervalId === null) {
      // Extension context is back but metrics stopped - reinitialize
      console.log('Extension context restored, reinitializing metrics')
      reinitializeMetrics()
    }
  }, TIMING.EXTENSION_RELOAD_CHECK_INTERVAL)
}

// Send metrics when page finishes loading
async function initializeMetricsCollection() {
  // Check if tab is active before starting collection
  await updateTabActiveStatus()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await updateTabActiveStatus()
      console.log('DOMContentLoaded event fired, sending metrics')
      sendMetrics()
      // Start periodic collection after initial send
      metricsIntervalId = window.setInterval(sendMetrics, TIMING.METRICS_COLLECTION_INTERVAL)
    })
  } else {
    // DOM is already loaded (for content scripts injected on already-loaded pages)
    console.log('DOM already loaded, sending metrics immediately')
    sendMetrics()
    // Start periodic collection
    metricsIntervalId = window.setInterval(sendMetrics, TIMING.METRICS_COLLECTION_INTERVAL)
  }
}

// Also wait for page load to get more accurate metrics
window.addEventListener('load', async () => {
  await updateTabActiveStatus()
  console.log('Page load event fired')
  // Resend metrics after all resources loaded to get updated counts
  if (metricsIntervalId !== null) {
    sendMetrics()
  }
})

// Listen for tab visibility changes
document.addEventListener('visibilitychange', async () => {
  if (!document.hidden) {
    // Tab became visible/active
    await updateTabActiveStatus()
    if (isTabActive && metricsIntervalId === null) {
      console.log('Tab became active, reinitializing metrics collection')
      reinitializeMetrics()
    }
  }
})

initializeMetricsCollection()

// Setup detection for extension reloads
setupExtensionReloadDetection()

console.log('Content script loaded on:', window.location.href)
