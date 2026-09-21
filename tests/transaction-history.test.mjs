import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

async function load(source) {
  const result = await build({
    entryPoints: [source],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  )
}
const { collectTransactionHistory, filterTransactionHistory } = await load(
  'src/utils/transactionHistory.ts'
)
const { transactionsToCSV, transactionsToExcel } = await load(
  'src/utils/billingExportUtils.ts'
)
const row = (id, overrides = {}) => ({
  id,
  amount: '0.000001',
  referenceAmount: '0.012345',
  displayAmount: '$0.000001',
  type: 'Debit',
  source: 'usage',
  message: 'A, "quoted" message\nsecond line',
  llm: null,
  llmName: 'Proxy model',
  inputTokens: 0,
  outputTokens: 2,
  cachedInputTokens: 0,
  billingMode: 'Use Wallet Credits',
  platform: 'DARE',
  createdAt: '2026-09-21T12:34:56Z',
  ...overrides,
})
const page = (results, next = null) => ({
  results,
  next,
  previous: null,
  count: 23,
  summary: { all: 23, wallet: 23, ownApi: 0, litellm: 0 },
})

test('collects all pages, including the short final page', async () => {
  const calls = []
  const history = await collectTransactionHistory(async (number) => {
    calls.push(number)
    const count = number === 3 ? 3 : 10
    return page(
      Array.from({ length: count }, (_, i) => row((number - 1) * 10 + i)),
      number < 3 ? `/api/billing/transactions/?page=${number + 1}` : null
    )
  })
  assert.deepEqual(calls, [1, 2, 3])
  assert.equal(history.results.length, 23)
  assert.equal(history.next, null)
  assert.ok(transactionsToCSV(history.results).includes('"22"'))
})

test('handles empty history and rejects partial or non-advancing responses', async () => {
  assert.equal(
    (await collectTransactionHistory(async () => ({ ...page([]), count: 0 })))
      .count,
    0
  )
  await assert.rejects(
    collectTransactionHistory(async (number) => {
      if (number === 2) throw new Error('Offline')
      return page([row(1)], '?page=2')
    }),
    /Offline/
  )
  await assert.rejects(
    collectTransactionHistory(async () => page([row(1)], '?page=1')),
    /complete transaction history/
  )
})

test('stops collecting after cancellation', async () => {
  const controller = new AbortController()
  let calls = 0
  await assert.rejects(
    collectTransactionHistory(async () => {
      calls++
      controller.abort()
      return page([row(1)], '?page=2')
    }, controller.signal),
    { name: 'AbortError' }
  )
  assert.equal(calls, 1)
})

test('filters all rows with inclusive local dates and counts tabs before mode filtering', () => {
  const rows = [
    row(1, { createdAt: new Date(2026, 8, 21, 0, 0, 0).toISOString() }),
    row(2, {
      createdAt: new Date(2026, 8, 21, 23, 59, 59).toISOString(),
      billingMode: 'Use Own API Keys',
    }),
    row(3, { createdAt: new Date(2026, 8, 22, 0, 0, 0).toISOString() }),
    row(4, { platform: 'SocraticBots' }),
    row(5, { llmName: 'Different model' }),
  ]
  const filters = {
    platform: 'DARE',
    tab: 'all',
    model: 'Proxy model',
    startDate: '2026-09-21',
    endDate: '2026-09-21',
  }
  assert.deepEqual(
    filterTransactionHistory(rows, filters).transactions.map((t) => t.id),
    [1, 2]
  )
  const wallet = filterTransactionHistory(rows, { ...filters, tab: 'wallet' })
  assert.deepEqual(
    wallet.transactions.map((t) => t.id),
    [1]
  )
  assert.deepEqual(wallet.summary, { all: 2, wallet: 1, ownApi: 1, litellm: 0 })
})

test('exports unrounded numeric costs, zero tokens, proxy model names and full timestamps', () => {
  const csv = transactionsToCSV([row(1)])
  assert.ok(csv.includes('"0.000001","0.012345"'))
  assert.ok(csv.includes('"Proxy model","0","2","0"'))
  assert.ok(csv.includes('2026-09-21T12:34:56Z'))
  assert.ok(csv.includes('A, ""quoted"" message\nsecond line'))
  const excel = transactionsToExcel([row(1)])
  assert.ok(excel.includes('ss:Format="0.000000"'))
  assert.ok(excel.includes('<Data ss:Type="Number">0.000001</Data>'))
  assert.ok(excel.includes('<Data ss:Type="Number">0.012345</Data>'))
  assert.ok(
    !transactionsToExcel([row(2, { referenceAmount: null })]).includes('>null<')
  )
})

test('escapes text and neutralizes spreadsheet formulas without changing negative costs', () => {
  const csv = transactionsToCSV([
    row(1, { amount: '-0.000001', message: '=HYPERLINK("bad")' }),
  ])
  assert.ok(csv.includes('"\'=HYPERLINK'))
  assert.ok(csv.includes('"-0.000001"'))
  const excel = transactionsToExcel([row(1, { message: '<tag>&\u0001' })])
  assert.ok(excel.includes('&lt;tag&gt;&amp;'))
  assert.ok(!excel.includes('\u0001'))
})

test('rejects a truncated history instead of exporting a partial file', async () => {
  await assert.rejects(
    collectTransactionHistory(async () => page([row(1)])),
    /history changed/
  )
})
