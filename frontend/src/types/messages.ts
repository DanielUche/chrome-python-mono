/**
 * Extension message types for communication between scripts
 */

export type MessageType =
  | 'COLLECT_METRICS'
  | 'METRICS_COLLECTED'
  | 'GET_CURRENT_METRICS'
  | 'METRICS_UPDATED'
  | 'GET_ACTIVE_TAB_URL'
  | 'ERROR'

export interface ExtensionMessage<T = unknown> {
  type: MessageType
  data?: T
  error?: string
}

export interface MetricsPayload {
  url: string
  linkCount: number
  wordCount: number
  imageCount: number
}

export interface ErrorPayload {
  message: string
  code?: string
}
