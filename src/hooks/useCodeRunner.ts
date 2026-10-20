import { useCallback, useEffect, useRef, useState } from 'react'
import { RUN_TIMEOUT_MS } from '@/utils/codeRunner/protocol'
import type {
  OutputStream,
  RunnerEvent,
  RunnerLanguage,
} from '@/utils/codeRunner/protocol'

export type RunStatus = 'idle' | 'running' | 'done' | 'failed' | 'stopped'

/** A run of output text from one stream, exactly as the program wrote it. */
export interface RunOutputChunk {
  stream: OutputStream
  text: string
}

export interface CodeRunState {
  status: RunStatus
  progress: string
  output: RunOutputChunk[]
  figures: string[]
  error: string | null
  durationMs: number | null
}

const IDLE: CodeRunState = {
  status: 'idle',
  progress: '',
  output: [],
  figures: [],
  error: null,
  durationMs: null,
}

let nextRunId = 1

// One Python runtime per tab: Pyodide takes seconds to boot, so blocks share
// it. JavaScript gets a fresh worker per run, which is cheap and isolated.
let pythonWorker: Worker | null = null
const getPythonWorker = () => {
  pythonWorker ??= new Worker(
    new URL('../utils/codeRunner/python.worker.ts', import.meta.url),
    { type: 'module' }
  )
  return pythonWorker
}
const resetPythonWorker = () => {
  pythonWorker?.terminate()
  pythonWorker = null
}

const createWorker = (language: RunnerLanguage) =>
  language === 'python'
    ? getPythonWorker()
    : new Worker(
        new URL('../utils/codeRunner/javascript.worker.ts', import.meta.url),
        { type: 'module' }
      )

/** Run code in a sandboxed browser worker, with a timeout and a stop control. */
export const useCodeRunner = (language: RunnerLanguage) => {
  const [state, setState] = useState<CodeRunState>(IDLE)
  const active = useRef<{
    runId: number
    worker: Worker
    timer: ReturnType<typeof setTimeout>
    listener: (event: MessageEvent<RunnerEvent>) => void
  } | null>(null)

  const finish = useCallback(
    (terminate: boolean) => {
      const run = active.current
      if (!run) return
      clearTimeout(run.timer)
      run.worker.removeEventListener('message', run.listener)
      if (language === 'javascript') run.worker.terminate()
      else if (terminate) resetPythonWorker()
      active.current = null
    },
    [language]
  )

  const stop = useCallback(
    (reason: string | null = null) => {
      if (!active.current) return
      finish(true)
      setState((previous) => ({
        ...previous,
        status: 'stopped',
        progress: '',
        error: reason,
      }))
    },
    [finish]
  )

  const run = useCallback(
    (code: string, stdin = '') => {
      finish(true)
      const runId = nextRunId++
      const worker = createWorker(language)
      setState({ ...IDLE, status: 'running', progress: 'Starting…' })

      const listener = ({ data }: MessageEvent<RunnerEvent>) => {
        if (data.runId !== runId) return
        if (data.type === 'status') {
          setState((previous) => ({ ...previous, progress: data.message }))
        } else if (data.type === 'stream') {
          setState((previous) => {
            const last = previous.output[previous.output.length - 1]
            const output =
              last?.stream === data.stream
                ? [
                    ...previous.output.slice(0, -1),
                    { stream: data.stream, text: last.text + data.text },
                  ]
                : [...previous.output, { stream: data.stream, text: data.text }]
            return { ...previous, output }
          })
        } else {
          finish(false)
          setState((previous) => ({
            ...previous,
            status: data.type === 'done' ? 'done' : 'failed',
            progress: '',
            durationMs: data.durationMs,
            figures: data.type === 'done' ? data.figures : [],
            error: data.type === 'failed' ? data.error : null,
          }))
        }
      }
      worker.addEventListener('message', listener)
      const timer = setTimeout(
        () =>
          stop(
            `Stopped after ${RUN_TIMEOUT_MS / 1000}s. Check for an infinite loop.`
          ),
        RUN_TIMEOUT_MS
      )
      active.current = { runId, worker, timer, listener }
      worker.postMessage({ runId, code, stdin })
    },
    [finish, language, stop]
  )

  const clear = useCallback(() => setState(IDLE), [])

  useEffect(() => () => finish(true), [finish])

  return { ...state, run, stop: () => stop(), clear }
}
