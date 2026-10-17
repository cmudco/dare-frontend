import type { OutputStream, RunRequest, RunnerEvent } from './protocol'

const post = (event: RunnerEvent) =>
  (
    self as unknown as { postMessage: (event: RunnerEvent) => void }
  ).postMessage(event)

const format = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.stack ?? value.message
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { runId, code, stdin } = event.data
  const started = performance.now()
  const elapsed = () => Math.round(performance.now() - started)
  const write =
    (stream: OutputStream) =>
    (...args: unknown[]) =>
      post({
        type: 'stream',
        runId,
        stream,
        text: `${args.map(format).join(' ')}\n`,
      })

  const inputLines = stdin.length ? stdin.split('\n') : []
  const scope = self as unknown as Record<string, unknown>
  scope.console = {
    ...console,
    log: write('stdout'),
    info: write('stdout'),
    debug: write('stdout'),
    table: write('stdout'),
    warn: write('stderr'),
    error: write('stderr'),
  }
  scope.prompt = (message = '') => {
    const line = inputLines.shift() ?? null
    post({
      type: 'stream',
      runId,
      stream: 'stdout',
      text: `${message}${line ?? ''}\n`,
    })
    return line
  }

  try {
    // Async wrapper so snippets can use top-level await.
    const program = new Function(`return (async () => {\n${code}\n})()`)
    await program()
    post({ type: 'done', runId, durationMs: elapsed(), figures: [] })
  } catch (error) {
    post({ type: 'failed', runId, durationMs: elapsed(), error: format(error) })
  }
}
