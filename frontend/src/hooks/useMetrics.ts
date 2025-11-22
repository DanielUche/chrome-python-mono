import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'
import type { PageMetrics, PageMetric } from '../types/metrics'
import { TIMING } from '../constants'

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

export function useMetrics(url: string | null): UseMetricsResult {
  const [metrics, setMetrics] = useState<PageMetrics | null>(null)
  const [visits, setVisits] = useState<PageMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [noData, setNoData] = useState(false)

  const fetchAndUpdateMetrics = useCallback(async () => {
    if (!url) return

    setLoading(true)
    setError(null)
    try {
      const [metricsData, visitsData] = await fetchMetricsData(url)
      setNoData(hasNoData(metricsData, visitsData))
      setMetrics(metricsData)
      setVisits(visitsData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'))
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchAndUpdateMetrics()
    const interval = setInterval(fetchAndUpdateMetrics, TIMING.METRICS_UI_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAndUpdateMetrics])

  return { metrics, visits, loading, error, noData, refetch: fetchAndUpdateMetrics }
}
