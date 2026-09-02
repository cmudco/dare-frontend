import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Gavel,
  Loader2,
  Users,
} from 'lucide-react'
import type {
  DeliberationParticipant,
  DeliberationStatus,
  Message,
} from '@/redux/types/conversation'
import { ModelTier, ModelTierColors } from '@/utils/constants/model'
import { getProviderBrand } from '@/utils/providerColors'
import { DEPTH_META } from '@/utils/ensemble'
import { formatMs } from '../MessageActivity/activitySummary'

const STATUS: Record<
  DeliberationStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  pending: { label: 'waiting', variant: 'gray' },
  streaming: { label: 'writing', variant: 'blue' },
  done: { label: 'done', variant: 'green' },
  dropped: { label: 'timed out', variant: 'yellow' },
  failed: { label: 'failed', variant: 'red' },
}

const formatCost = (cost: string): string => {
  const value = parseFloat(cost)
  if (!Number.isFinite(value) || value <= 0) return ''
  return value < 0.001 ? '<$0.001' : `$${value.toFixed(3)}`
}

const isLive = (status: DeliberationStatus) =>
  status === 'pending' || status === 'streaming'

const ProviderLogo: React.FC<{ provider: string; className?: string }> = ({
  provider,
  className = 'h-4 w-4',
}) => {
  const brand = getProviderBrand(provider)
  return brand.logo ? (
    <img
      src={brand.logo}
      alt={brand.name}
      className={`${className} shrink-0 object-contain`}
    />
  ) : (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold uppercase`}
    >
      {provider.charAt(0)}
    </span>
  )
}

/** One responder's draft: who, how it went, and what they said. */
const ResponderCard: React.FC<{
  responder: DeliberationParticipant
  index: number
}> = ({ responder, index }) => {
  const [expanded, setExpanded] = useState(false)
  const tier = (responder.tier as ModelTier) ?? ModelTier.Advanced
  const colors = ModelTierColors[tier] ?? ModelTierColors[ModelTier.Advanced]
  const status = STATUS[responder.status]
  const streaming = responder.status === 'streaming'
  const hasText = responder.text.trim().length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className={`flex min-w-0 flex-col rounded-lg border bg-card p-2.5 ${
        responder.status === 'done' ? colors.border : 'border-border'
      }`}
    >
      <div className='flex items-center gap-1.5'>
        <ProviderLogo provider={responder.provider} />
        <span className='min-w-0 flex-1 truncate text-xs font-semibold text-foreground'>
          {responder.modelName}
        </span>
        {responder.status === 'done' && responder.cost && (
          <span className='shrink-0 text-[10px] text-muted-foreground tabular-nums'>
            {formatCost(responder.cost)}
          </span>
        )}
        <Badge
          variant={status.variant}
          className='shrink-0 px-1.5 py-0 text-[10px] font-medium tabular-nums'
        >
          {responder.status === 'done' && responder.ms != null
            ? formatMs(responder.ms)
            : status.label}
        </Badge>
      </div>

      <button
        type='button'
        onClick={() => hasText && setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`mt-1.5 text-left text-xs leading-relaxed text-muted-foreground ${
          hasText ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <span
          className={`[overflow-wrap:anywhere] whitespace-pre-wrap ${
            expanded ? '' : 'line-clamp-4'
          }`}
        >
          {hasText
            ? responder.text
            : responder.status === 'pending'
              ? 'Thinking…'
              : responder.status === 'dropped'
                ? 'Took too long; the chairman went on without it.'
                : responder.status === 'failed'
                  ? 'Couldn’t answer this one.'
                  : ''}
          {streaming && (
            <span
              aria-hidden='true'
              className='ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 animate-pulse bg-foreground/70 motion-reduce:animate-none'
            />
          )}
        </span>
      </button>
    </motion.div>
  )
}

interface DeliberationPanelProps {
  message: Message
}

/**
 * The panel or council behind a fused answer, rendered above the answer
 * inside the assistant bubble. Live, it reads as visible reasoning: the
 * responders' drafts stream side by side, then the chairman takes over.
 * Finished, it settles into a one-line summary the reader can reopen.
 */
export const DeliberationPanel: React.FC<DeliberationPanelProps> = ({
  message,
}) => {
  const deliberation = message.deliberation
  const [isExpanded, setIsExpanded] = useState(true)
  const userToggled = useRef(false)

  const responders = deliberation?.responders ?? []
  const chairman = deliberation?.chairman
  const evaluations = deliberation?.evaluations ?? []
  const responderLive = responders.some((r) => isLive(r.status))
  const chairmanLive = !!chairman && isLive(chairman.status)
  const live = responderLive || chairmanLive
  const doneCount = responders.filter((r) => r.status === 'done').length
  const troubled = responders.filter(
    (r) => r.status === 'dropped' || r.status === 'failed'
  ).length

  // Open while the models work, then fold away once the answer is the
  // point. A person who touched the chevron keeps whatever they chose.
  useEffect(() => {
    if (live || userToggled.current) return
    const timer = window.setTimeout(() => setIsExpanded(false), 900)
    return () => window.clearTimeout(timer)
  }, [live])

  if (!deliberation || !chairman) return null

  const depthLabel = DEPTH_META[deliberation.depth].label

  const liveText = () => {
    if (responderLive) {
      const writing = responders.filter((r) => r.status === 'streaming').length
      if (writing === 0) return `${responders.length} models thinking…`
      return `${responders.length} models writing… ${doneCount}/${responders.length} done`
    }
    if (chairman.status === 'pending' && deliberation.depth === 'council') {
      return 'Peer review under way…'
    }
    return `${chairman.modelName} is weighing the drafts…`
  }

  const summaryText = () => {
    const parts = [
      `${depthLabel} of ${responders.length}`,
      `chaired by ${chairman.modelName}`,
    ]
    if (deliberation.totalMs != null) parts.push(formatMs(deliberation.totalMs))
    if (deliberation.verdict) parts.push(deliberation.verdict)
    return parts.join(' · ')
  }

  const statusIcon = live ? (
    <Loader2 className='h-3.5 w-3.5 animate-spin motion-reduce:animate-none' />
  ) : troubled > 0 ? (
    <CircleAlert className='h-3.5 w-3.5 text-amber-500' />
  ) : (
    <CheckCircle className='h-3.5 w-3.5 text-green-500' />
  )

  return (
    <div
      className='not-prose mb-3 overflow-hidden rounded-lg border border-border bg-muted/50 text-sm'
      aria-busy={live}
    >
      <button
        type='button'
        className='flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-3 py-2 text-muted-foreground transition-colors hover:bg-muted'
        onClick={() => {
          userToggled.current = true
          setIsExpanded((v) => !v)
        }}
        aria-expanded={isExpanded}
      >
        <span className='flex min-w-0 items-center gap-2'>
          {statusIcon}
          <span
            className={`truncate font-medium ${live ? 'text-shimmer' : ''}`}
            aria-live='polite'
            aria-atomic='true'
          >
            {live ? liveText() : summaryText()}
          </span>
        </span>
        {isExpanded ? (
          <ChevronDown size={14} className='shrink-0' />
        ) : (
          <ChevronRight size={14} className='shrink-0' />
        )}
      </button>

      {isExpanded && (
        <div className='space-y-3 border-t border-border p-3'>
          <section>
            <h4 className='mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground'>
              <Users className='h-3.5 w-3.5 text-muted-foreground' />
              Responders
              <span className='font-normal text-muted-foreground'>
                {doneCount}/{responders.length}
              </span>
            </h4>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {responders.map((responder, index) => (
                <ResponderCard
                  key={responder.modelId}
                  responder={responder}
                  index={index}
                />
              ))}
            </div>
          </section>

          {evaluations.length > 0 && (
            <section>
              <h4 className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground'>
                <ClipboardCheck className='h-3.5 w-3.5 text-muted-foreground' />
                Peer review
              </h4>
              <ul className='space-y-1'>
                {evaluations.map((evaluation) => (
                  <li
                    key={evaluation.evaluatorName}
                    className='flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground'
                  >
                    <span className='font-medium text-foreground'>
                      {evaluation.evaluatorName}
                    </span>
                    <span>ranked</span>
                    <span className='text-foreground'>
                      {evaluation.ranking.join(' › ')}
                    </span>
                    {evaluation.notes && (
                      <span className='w-full truncate'>
                        {evaluation.notes}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className='flex items-center gap-2 text-xs'>
            <motion.span
              animate={
                chairman.status === 'streaming'
                  ? { rotate: [0, -25, 0] }
                  : { rotate: 0 }
              }
              transition={
                chairman.status === 'streaming'
                  ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
              className='flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground'
            >
              <Gavel className='h-3.5 w-3.5' />
            </motion.span>
            <ProviderLogo
              provider={chairman.provider}
              className='h-3.5 w-3.5'
            />
            <span className='font-medium text-foreground'>
              Chairman · {chairman.modelName}
            </span>
            <span className='text-muted-foreground'>
              {chairman.status === 'pending'
                ? responderLive
                  ? 'waiting for the bench'
                  : 'reading the drafts'
                : chairman.status === 'streaming'
                  ? 'writing the answer…'
                  : chairman.status === 'done'
                    ? chairman.ms != null
                      ? `answered in ${formatMs(chairman.ms)}`
                      : 'answered'
                    : STATUS[chairman.status].label}
            </span>
            {deliberation.cost && !live && (
              <span className='ml-auto text-muted-foreground tabular-nums'>
                {formatCost(deliberation.cost) || '$0'} total
              </span>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default DeliberationPanel
