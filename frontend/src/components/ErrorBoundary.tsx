/**
 * Error Boundary using react-error-boundary package
 * Catches React errors and displays a fallback UI
 */

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { logger } from '../utils/logger'

const { DEV } = import.meta.env

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <h2>⚠️ Something went wrong</h2>
        <p className="error-boundary-message">
          The application encountered an unexpected error and couldn't continue.
        </p>
        
        {DEV && (
          <details className="error-boundary-details">
            <summary>Error Details</summary>
            <pre className="error-boundary-stack">
              {error.toString()}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}
        
        <button 
          className="error-boundary-reset" 
          onClick={resetErrorBoundary}
          type="button"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('React Error Boundary caught an error', error, {
          componentStack: errorInfo.componentStack,
        })
      }}
      onReset={() => {
        // Optionally reset app state here
        logger.info('Error boundary reset')
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

