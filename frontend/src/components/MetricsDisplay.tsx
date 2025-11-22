import type { PageMetrics } from '../types/metrics'
import { formatters } from '../utils/formatters'

interface Props {
  metrics: PageMetrics
}

export function MetricsDisplay({ metrics }: Props) {
  return (
    <section className="metrics-card">
      <h2>Page Metrics</h2>

      <div className="metrics-grid">
        <div className="metric-item">
          <label>Links Found</label>
          <span className="metric-value">{formatters.formatNumber(metrics.link_count)}</span>
        </div>

        <div className="metric-item">
          <label>Words</label>
          <span className="metric-value">{formatters.formatNumber(metrics.word_count)}</span>
        </div>

        <div className="metric-item">
          <label>Images</label>
          <span className="metric-value">{formatters.formatNumber(metrics.image_count)}</span>
        </div>

        <div className="metric-item">
          <label>Visit Count</label>
          <span className="metric-value">{formatters.formatNumber(metrics.visit_count)}</span>
        </div>
      </div>

      <div className="metric-info">
        <p>
          <strong>Last Visited:</strong> {metrics.last_visited ? formatters.formatDate(metrics.last_visited) : 'Never'}
        </p>
        <p>
          <strong>URL:</strong> <code className="url-code">{formatters.formatUrl(metrics.url)}</code>
        </p>
      </div>
    </section>
  )
}
