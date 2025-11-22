/**
 * Chrome storage service wrapper
 */

export const storageService = {
  /**
   * Get value from Chrome storage
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key)
    return result[key] as T | undefined
  },

  /**
   * Set value in Chrome storage
   */
  async set(key: string, value: unknown): Promise<void> {
    return chrome.storage.local.set({ [key]: value })
  },

  /**
   * Remove value from Chrome storage
   */
  async remove(key: string): Promise<void> {
    return chrome.storage.local.remove(key)
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    return chrome.storage.local.clear()
  },

  /**
   * Get all items from storage
   */
  async getAll(): Promise<Record<string, unknown>> {
    return chrome.storage.local.get(null)
  },
}
