/**
 * Metrics and page data types
 */

export interface PageMetric {
  id: number
  url: string
  link_count: number
  word_count: number
  image_count: number
  datetime_visited: string
}

export interface PageMetrics {
  url: string
  link_count: number
  word_count: number
  image_count: number
  last_visited: string | null
  visit_count: number
}

export interface PageMetricCreateDTO {
  url: string
  link_count: number
  word_count: number
  image_count: number
  datetime_visited?: string
}

export interface CollectedMetrics {
  url: string
  linkCount: number
  wordCount: number
  imageCount: number
  timestamp: number
}
