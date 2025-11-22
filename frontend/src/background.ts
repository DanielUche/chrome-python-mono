/**
 * Background service worker for the Chrome extension
 * Handles API calls (which bypass CORS restrictions)
 */

import type { ExtensionMessage } from "./types/messages";
import { apiService } from "./services/api";
import type { PageMetricCreateDTO } from "./types/metrics";
import { MESSAGE_TYPES } from "./constants";

// Listen for extension icon clicks to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});

// Listen for messages from content scripts and side panel
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    // Handle messages asynchronously
    (async () => {
      try {
        console.log('Background: Received message:', message.type);
        
        if (message.type === 'COLLECT_METRICS') {
          const payload = message.data as PageMetricCreateDTO;
          const result = await apiService.recordVisit({
            url: payload.url,
            link_count: payload.link_count,
            word_count: payload.word_count,
            image_count: payload.image_count,
            datetime_visited: payload.datetime_visited,
          });
          
          // Notify sidepanel that metrics were posted
          try {
            await chrome.runtime.sendMessage({
              type: MESSAGE_TYPES.POSTING_END,
            });
          } catch {
            // Sidepanel might not be open, that's ok
          }
          
          sendResponse({ success: true, data: result });
        } else {
          sendResponse({ success: true });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Background: Error handling message:', errorMsg);
        sendResponse({ success: false, error: errorMsg });
      }
    })();
    
    return true; // Keep channel open for async response
  }
);

console.log("Background service worker loaded");



