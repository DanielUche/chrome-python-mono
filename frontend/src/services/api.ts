import type { PageMetric, PageMetrics, PageMetricCreateDTO } from '../types/metrics'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Normalize URL by removing trailing slash (must match backend normalization)
 */
function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '') || '/'
}

export const apiService = {
  /**
   * Fetch metrics for a specific URL
   */
  async getMetrics(url: string): Promise<PageMetrics | null> {
    const normalizedUrl = normalizeUrl(url)
    const response = await fetch(`${API_BASE_URL}/metrics?url=${encodeURIComponent(normalizedUrl)}`)
    if (response.status === 404) {
      return null // No metrics found for this URL
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`)
    }
    return response.json()
  },

  /**
   * Fetch visit history for a specific URL
   */
  async getVisits(url: string, limit: number = 50): Promise<PageMetric[]> {
    const normalizedUrl = normalizeUrl(url)
    const response = await fetch(
      `${API_BASE_URL}/visits?url=${encodeURIComponent(normalizedUrl)}&limit=${limit}`
    )
    if (response.status === 404) {
      return [] // No visits found for this URL
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch visits: ${response.statusText}`)
    }
    return response.json()
  },

  /**
   * Record a new page visit with metrics
   */
  async recordVisit(visit: PageMetricCreateDTO): Promise<PageMetric> {
    const response = await fetch(`${API_BASE_URL}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...visit,
        url: normalizeUrl(visit.url),
      }),
    })
    if (!response.ok) {
      throw new Error(`Failed to record visit: ${response.statusText}`)
    }
    return response.json()
  },
}
