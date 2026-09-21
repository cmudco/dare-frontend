import type { Transaction } from '@/redux/types/billing'

const headers = [
  'Transaction ID',
  'Amount (USD)',
  'Reference Cost (USD)',
  'Type',
  'Source',
  'Message',
  'LLM',
  'Input Tokens',
  'Output Tokens',
  'Cached Tokens',
  'Billing Mode',
  'Platform',
  'Related Group',
  'Timestamp (ISO 8601)',
]

function transactionRows(transactions: Transaction[]) {
  return transactions.map((t) => [
    t.id,
    t.amount,
    t.referenceAmount,
    t.type,
    t.source ?? '',
    t.message,
    t.llmName || t.llm?.name || 'N/A',
    t.inputTokens,
    t.outputTokens,
    t.cachedInputTokens ?? 0,
    t.billingMode,
    t.platform,
    t.relatedGroupCode ?? '',
    t.createdAt,
  ])
}

export function transactionsToCSV(transactions: Transaction[]) {
  const cell = (value: string | number | null) => {
    let text = String(value ?? '')
    // Quoting alone does not prevent spreadsheet formulas from executing.
    if (
      typeof value === 'string' &&
      /^[\s]*[=+@-]/.test(text) &&
      !/^-?\d+(\.\d+)?$/.test(text)
    )
      text = `'${text}`
    return `"${text.replace(/"/g, '""')}"`
  }
  return (
    '\uFEFF' +
    [headers, ...transactionRows(transactions)]
      .map((row) => row.map(cell).join(','))
      .join('\r\n')
  )
}

const xml = (value: string | number | null) =>
  String(value ?? '')
    // XML 1.0 excludes these control characters from text nodes.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// SpreadsheetML preserves numeric cells and their display format without CSV's
// dependence on the viewer's default currency precision.
export function transactionsToExcel(transactions: Transaction[]) {
  const heading = `<Row>${headers.map((header) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xml(header)}</Data></Cell>`).join('')}</Row>`
  const rows = transactionRows(transactions)
    .map(
      (row) =>
        `<Row>${row
          .map((value, index) => {
            const money = index === 1 || index === 2
            const numeric =
              value != null && (money || typeof value === 'number')
            return `<Cell${money ? ' ss:StyleID="Money"' : ''}><Data ss:Type="${numeric ? 'Number' : 'String'}">${xml(value)}</Data></Cell>`
          })
          .join('')}</Row>`
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="Header"><Font ss:Bold="1"/></Style><Style ss:ID="Money"><NumberFormat ss:Format="0.000000"/></Style></Styles>
<Worksheet ss:Name="Transactions"><Table><Column ss:Width="130" ss:Span="13"/>${heading}${rows}</Table></Worksheet></Workbook>`
}

export function downloadTransactions(
  transactions: Transaction[],
  format: 'csv' | 'xml'
) {
  const content =
    format === 'csv'
      ? transactionsToCSV(transactions)
      : transactionsToExcel(transactions)
  const blob = new Blob([content], {
    type:
      format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'application/vnd.ms-excel;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transaction-history-${new Date().toISOString().slice(0, 10)}.${format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
