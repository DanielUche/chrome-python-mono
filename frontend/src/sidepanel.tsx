/**
 * Main side panel React component
 * Serves as both the entry point and UI component for the Chrome extension sidepanel
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect, useState, useCallback } from 'react'
import { useMetrics } from './hooks/useMetrics'
import { MetricsDisplay } from './components/MetricsDisplay'
import { VisitHistory } from './components/VisitHistory'
import { LoadingSpinner } from './components/LoadingSpinner'
import { chromeService } from './services/chrome'
import { MESSAGE_TYPES } from './constants'
import './styles/globals.css'

function SidePanelComponent() {
  const [url, setUrl] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const { metrics, visits, loading, error, noData } = useMetrics(url)

  // Handle tab URL changes
  const handleTabUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl)
  }, [])

  // Handle extension messages
  const handleMessage = useCallback((message: { type: string }) => {
    if (message.type === MESSAGE_TYPES.POSTING_START) {
      setIsPosting(true)
    } else if (message.type === MESSAGE_TYPES.POSTING_END) {
      setIsPosting(false)
    }
  }, [])

  useEffect(() => {
    // Get current tab on mount
    chromeService.getCurrentTab().then((tab) => {
      if (tab?.url) {
        handleTabUrlChange(tab.url)
      }
    })

    // Setup tab listeners
    const handleTabUpdate = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.url) {
        handleTabUrlChange(tab.url)
      }
    }

    const handleTabActivated = async (activeInfo: { tabId: number }) => {
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
        {loading && <LoadingSpinner />}

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
        <SidePanelComponent />
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
