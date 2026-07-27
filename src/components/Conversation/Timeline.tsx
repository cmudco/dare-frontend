import React from 'react'

/**
 * Vertical timeline primitives shared by the retrieval-trace stages and the
 * message activity panel: a rail of circled icons on the left, one node per
 * step, connected top-to-bottom so the sequence reads as a lifecycle.
 */

/**
 * One node on the vertical timeline rail: a circled icon on the left, the
 * step's content on the right, and a connector line down to the next node
 * (suppressed on the last step).
 */
export const TimelineStep: React.FC<{
  icon: React.ReactNode
  isLast: boolean
  children: React.ReactNode
}> = ({ icon, isLast, children }) => (
  <div className='flex min-w-0 gap-3 overflow-hidden'>
    <div className='flex flex-col items-center'>
      <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground'>
        {icon}
      </div>
      {!isLast && <div className='mt-1 w-px flex-1 bg-border' />}
    </div>
    <div
      className={`min-w-0 flex-1 overflow-hidden pt-0.5 ${
        isLast ? '' : 'pb-4'
      }`}
    >
      {children}
    </div>
  </div>
)

/** Step title line; extra inline detail goes in children. */
export const StepHeader: React.FC<{
  title: string
  children?: React.ReactNode
}> = ({ title, children }) => (
  <div className='flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-medium [overflow-wrap:anywhere] break-words text-foreground'>
    {title}
    {children}
  </div>
)
