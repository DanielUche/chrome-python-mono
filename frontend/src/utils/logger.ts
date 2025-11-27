/**
 * Logging utility using loglevel npm package
 * Usage: import { logger } from './utils/logger'
 */

import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

const { DEV, MODE } = import.meta.env

// Configure log level based on environment
if (DEV || MODE === 'development') {
  log.setLevel('debug')
} else {
  log.setLevel('info')
}

// Configure prefix to show timestamp and log level
prefix.reg(log)
prefix.apply(log, {
  format(level, _name, timestamp) {
    return `[${timestamp}] ${level.toUpperCase()}:`
  },
})

// Export single logger instance - use it anywhere
export const logger = log


