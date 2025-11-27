/**
 * Main side panel React component
 * Serves as both the entry point and UI component for the Chrome extension sidepanel
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect, useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMetrics } from './hooks/useMetrics'
import { MetricsDisplay } from './components/MetricsDisplay'
import { VisitHistory } from './components/VisitHistory'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import { showToast } from './utils/toast'
import { MetricsDisplaySkeleton, VisitHistorySkeleton } from './components/SkeletonLoaders'
import { chromeService } from './services/chrome'
import { MESSAGE_TYPES } from './constants'
import './styles/globals.css'

// Create a React Query client with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Continue using cached data when offline
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Queue mutations when offline
    },
  },
})

function SidePanelComponent() {
  const [url, setUrl] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const { metrics, visits, loading, error, noData } = useMetrics(url)

  // Handle tab URL changes
  const handleTabUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl)
  }, [])

  // Handle extension messages
  const handleMessage = useCallback((message: { type: string; success?: boolean; error?: string }) => {
    if (message.type === MESSAGE_TYPES.POSTING_START) {
      setIsPosting(true)
    } else if (message.type === MESSAGE_TYPES.POSTING_END) {
      setIsPosting(false)
      // Show only error toast (success is implicit when data refreshes)
      if (message.error) {
        showToast(`Failed to record metrics: ${message.error}`, 'error')
      }
    }
  }, [])

  useEffect(() => {
    // Get current tab on mount
    chromeService.getCurrentTab().then((tab) => {
      if (tab?.url) {
        handleTabUrlChange(tab.url)
      }
    })

    // Setup tab listeners - only process events for active tabs
    const handleTabUpdate = async (tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      // Only process if this is the active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab && tabId === activeTab.id && tab.url) {
        handleTabUrlChange(tab.url)
      }
    }

    const handleTabActivated = async (activeInfo: { tabId: number }) => {
      // Tab was activated, update URL immediately
      const tab = await chrome.tabs.get(activeInfo.tabId)
      if (tab.url) {
        handleTabUrlChange(tab.url)
      }
    }

    chrome.tabs.onUpdated.addListener(handleTabUpdate)
    chrome.tabs.onActivated.addListener(handleTabActivated)
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate)
      chrome.tabs.onActivated.removeListener(handleTabActivated)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [handleTabUrlChange, handleMessage])

  return (
    <div className="sidepanel">
      {isPosting && (
        <div className="posting-progress">
          <div className="progress-bar"></div>
        </div>
      )}
      <header className="sidepanel-header">
        <h1>Chrome Python Monitor</h1>
      </header>

      <main className="sidepanel-content">
        {loading && (
          <>
            <MetricsDisplaySkeleton />
            <VisitHistorySkeleton />
          </>
        )}

        {error && (
          <div className="error-message">
            <p>Error: {error.message}</p>
            <p className="error-hint">Make sure the backend API is running on http://localhost:8000</p>
          </div>
        )}

        {metrics && !loading && (
          <>
            <MetricsDisplay metrics={metrics} />
            <VisitHistory visits={visits} />
          </>
        )}

        {noData && !loading && !error && (
          <div className="empty-state">
            <p>No records found for this URL</p>
            <p className="empty-hint">Visit this page to collect metrics</p>
          </div>
        )}

        {!loading && !error && !metrics && !noData && (
          <div className="empty-state">
            <p>No metrics available for this page</p>
            <p className="empty-hint">Visit some websites to collect data</p>
          </div>
        )}
      </main>

      <footer className="sidepanel-footer">
        <p>Current URL: <code>{url}</code></p>
      </footer>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

// Mount React app
function initializeApp() {
  console.log('Sidepanel app initializing')

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('Root element not found in sidepanel.html')
    throw new Error('Root element not found')
  }

  console.log('Root element found, mounting React app')

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <SidePanelComponent />
          </ErrorBoundary>
        </QueryClientProvider>
      </StrictMode>,
    )
    console.log('React app mounted successfully')
  } catch (error) {
    console.error('Error mounting React app:', error)
    document.body.innerHTML = `<div style="color: red; padding: 20px;">Error loading extension: ${error instanceof Error ? error.message : 'Unknown error'}</div>`
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

export default SidePanelComponent
