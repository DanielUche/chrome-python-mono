import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Chrome API
window.chrome = {
  tabs: {
    query: vi.fn(async () => [{ id: 1, url: 'https://example.com' }]),
    get: vi.fn(),
    onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
    onActivated: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  runtime: {
    sendMessage: vi.fn(async () => ({})),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  storage: {
    local: {
      get: vi.fn(async () => ({})),
      set: vi.fn(async () => {}),
      remove: vi.fn(async () => {}),
      clear: vi.fn(async () => {}),
    },
  },
  sidePanel: {
    open: vi.fn(async () => {}),
  },
  action: {
    onClicked: { addListener: vi.fn() },
  },
} as unknown as typeof chrome
