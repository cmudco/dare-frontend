/**
 * OmpJourney
 *
 * The life of a memory outside DARE, one step at a time: export, carry,
 * import, receipt, forget.
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, FileJson, Server } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  text: string
  /** Where the packet starts and ends, as a share of the track */
  from: number
  to: number
  packet: string
}

const STEPS: Step[] = [
  {
    title: 'Export',
    text: 'DARE writes your memories into one file. Held, health and third-party memories stay home unless you include them. Anything holding a password never leaves.',
    from: 0,
    to: 50,
    packet: 'memory',
  },
  {
    title: 'Carry',
    text: 'The file is plain JSON. Every memory carries where it came from and its id, so it is the same memory in every system it reaches.',
    from: 50,
    to: 100,
    packet: 'memory',
  },
  {
    title: 'Import',
    text: 'A system reads a file and decides memory by memory. In DARE, what arrives waits as held and is not used in chat until you release it.',
    from: 100,
    to: 0,
    packet: 'held',
  },
  {
    title: 'Receipt',
    text: 'Every import ends with a receipt: what was stored, what was already here, what was left out, and why. Nothing is lost silently.',
    from: 0,
    to: 0,
    packet: 'receipt',
  },
  {
    title: 'Forget',
    text: 'Forgetting erases the memory and leaves a marker. The marker travels in every export, so an old copy cannot bring it back.',
    from: 0,
    to: 100,
    packet: 'forgotten',
  },
]

const NODES = [
  { label: 'DARE', hint: 'its own tables', icon: Database },
  { label: 'OMP file', hint: 'the shared shape', icon: FileJson },
  { label: 'Another system', hint: 'its own storage', icon: Server },
]

const OmpJourney = () => {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const current = STEPS[step]

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(
      () => setStep((value) => (value + 1) % STEPS.length),
      4000
    )
    return () => clearInterval(timer)
  }, [playing])

  return (
    <div>
      <div className='rounded-xl border border-border bg-card px-6 py-8 sm:px-12'>
        <div className='relative mx-auto h-28 max-w-2xl'>
          <div className='absolute top-7 right-7 left-7 border-t-2 border-dashed border-border' />
          <div className='absolute top-7 right-7 left-7 h-0'>
            <motion.div
              key={step}
              initial={{ left: `${current.from}%`, opacity: 0, scale: 0.8 }}
              animate={{ left: `${current.to}%`, opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className='absolute z-10 -translate-x-1/2 -translate-y-[2.6rem] rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] font-medium whitespace-nowrap text-primary-foreground shadow-md'
            >
              {current.packet}
            </motion.div>
          </div>
          <div className='absolute inset-x-0 top-0 flex justify-between'>
            {NODES.map(({ label, hint, icon: Icon }) => (
              <div key={label} className='flex w-14 flex-col items-center'>
                <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background'>
                  <Icon className='h-6 w-6 text-foreground' />
                </div>
                <span className='mt-2 text-sm font-medium whitespace-nowrap'>
                  {label}
                </span>
                <span className='text-xs whitespace-nowrap text-muted-foreground'>
                  {hint}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-4 grid grid-cols-5 gap-2'>
        {STEPS.map((item, index) => (
          <button
            key={item.title}
            type='button'
            onClick={() => {
              setPlaying(false)
              setStep(index)
            }}
            aria-pressed={index === step}
            className={cn(
              'rounded-lg border px-2 py-2 text-left transition-colors',
              index === step
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <span className='block font-mono text-[11px]'>0{index + 1}</span>
            <span className='block text-sm font-medium'>{item.title}</span>
          </button>
        ))}
      </div>

      <motion.p
        key={step}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className='mt-4 min-h-16 text-sm leading-relaxed'
      >
        {current.text}
      </motion.p>
    </div>
  )
}

export default OmpJourney
