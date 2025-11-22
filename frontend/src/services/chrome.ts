import type { ExtensionMessage } from '../types/messages'

export const chromeService = {

  sendToBackground<T>(message: ExtensionMessage<T>) {
    return chrome.runtime.sendMessage(message)
  },

  /**
   * Listen for messages from background script
   * Returns the listener function for cleanup
   */
  onMessage(
    callback: (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => void
  ) {
    chrome.runtime.onMessage.addListener(callback)
    // Return the callback so it can be removed later
    return callback
  },

  /**
   * Remove message listener
   */
  offMessage(
    callback: (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => void
  ) {
    chrome.runtime.onMessage.removeListener(callback)
  },

  /**
   * Get current active tab
   */
  async getCurrentTab(): Promise<chrome.tabs.Tab | null> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    return tabs[0] || null
  },

  /**
   * Execute script in current tab
   */
  async executeScript(code: string) {
    const tab = await this.getCurrentTab()
    if (!tab?.id) throw new Error('No active tab found')
    return chrome.tabs.executeScript(tab.id, { code })
  },
}
