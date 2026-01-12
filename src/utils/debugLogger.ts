/**
 * Debug Logger Utility
 *
 * Provides environment-aware logging that only outputs in local/staging environments.
 * Uses the enableDebugLogs feature flag from environment config.
 *
 * Usage:
 *   import { debugLog, debugWarn, debugError } from '@/utils/debugLogger'
 *   debugLog('🔌 Socket connected')
 *   debugLog('📡 Event received:', data)
 */

import { features } from '@/config/environment'

/**
 * Log debug messages only when enableDebugLogs is true
 */
export const debugLog = (...args: unknown[]): void => {
  if (features.enableDebugLogs) {
    console.log(...args)
  }
}

/**
 * Log warning messages only when enableDebugLogs is true
 */
export const debugWarn = (...args: unknown[]): void => {
  if (features.enableDebugLogs) {
    console.warn(...args)
  }
}

/**
 * Log error messages - always shown regardless of environment
 * Errors should always be visible for debugging critical issues
 */
export const debugError = (...args: unknown[]): void => {
  console.error(...args)
}

/**
 * Log grouped debug messages only when enableDebugLogs is true
 */
export const debugGroup = (label: string, ...args: unknown[]): void => {
  if (features.enableDebugLogs) {
    console.group(label)
    args.forEach((arg) => console.log(arg))
    console.groupEnd()
  }
}

/**
 * Log table data only when enableDebugLogs is true
 */
export const debugTable = (data: unknown): void => {
  if (features.enableDebugLogs) {
    console.table(data)
  }
}

export default {
  log: debugLog,
  warn: debugWarn,
  error: debugError,
  group: debugGroup,
  table: debugTable,
}
