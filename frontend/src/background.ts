/**
 * Background service worker for the Chrome extension
 * Handles API calls (which bypass CORS restrictions)
 */

import type { ExtensionMessage } from "./types/messages";
import { apiService } from "./services/api";
import type { PageMetricCreateDTO } from "./types/metrics";
import { MESSAGE_TYPES } from "./constants";
import { logger } from "./utils/logger";

// Listen for extension icon clicks to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } catch (error) {
    logger.error('Error opening side panel', error, { tabId: tab.id });
  }
});

// Listen for messages from content scripts and side panel
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    // Handle messages asynchronously
    (async () => {
      try {
        logger.debug('Received message', { type: message.type });
        
        if (message.type === 'COLLECT_METRICS') {
          const payload = message.data as PageMetricCreateDTO;
          
          try {
            const result = await apiService.recordVisit({
              url: payload.url,
              link_count: payload.link_count,
              word_count: payload.word_count,
              image_count: payload.image_count,
              datetime_visited: payload.datetime_visited,
            });
            
            // Notify sidepanel that metrics were posted successfully
            try {
              await chrome.runtime.sendMessage({
                type: MESSAGE_TYPES.POSTING_END,
                success: true,
              });
            } catch {
              // Sidepanel might not be open, that's ok
            }
            
            sendResponse({ success: true, data: result });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            
            // Notify sidepanel of error
            try {
              await chrome.runtime.sendMessage({
                type: MESSAGE_TYPES.POSTING_END,
                success: false,
                error: errorMsg,
              });
            } catch {
              // Sidepanel might not be open, that's ok
            }
            
            throw error; // Re-throw to be caught by outer catch
          }
        } else {
          sendResponse({ success: true });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Error handling message', error, { messageType: message.type });
        sendResponse({ success: false, error: errorMsg });
      }
    })();
    
    return true; // Keep channel open for async response
  }
);

logger.info('Background service worker initialized');



