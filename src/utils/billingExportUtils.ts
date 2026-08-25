import { useAppSelector } from '@/redux/hooks'

export const useExportToCSV = () => {
  const transactions = useAppSelector((state) => state.billing.transactions)

  const exportToCSV = () => {
    if (transactions.length === 0) return

    const headers = [
      'Amount',
      'Reference Cost',
      'Message',
      'LLM',
      'Input Tokens',
      'Output Tokens',
      'Billing Mode',
      'Platform',
      'Date',
    ]

    const data = transactions.map((transaction) => [
      transaction.displayAmount,
      transaction.displayReferenceAmount || 'N/A',
      transaction.message,
      transaction.llm?.name || 'N/A',
      transaction.inputTokens?.toString() || 'N/A',
      transaction.outputTokens?.toString() || 'N/A',
      transaction.billingMode || 'N/A',
      transaction.platform || 'N/A',
      new Date(transaction.createdAt).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]

    link.setAttribute('href', url)
    link.setAttribute('download', `transaction-history-${date}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return exportToCSV
}
