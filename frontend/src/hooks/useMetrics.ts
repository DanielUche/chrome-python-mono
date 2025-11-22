import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { PageMetrics, PageMetric } from '../types/metrics'

interface UseMetricsResult {
  metrics: PageMetrics | null
  visits: PageMetric[]
  loading: boolean
  error: Error | null
  noData: boolean
  refetch: () => Promise<void>
}

export function useMetrics(url: string | null): UseMetricsResult {
  const [metrics, setMetrics] = useState<PageMetrics | null>(null)
  const [visits, setVisits] = useState<PageMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [noData, setNoData] = useState(false)

  useEffect(() => {
    if (!url) return

    const fetchMetrics = async () => {
      setLoading(true)
      setError(null)
      setNoData(false)
      try {
        const [metricsData, visitsData] = await Promise.all([
          apiService.getMetrics(url),
          apiService.getVisits(url),
        ])
        
        if (!metricsData && visitsData.length === 0) {
          setNoData(true)
          setMetrics(null)
          setVisits([])
        } else {
          setMetrics(metricsData)
          setVisits(visitsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'))
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [url])

  const refetch = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setNoData(false)
    try {
      const [metricsData, visitsData] = await Promise.all([
        apiService.getMetrics(url),
        apiService.getVisits(url),
      ])
      
      if (!metricsData && visitsData.length === 0) {
        setNoData(true)
        setMetrics(null)
        setVisits([])
      } else {
        setMetrics(metricsData)
        setVisits(visitsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'))
    } finally {
      setLoading(false)
    }
  }

  return { metrics, visits, loading, error, noData, refetch }
}
