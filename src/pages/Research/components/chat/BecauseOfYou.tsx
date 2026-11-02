import { useState } from 'react'
import { CornerDownRight, ExternalLink } from 'lucide-react'
import type { LearningApplied, LearningSetAside } from '@/redux/types/research'

interface Props {
  applied: LearningApplied[]
  setAside: LearningSetAside[]
}

/**
 * What a run did differently because of the scholar's approved memory — the
 * visible half of "it gets better over time". Renders nothing when no memory
 * changed anything, so an absent line is itself honest.
 */
const BecauseOfYou = ({ applied, setAside }: Props) => {
  const [showSetAside, setShowSetAside] = useState(false)
  if (applied.length === 0 && setAside.length === 0) return null
  return (
    <div className='mt-1.5 space-y-1'>
      {applied.map((row, index) => (
        <p
          key={`${row.memory}-${index}`}
          className='flex items-start gap-1.5 text-xs text-muted-foreground'
        >
          <CornerDownRight className='mt-0.5 h-3 w-3 shrink-0 text-muted-foreground' />
          <span>
            <span className='text-foreground'>{row.effect}</span>
            {row.memory && <> — because of “{row.memory}”</>}
          </span>
        </p>
      ))}
      {setAside.length > 0 && (
        <div>
          <button
            type='button'
            onClick={() => setShowSetAside((open) => !open)}
            className='text-xs text-primary hover:underline'
          >
            {showSetAside ? 'Hide' : 'Show'} {setAside.length} source
            {setAside.length === 1 ? '' : 's'} set aside by your memory
          </button>
          {showSetAside && (
            <ul className='mt-1 space-y-1 border-l border-border pl-3'>
              {setAside.map((row, index) => (
                <li key={`${row.title}-${index}`} className='text-xs'>
                  <span className='text-foreground'>{row.title}</span>
                  {row.url && (
                    <a
                      href={row.url}
                      target='_blank'
                      rel='noreferrer'
                      className='ml-1 inline-flex items-center text-primary'
                      aria-label={`Open ${row.title}`}
                    >
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                  <span className='block text-muted-foreground'>
                    {row.reason}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default BecauseOfYou
