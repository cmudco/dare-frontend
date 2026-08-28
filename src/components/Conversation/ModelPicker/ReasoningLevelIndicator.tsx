import React from 'react'
import { Timer } from 'lucide-react'
import { ReasoningLevel } from '@/utils/constants/model'

const UNCONSTRAINED_TOOLTIP =
  'Reasoning model. Simple prompts can generate large token counts without warning.'

interface ReasoningLevelIndicatorProps {
  level: ReasoningLevel
  className?: string
}

// Marks cost_unconstrained models only. The picker layers its own reasoning
// dot for other cases (see ModelItem); the Help table carries the signal in
// its own column. Amber is the status-color exception per docs/RULES.md.
const ReasoningLevelIndicator: React.FC<ReasoningLevelIndicatorProps> = ({
  level,
  className,
}) => {
  if (level !== ReasoningLevel.CostUnconstrained) return null

  return (
    <span title={UNCONSTRAINED_TOOLTIP} className={className}>
      <Timer className='h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400' />
    </span>
  )
}

export default ReasoningLevelIndicator
