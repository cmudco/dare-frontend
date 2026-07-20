import { formatRanAt } from '../../runFormat'
import { CancellationState } from '@/utils/constants/research'
import type { AgentRunCancellation } from '../../types'
import RunSection from './RunSection'
import MetaItem from './MetaItem'

const STATE_LABELS: Record<CancellationState, string> = {
  [CancellationState.CONFIRMED]: 'Confirmed by the runtime',
  [CancellationState.ACKNOWLEDGED]: 'Acknowledged — outcome not yet confirmed',
  [CancellationState.UNCONFIRMED]: 'Requested — not yet acknowledged',
}

interface CancellationPanelProps {
  cancellation: AgentRunCancellation
}

// Cancellation record, shown only once a stop was requested. Tells the scholar
// how far the stop got and stays honest about unconfirmed outcomes.
const CancellationPanel = ({ cancellation }: CancellationPanelProps) => (
  <RunSection title='Cancellation'>
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
      <MetaItem
        label='State'
        value={STATE_LABELS[cancellation.state] ?? cancellation.state}
      />
      <MetaItem label='Attempts' value={String(cancellation.attemptCount)} />
      {cancellation.requestedAt && (
        <MetaItem
          label='Requested'
          value={formatRanAt(cancellation.requestedAt)}
        />
      )}
      {cancellation.confirmedAt && (
        <MetaItem
          label='Confirmed'
          value={formatRanAt(cancellation.confirmedAt)}
        />
      )}
    </div>
    {cancellation.errorDetail && (
      <p className='mt-3 text-xs text-red-600 dark:text-red-400'>
        {cancellation.errorCode ? `${cancellation.errorCode}: ` : ''}
        {cancellation.errorDetail}
      </p>
    )}
  </RunSection>
)

export default CancellationPanel
