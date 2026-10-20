export type RunnerLanguage = 'python' | 'javascript'

export const PYODIDE_VERSION = '314.0.7'
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
export const RUN_TIMEOUT_MS = 30_000

const LANGUAGE_ALIASES: Record<string, RunnerLanguage> = {
  python: 'python',
  py: 'python',
  python3: 'python',
  javascript: 'javascript',
  js: 'javascript',
  mjs: 'javascript',
}

export const RUNNER_LABELS: Record<RunnerLanguage, string> = {
  python: `Python 3.14`,
  javascript: 'JavaScript',
}

/** The in-browser runtime for a fence or file language, if one exists. */
export const runnerFor = (language: string): RunnerLanguage | null =>
  LANGUAGE_ALIASES[language.trim().toLowerCase()] ?? null

/** Programs that read input need a stdin box before they run. */
export const readsInput = (language: RunnerLanguage, code: string): boolean =>
  language === 'python' ? /\binput\s*\(/.test(code) : /\bprompt\s*\(/.test(code)

export interface RunRequest {
  runId: number
  code: string
  stdin: string
}

export type OutputStream = 'stdout' | 'stderr'

export type RunnerEvent =
  | { type: 'status'; runId: number; message: string }
  | { type: 'stream'; runId: number; stream: OutputStream; text: string }
  | { type: 'done'; runId: number; durationMs: number; figures: string[] }
  | { type: 'failed'; runId: number; durationMs: number; error: string }
