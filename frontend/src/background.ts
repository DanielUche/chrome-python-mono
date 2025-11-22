/**
 * Background service worker for the Chrome extension
 * Handles tab updates, message passing, and API calls
 */

import { apiService } from "./services/api";
import type { ExtensionMessage, MetricsPayload } from "./types/messages";
import type { PageMetricCreateDTO } from "./types/metrics";
import { MESSAGE_TYPES } from "./constants/messages";

// Listen for extension icon clicks to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Listen for messages from content scripts and side panel
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    handleMessage(message, sender)
      .then((response) => sendResponse({ success: true, data: response }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
);

// Handle tab updates
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log(`Tab loaded: ${_tabId}`, tab.url);
    // TODO:, trigger metrics collection here
  }
});

/**
 * Process incoming messages
 */
async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case "COLLECT_METRICS": {
      const payload = message.data as MetricsPayload;
      return recordPageMetrics(payload);
    }
    case "GET_CURRENT_METRICS": {
      if (!sender.url) throw new Error("No URL available");
      return apiService.getMetrics(sender.url);
    }
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

/**
 * Record collected metrics to backend
 */
async function recordPageMetrics(payload: MetricsPayload): Promise<unknown> {
  // Notify all sidepanels that posting has started
  await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.POSTING_START }).catch(() => {
    // Ignore errors if no sidepanel is open
  });

  try {
    const visitData: PageMetricCreateDTO = {
      url: payload.url,
      link_count: payload.linkCount,
      word_count: payload.wordCount,
      image_count: payload.imageCount,
      datetime_visited: new Date().toISOString(),
    };
    const result = await apiService.recordVisit(visitData);
    return result;
  } finally {
    // Notify all sidepanels that posting has ended
    await chrome.runtime.sendMessage({ type: MESSAGE_TYPES.POSTING_END }).catch(() => {
      // Ignore errors if no sidepanel is open
    });
  }
}

console.log("Background service worker loaded");
