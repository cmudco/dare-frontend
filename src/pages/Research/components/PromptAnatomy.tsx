import { useState } from 'react'
import { BookOpenText, Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PromptBrief } from '../types'
import PromptBriefsSheet from './PromptBriefsSheet'

type Cell = boolean | string

interface Row {
  part: string
  holds: string
  /** Cells for Chat, Scout, Critic, Presenter. */
  cells: [Cell, Cell, Cell, Cell]
  owner: 'you' | 'hermes' | 'dare'
}

const ROLES: { label: string; key: PromptBrief['key'] }[] = [
  { label: 'Chat', key: 'chat' },
  { label: 'Scout', key: 'scout' },
  { label: 'Critic', key: 'critic' },
  { label: 'Presenter', key: 'presenter' },
]

// In the order the agent reads them: one system message, then the conversation.
const ROWS: Row[] = [
  {
    part: 'SOUL.md',
    holds: 'Your standards for this project',
    cells: [true, true, true, true],
    owner: 'you',
  },
  {
    part: 'Hermes guidance',
    holds: "The runtime's own operating notes",
    cells: [true, true, true, true],
    owner: 'hermes',
  },
  {
    part: 'Skills',
    holds: 'Methods you approved',
    cells: [true, true, true, true],
    owner: 'you',
  },
  {
    part: 'MEMORY.md',
    holds: 'The Project section, then approved project memory',
    cells: [true, true, true, true],
    owner: 'you',
  },
  {
    part: 'USER.md',
    holds: 'What you approved about yourself',
    cells: [true, true, true, true],
    owner: 'you',
  },
  {
    part: 'Instructions',
    holds: "The role's brief: how to behave",
    cells: ['Chat brief', 'Scout brief', 'Critic brief', 'Presenter brief'],
    owner: 'dare',
  },
  {
    part: 'History',
    holds: 'Earlier turns of the thread',
    cells: [true, false, false, false],
    owner: 'dare',
  },
  {
    part: 'Input',
    holds: 'What the run acts on now',
    cells: [
      'Your message',
      'Its task + the thread',
      'The finding',
      'Your request',
    ],
    owner: 'dare',
  },
]

const OWNER_LABEL = { you: 'yours', hermes: 'Hermes', dare: 'DARE' }

// How every run is put together, so nothing the agent reads is a mystery.
const PromptAnatomy = () => {
  const [open, setOpen] = useState(false)
  const [briefKey, setBriefKey] = useState<PromptBrief['key']>('chat')

  const openBrief = (key: PromptBrief['key']) => {
    setBriefKey(key)
    setOpen(true)
  }

  return (
    <section className='rounded-2xl border border-border bg-card p-6'>
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-sm font-medium'>What every run reads</h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            In order. Your files are on the Context tab; each run's exact copy
            is on its page under Runs.
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={() => openBrief('chat')}>
          <BookOpenText className='h-4 w-4' /> Read the instructions
        </Button>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[40rem] text-sm'>
          <thead>
            <tr className='text-left text-xs text-muted-foreground'>
              <th className='py-2 pr-3 font-medium'>Part</th>
              <th className='py-2 pr-3 font-medium'>Holds</th>
              {ROLES.map((r) => (
                <th key={r.key} className='px-2 py-2 text-center font-medium'>
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.part} className='border-t border-border'>
                <td className='py-2.5 pr-3 align-top'>
                  <span className='font-mono text-xs'>{row.part}</span>
                  <span className='ml-2 text-[11px] text-muted-foreground'>
                    {OWNER_LABEL[row.owner]}
                  </span>
                </td>
                <td className='py-2.5 pr-3 align-top text-muted-foreground'>
                  {row.holds}
                </td>
                {row.cells.map((cell, index) => (
                  <td
                    key={ROLES[index].key}
                    className='px-2 py-2.5 text-center align-top text-xs'
                  >
                    {cell === true ? (
                      <Check
                        className='mx-auto h-4 w-4 text-foreground/70'
                        aria-label='yes'
                      />
                    ) : cell === false ? (
                      <Minus
                        className='mx-auto h-4 w-4 text-muted-foreground/50'
                        aria-label='no'
                      />
                    ) : row.part === 'Instructions' ? (
                      <button
                        type='button'
                        onClick={() => openBrief(ROLES[index].key)}
                        className='text-primary hover:underline'
                      >
                        {cell}
                      </button>
                    ) : (
                      <span className='text-muted-foreground'>{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PromptBriefsSheet
        open={open}
        onOpenChange={setOpen}
        active={briefKey}
        onSelect={setBriefKey}
      />
    </section>
  )
}

export default PromptAnatomy
