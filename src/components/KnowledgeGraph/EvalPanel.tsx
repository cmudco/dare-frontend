import { useEffect, useState } from 'react'
import { Check, Loader2, Minus } from 'lucide-react'

import { getEvalReportAPI } from '@/api/knowledgeGraph'
import type { EvalReport } from '@/redux/types/knowledgeGraph'
import { formatRelativeDate } from '@/utils/dateUtils'

const Mark = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    role='img'
    aria-label={`${label}: ${ok ? 'correct' : 'missed'}`}
    title={`${label}: ${ok ? 'correct' : 'missed'}`}
    className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
      ok
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground'
    }`}
  >
    {ok ? <Check className='h-3 w-3' /> : <Minus className='h-3 w-3' />}
  </span>
)

const EvalPanel = ({ graphId }: { graphId: number }) => {
  const [report, setReport] = useState<EvalReport | null | undefined>(undefined)

  useEffect(() => {
    void getEvalReportAPI(graphId).then((response) =>
      setReport(response.report)
    )
  }, [graphId])

  if (report === undefined) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }
  if (report === null) {
    return (
      <div className='mx-auto max-w-3xl px-6 py-16 text-center text-sm text-muted-foreground'>
        No test results for this graph yet.
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-6 py-8'>
      <div>
        <h2 className='text-lg font-semibold'>Does the graph help?</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          The same questions, with known answers, run each way. A question
          counts only if the answer contains the expected facts. Run{' '}
          {formatRelativeDate(report.generatedAt)}.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {report.configs.map((config) => {
          const score = report.summary[config.id]
          return (
            <div
              key={config.id}
              className='rounded-lg border border-border bg-card p-4'
            >
              <p className='text-sm font-medium'>{config.label}</p>
              <p className='mt-2 text-2xl font-semibold tabular-nums'>
                {score?.answerCorrect ?? 0} / {score?.total ?? 0}
              </p>
              <p className='text-xs text-muted-foreground'>
                answers correct · found the right documents for{' '}
                {score?.found ?? 0}
              </p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {config.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className='overflow-x-auto rounded-lg border border-border bg-card'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border text-left text-xs text-muted-foreground'>
              <th className='px-4 py-2.5 font-medium'>Question</th>
              <th className='px-3 py-2.5 font-medium'>Type</th>
              {report.configs.map((config) => (
                <th
                  key={config.id}
                  className='px-3 py-2.5 text-center font-medium whitespace-nowrap'
                >
                  {config.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {report.rows.map((row) => (
              <tr key={row.id}>
                <td className='px-4 py-2.5'>
                  <p>{row.question}</p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    Expected: {row.expected}
                  </p>
                </td>
                <td className='px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground'>
                  {row.kind}
                </td>
                {report.configs.map((config) => (
                  <td key={config.id} className='px-3 py-2.5 text-center'>
                    <Mark
                      ok={row.results[config.id]?.answerCorrect ?? false}
                      label={config.label}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EvalPanel
