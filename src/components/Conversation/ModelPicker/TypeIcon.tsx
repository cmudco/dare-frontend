import React from 'react'
import { Box, Gem, Orbit, Zap } from 'lucide-react'
import { ModelGroupType } from '@/utils/modelGroupingUtils'

interface TypeIconProps {
  type: ModelGroupType
  className?: string
}

const TypeIcon: React.FC<TypeIconProps> = ({ type, className }) => {
  const iconClass = className || 'h-3.5 w-3.5'

  switch (type) {
    case 'Premium':
      return <Gem className={`${iconClass} text-amber-500`} />
    case 'Advanced':
      return <Orbit className={`${iconClass} text-blue-500`} />
    case 'Flash':
      return <Zap className={`${iconClass} text-emerald-500`} />
    default:
      return <Box className={`${iconClass} text-slate-400`} />
  }
}

export default TypeIcon
