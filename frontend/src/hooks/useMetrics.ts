import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'
import type { PageMetrics, PageMetric } from '../types/metrics'
import { MESSAGE_TYPES, NAVIGATION, TIMING } from '../constants'
import { showToast } from '../utils/toast'

interface UseMetricsResult {
  metrics: PageMetrics | null
  visits: PageMetric[]
  loading: boolean
  error: Error | null
  noData: boolean
  refetch: () => Promise<void>
}

/**
 * Fetch metrics and visits data from API
 */
async function fetchMetricsData(url: string) {
  return Promise.all([
    apiService.getMetrics(url),
    apiService.getVisits(url),
  ])
}

/**
 * Determine if there's any data to display
 */
function hasNoData(metricsData: PageMetrics | null, visitsData: PageMetric[]): boolean {
  return !metricsData && visitsData.length === 0
}

/**
 * Check if a URL is restricted and should not be tracked
 */
function isRestrictedUrl(url: string | null): boolean {
  if (!url) return true
  return NAVIGATION.RESTRICTED_PREFIXES.some(prefix => url.startsWith(prefix))
}

export function useMetrics(url: string | null): UseMetricsResult {
  const [metrics, setMetrics] = useState<PageMetrics | null>(null)
  const [visits, setVisits] = useState<PageMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [noData, setNoData] = useState(false)

  const fetchAndUpdateMetrics = useCallback(async () => {
    if (!url) return

    // Skip fetching for restricted URLs
    if (isRestrictedUrl(url)) {
      setMetrics(null)
      setVisits([])
      setNoData(true)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [metricsData, visitsData] = await fetchMetricsData(url)
      setNoData(hasNoData(metricsData, visitsData))
      setMetrics(metricsData)
      setVisits(visitsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to load data. Please try again later.'
      setError(err instanceof Error ? err : new Error(errorMessage))
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchAndUpdateMetrics()
    const interval = setInterval(fetchAndUpdateMetrics, TIMING.METRICS_UI_REFRESH_INTERVAL)
    
    // Listen for metrics collection from content script
    const handleMessage = (message: { type: string }) => {
      if (message.type === MESSAGE_TYPES.POSTING_END) {
        // Metrics were just posted, refetch immediately
        console.log('Metrics posted, refreshing data')
        fetchAndUpdateMetrics()
      }
    }
    
    chrome.runtime.onMessage.addListener(handleMessage)
    
    return () => {
      clearInterval(interval)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [fetchAndUpdateMetrics])

  return { metrics, visits, loading, error, noData, refetch: fetchAndUpdateMetrics }
}

