import { PYODIDE_INDEX_URL } from './protocol'
import type { RunRequest, RunnerEvent } from './protocol'

interface PyProxy {
  destroy(): void
  set(key: string, value: unknown): void
}

interface PyodideRuntime {
  globals: { get(name: string): () => PyProxy }
  loadPackagesFromImports(
    code: string,
    options: { messageCallback: (message: string) => void }
  ): Promise<void>
  runPythonAsync(code: string, options?: { globals: PyProxy }): Promise<unknown>
  setStdout(options: { write: (buffer: Uint8Array) => number }): void
  setStderr(options: { write: (buffer: Uint8Array) => number }): void
  setStdin(options: { stdin: () => string | null }): void
}

type LoadPyodide = (options: { indexURL: string }) => Promise<PyodideRuntime>

const post = (event: RunnerEvent) =>
  (
    self as unknown as { postMessage: (event: RunnerEvent) => void }
  ).postMessage(event)

// Charts: render off-screen and hand PNGs back instead of opening a window.
const PREPARE_MATPLOTLIB = `
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as _plt
_plt.show = lambda *args, **kwargs: None
`

const COLLECT_FIGURES = `
import base64 as _b64, io as _io, sys as _sys
_figures = []
if "matplotlib.pyplot" in _sys.modules:
    import matplotlib.pyplot as _plt
    for _n in _plt.get_fignums():
        _buf = _io.BytesIO()
        _plt.figure(_n).savefig(_buf, format="png", bbox_inches="tight", dpi=110)
        _figures.append(_b64.b64encode(_buf.getvalue()).decode())
    _plt.close("all")
"\\n".join(_figures)
`

let runtime: Promise<PyodideRuntime> | null = null
let queue: Promise<void> = Promise.resolve()

const loadRuntime = (runId: number) => {
  if (!runtime) {
    post({ type: 'status', runId, message: 'Starting Python…' })
    runtime = import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`).then(
      (module: { loadPyodide: LoadPyodide }) =>
        module.loadPyodide({ indexURL: PYODIDE_INDEX_URL })
    )
  }
  return runtime
}

// Pyodide prefixes tracebacks with its own frames; start at the user's code.
const cleanTraceback = (message: string) => {
  const lines = message.split('\n')
  const first = lines.findIndex((line) => line.includes('File "<exec>"'))
  return first > 0
    ? ['Traceback (most recent call last):', ...lines.slice(first)].join('\n')
    : message
}

const execute = async ({ runId, code, stdin }: RunRequest) => {
  const started = performance.now()
  const elapsed = () => Math.round(performance.now() - started)
  try {
    const py = await loadRuntime(runId)
    const inputLines = stdin.length ? stdin.split('\n') : []
    // Raw writes keep prompts like `input("Name? ")` on the same line as the
    // echoed answer, the way a terminal shows them.
    const writer = (stream: 'stdout' | 'stderr') => {
      const decoder = new TextDecoder()
      return (buffer: Uint8Array) => {
        const text = decoder.decode(buffer, { stream: true })
        if (text) post({ type: 'stream', runId, stream, text })
        return buffer.length
      }
    }
    py.setStdout({ write: writer('stdout') })
    py.setStderr({ write: writer('stderr') })
    py.setStdin({
      stdin: () => {
        const line = inputLines.shift()
        if (line === undefined) return null
        post({ type: 'stream', runId, stream: 'stdout', text: `${line}\n` })
        return line
      },
    })

    await py.loadPackagesFromImports(code, {
      messageCallback: (message) => {
        if (message.startsWith('Loading')) {
          post({ type: 'status', runId, message: 'Installing packages…' })
        }
      },
    })
    post({ type: 'status', runId, message: 'Running…' })

    const namespace = py.globals.get('dict')()
    // Scripts guarded by `if __name__ == "__main__":` must run like a file.
    namespace.set('__name__', '__main__')
    try {
      if (/\bmatplotlib\b/.test(code)) {
        await py.runPythonAsync(PREPARE_MATPLOTLIB, { globals: namespace })
      }
      await py.runPythonAsync(code, { globals: namespace })
      const figures = String(
        await py.runPythonAsync(COLLECT_FIGURES, { globals: namespace })
      )
      post({
        type: 'done',
        runId,
        durationMs: elapsed(),
        figures: figures ? figures.split('\n') : [],
      })
    } finally {
      namespace.destroy()
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    post({
      type: 'failed',
      runId,
      durationMs: elapsed(),
      error: cleanTraceback(message),
    })
  }
}

self.onmessage = (event: MessageEvent<RunRequest>) => {
  queue = queue.then(() => execute(event.data))
}
