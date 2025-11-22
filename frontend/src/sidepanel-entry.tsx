import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SidePanel from './sidepanel'

console.log('Sidepanel entry point loaded')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found in sidepanel.html')
  throw new Error('Root element not found')
}

console.log('Root element found, mounting React app')

try {
  createRoot(rootElement).render(
    <StrictMode>
      <SidePanel />
    </StrictMode>,
  )
  console.log('React app mounted successfully')
} catch (error) {
  console.error('Error mounting React app:', error)
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Error loading extension: ${error instanceof Error ? error.message : 'Unknown error'}</div>`
}
