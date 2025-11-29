export function MetricsDisplaySkeleton() {
  return (
    <div className="metrics-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
      </div>
      
      <div className="skeleton-stats">
        <div className="skeleton-stat">
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
        <div className="skeleton-stat">
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
        <div className="skeleton-stat">
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
        <div className="skeleton-stat">
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
      </div>
    </div>
  )
}

export function VisitHistorySkeleton() {
  return (
    <div className="history-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
      </div>
      
      <div className="skeleton-list">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-text"></div>
            <div className="skeleton-text-sm"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyStateSkeleton() {
  return (
    <div className="empty-skeleton">
      <div className="skeleton-icon"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
    </div>
  )
}

