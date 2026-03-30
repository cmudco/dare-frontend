import React from 'react'
import { ModelGroupType } from '@/utils/modelGroupingUtils'

interface TierEmojiProps {
  type: ModelGroupType
}

const TierEmoji: React.FC<TierEmojiProps> = ({ type }) => {
  switch (type) {
    case 'Premium':
      return (
        <span
          title='Premium/Power'
          className='flex-shrink-0 text-[10px] opacity-40 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0'
        >
          💎
        </span>
      )
    case 'Advanced':
      return (
        <span
          title='Advanced/Balanced'
          className='flex-shrink-0 text-[10px] opacity-40 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0'
        >
          🪐
        </span>
      )
    case 'Flash':
      return (
        <span
          title='Flash/Speed'
          className='flex-shrink-0 text-[10px] opacity-40 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0'
        >
          ⚡
        </span>
      )
    default:
      return null
  }
}

export default TierEmoji
