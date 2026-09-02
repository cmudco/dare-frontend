import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Coins, Gavel } from 'lucide-react'
import { useEnsembleEstimate } from '@/hooks/useEnsembleEstimate'
import { getProviderBrand } from '@/utils/providerColors'
import {
  DEPTH_META,
  ENSEMBLE_MIN_RESPONDERS,
  formatEstimateCost,
  formatEstimateLatency,
} from '@/utils/ensemble'
import StackedLogos from './StackedLogos'

interface EnsembleBarProps {
  onDone: () => void
}

/**
 * The picker's footer while composing a panel or council: who is on the
 * bench, who chairs, and what the turn will roughly cost before it is sent.
 * The chairman is chosen with the gavel on any model row above.
 */
const EnsembleBar: React.FC<EnsembleBarProps> = ({ onDone }) => {
  const { ensemble, responders, chairman, active, estimate } =
    useEnsembleEstimate()

  const missing = ENSEMBLE_MIN_RESPONDERS - responders.length
  const chairmanBrand = chairman ? getProviderBrand(chairman.provider) : null

  return (
    <div className='flex-none space-y-2 border-t border-accent/20 bg-accent/10 p-3 backdrop-blur-md'>
      <div className='flex items-center gap-2'>
        <StackedLogos entries={responders} max={4} />
        <span className='min-w-0 flex-1 truncate text-xs font-medium text-foreground'>
          {responders.length === 0
            ? 'Pick the models for the bench'
            : missing > 0
              ? `${responders.length} on the bench · pick ${missing} more`
              : `${responders.length} on the bench`}
        </span>

        <AnimatePresence mode='popLayout' initial={false}>
          <motion.span
            key={chairman?.id ?? 'none'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            title='The chairman reads every draft and writes the one answer you see. Use the gavel on any model to change it.'
            className='flex h-7 max-w-[210px] shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 pr-2.5 pl-1.5 text-xs font-medium text-primary'
          >
            <Gavel className='h-3.5 w-3.5 shrink-0' />
            {chairmanBrand?.logo && (
              <img
                src={chairmanBrand.logo}
                alt={chairmanBrand.name}
                className='h-3.5 w-3.5 shrink-0 object-contain'
              />
            )}
            <span className='truncate'>
              {chairman ? chairman.name : 'Pick a chairman'}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      <div className='flex items-center gap-3 text-xs text-muted-foreground'>
        <AnimatePresence mode='popLayout' initial={false}>
          <motion.span
            key={`${estimate.costUsd.toFixed(3)}-${estimate.partial}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className='flex items-center gap-1 tabular-nums'
          >
            <Coins className='h-3.5 w-3.5' />
            {formatEstimateCost(estimate.costUsd)}
            {estimate.partial && '+'} per turn
          </motion.span>
        </AnimatePresence>
        <span className='flex items-center gap-1 tabular-nums'>
          <Clock className='h-3.5 w-3.5' />
          {formatEstimateLatency(estimate.latencyMs)}
        </span>
        <span className='hidden sm:inline'>
          {estimate.calls} call{estimate.calls === 1 ? '' : 's'}
          {ensemble.depth === 'council' && ' · peer review'}
        </span>
        <button
          type='button'
          onClick={onDone}
          disabled={!active}
          className='ml-auto rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40'
        >
          {active
            ? `Use ${DEPTH_META[ensemble.depth].label.toLowerCase()}`
            : 'Pick 2+ models'}
        </button>
      </div>
    </div>
  )
}

export default EnsembleBar
