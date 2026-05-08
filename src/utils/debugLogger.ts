/**
 * Debug Logger Utility
 *
 * Verbose console output gated by the ``enableDebugLogs`` feature flag,
 * which is fetched from the backend on app boot. Errors are always logged.
 *
 * Usage:
 *   import { debugLog, debugWarn, debugError } from '@/utils/debugLogger'
 *   debugLog('🔌 Socket connected')
 *
 * The flag is read via a registered accessor (set by store.ts after
 * configureStore returns) so this module does NOT import the store —
 * importing it would create a circular dependency that leaves store
 * exports in TDZ during module evaluation.
 */

type FlagAccessor = () => boolean

let isEnabled: FlagAccessor = () => false

export const setDebugLogsAccessor = (accessor: FlagAccessor): void => {
  isEnabled = accessor
}

function safeIsEnabled(): boolean {
  try {
    return isEnabled() === true
  } catch {
    return false
  }
}

export const debugLog = (...args: unknown[]): void => {
  if (safeIsEnabled()) {
    console.log(...args)
  }
}

export const debugWarn = (...args: unknown[]): void => {
  if (safeIsEnabled()) {
    console.warn(...args)
  }
}

export const debugError = (...args: unknown[]): void => {
  console.error(...args)
}

export const debugGroup = (label: string, ...args: unknown[]): void => {
  if (safeIsEnabled()) {
    console.group(label)
    args.forEach((arg) => console.log(arg))
    console.groupEnd()
  }
}

export const debugTable = (data: unknown): void => {
  if (safeIsEnabled()) {
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
