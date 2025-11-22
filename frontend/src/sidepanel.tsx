/**
 * Main side panel React component
 */

import { useEffect, useState } from 'react'
import { useMetrics } from './hooks/useMetrics'
import { MetricsDisplay } from './components/MetricsDisplay'
import { VisitHistory } from './components/VisitHistory'
import { LoadingSpinner } from './components/LoadingSpinner'
import { chromeService } from './services/chrome'
import './styles/globals.css'

export default function SidePanel() {
  const [url, setUrl] = useState<string | null>(null)
  const { metrics, visits, loading, error, noData } = useMetrics(url)

  useEffect(() => {
    // Get current tab on mount
    chromeService.getCurrentTab().then((tab) => {
      if (tab?.url) {
        setUrl(tab.url)
      }
    })

    // Listen for tab changes
    const handleTabUpdate = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.url) {
        setUrl(tab.url)
      }
    }

    chrome.tabs.onUpdated.addListener(handleTabUpdate)
    chrome.tabs.onActivated.addListener(async ({ tabId }) => {
      const tab = await chrome.tabs.get(tabId)
      if (tab.url) {
        setUrl(tab.url)
      }
    })

    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdate)
    }
  }, [])

  return (
    <div className="sidepanel">
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
