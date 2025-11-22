
import type { PageMetric } from '../types/metrics'
import { formatters } from '../utils/formatters'

interface Props {
  visits: PageMetric[]
}

export function VisitHistory({ visits }: Props) {
  if (visits.length === 0) {
    return null
  }

  return (
    <section className="visits-card">
      <h3>Recent Visits</h3>

      <div className="visits-list">
        {visits.slice(0, 5).map((visit) => (
          <div key={visit.id} className="visit-item">
            <div className="visit-header">
              <span className="visit-time">{formatters.formatTimeAgo(visit.datetime_visited)}</span>
              <span className="visit-date">{formatters.formatDate(visit.datetime_visited)}</span>
            </div>

            <div className="visit-stats">
              <span className="stat-badge">{visit.link_count} links</span>
              <span className="stat-badge">{visit.word_count} words</span>
              <span className="stat-badge">{visit.image_count} images</span>
            </div>
          </div>
        ))}
      </div>

      {visits.length > 5 && (
        <p className="visits-more">+{visits.length - 5} more visits</p>
      )}
    </section>
  )
}
