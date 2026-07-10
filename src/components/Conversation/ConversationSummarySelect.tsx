import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateReferencedSummaries } from '@/redux/conversationSlice'
import type { ConversationSummary } from '@/redux/types/conversation'

interface ConversationSummarySelectProps {
  searchQuery: string
}

const ConversationSummarySelect: React.FC<ConversationSummarySelectProps> = ({
  searchQuery,
}) => {
  const dispatch = useAppDispatch()
  const summaries = useAppSelector(
    (state) => state.conversation.conversationSummaries
  )
  const referencedSummaries = useAppSelector(
    (state) => state.conversation.referencedSummaries
  )

  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filteredSummaries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const sorted = [...summaries].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    if (!normalizedQuery) return sorted
    return sorted.filter((s) =>
      (s.conversationTitle || 'New Chat')
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [searchQuery, summaries])

  const isSelected = (summary: ConversationSummary) =>
    referencedSummaries.some((s) => s.id === summary.id)

  const toggleSelection = (summary: ConversationSummary) => {
    const next = isSelected(summary)
      ? referencedSummaries.filter((s) => s.id !== summary.id)
      : [...referencedSummaries, summary]
    dispatch(updateReferencedSummaries(next))
  }

  const toggleExpand = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (filteredSummaries.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-border bg-muted px-4 py-8 text-center'>
        <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-xs'>
          <FileText className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='mt-3 text-sm font-medium text-foreground'>
          No conversation summaries yet
        </p>
        <p className='mt-1 text-xs leading-5 text-muted-foreground'>
          Summaries appear after every 5 completed assistant responses.
        </p>
      </div>
    )
  }

  return (
    <div className='max-h-[360px] space-y-2 overflow-y-auto pr-1'>
      {filteredSummaries.map((summary) => {
        const selected = isSelected(summary)
        const expanded = expandedId === summary.id
        const title = summary.conversationTitle || 'New Chat'

        return (
          <div
            key={summary.id}
            className={`overflow-hidden rounded-xl border transition-all duration-200 ${
              selected
                ? 'border-primary/40 bg-primary/10'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            {/* Row — clicking toggles selection */}
            <div
              className='flex cursor-pointer items-center gap-2 px-3 py-2.5'
              onClick={() => toggleSelection(summary)}
            >
              {/* Selection indicator */}
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {selected && (
                  <div className='h-1.5 w-1.5 rounded-full bg-primary-foreground' />
                )}
              </div>

              {/* Title + meta */}
              <div className='min-w-0 flex-1'>
                <p
                  className={`truncate text-sm font-medium ${
                    selected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {title}
                </p>
                <p className='mt-0.5 text-[11px] text-muted-foreground'>
                  {summary.summarizedMessageCount} messages &middot;{' '}
                  {new Date(summary.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Expand toggle — stops propagation so it doesn't trigger selection */}
              <button
                onClick={(e) => toggleExpand(e, summary.id)}
                className={`ml-1 rounded-md p-1 transition-colors ${
                  selected
                    ? 'text-primary hover:bg-primary/15'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                aria-label={expanded ? 'Collapse summary' : 'Read summary'}
              >
                {expanded ? (
                  <ChevronUp className='h-3.5 w-3.5' />
                ) : (
                  <ChevronDown className='h-3.5 w-3.5' />
                )}
              </button>
            </div>

            {/* Expanded summary text */}
            {expanded && (
              <div
                className={`border-t px-3 py-2.5 text-xs leading-relaxed ${
                  selected
                    ? 'border-primary/30 text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {summary.summary}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ConversationSummarySelect
