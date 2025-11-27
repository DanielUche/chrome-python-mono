import type { PageMetric, PageMetrics, PageMetricCreateDTO } from '../types/metrics'
import { getTimezoneOffset } from '../utils/timezone'

const { VITE_API_URL } = import.meta.env
const API_BASE_URL = VITE_API_URL || 'http://localhost:8000'

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
    const tzOffset = getTimezoneOffset()
    try {
      const response = await fetch(`${API_BASE_URL}/metrics?url=${encodeURIComponent(normalizedUrl)}&tz_offset=${tzOffset}`)
      if (response.status === 404) {
        return null // No metrics found for this URL
      }
      if (!response.ok) {
        throw new Error(`Unable to load metrics. Please try again later.`)
      }
      return response.json()
    } catch (error) {
      // Network error or backend is down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection or try again later.')
      }
      throw error
    }
  },

  /**
   * Fetch visit history for a specific URL
   */
  async getVisits(url: string, limit: number = 50): Promise<PageMetric[]> {
    const normalizedUrl = normalizeUrl(url)
    const tzOffset = getTimezoneOffset()
    try {
      const response = await fetch(
        `${API_BASE_URL}/visits?url=${encodeURIComponent(normalizedUrl)}&limit=${limit}&tz_offset=${tzOffset}`
      )
      if (response.status === 404) {
        return [] // No visits found for this URL
      }
      if (!response.ok) {
        throw new Error(`Unable to load visit history. Please try again later.`)
      }
      return response.json()
    } catch (error) {
      // Network error or backend is down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection or try again later.')
      }
      throw error
    }
  },

  /**
   * Record a new page visit with metrics
   */
  async recordVisit(visit: PageMetricCreateDTO): Promise<PageMetric> {
    try {
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
        throw new Error(`Unable to save metrics. Please try again later.`)
      }
      return response.json()
    } catch (error) {
      // Network error or backend is down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Metrics will be saved when connection is restored.')
      }
      throw error
    }
  },
}
