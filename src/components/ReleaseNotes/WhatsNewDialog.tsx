import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { dismissReleaseNotes } from '@/redux/asyncThunks/releaseNotes'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { selectUnseenReleaseNotes } from '@/redux/releaseNotesSlice'
import type { ReleaseNote } from '@/redux/types/releaseNotes'
import { cn } from '@/lib/utils'
import { ReleaseNoteEntry } from './ReleaseNoteEntry'

/** Opens on its own when releases shipped since the user last dismissed it. */
export function WhatsNewDialog() {
  const unseen = useAppSelector(selectUnseenReleaseNotes)
  if (unseen.length === 0) return null
  // Keyed so the step resets whenever a different set of releases arrives.
  return <WhatsNewSteps key={unseen[0].id} unseen={unseen} />
}

function WhatsNewSteps({ unseen }: { unseen: ReleaseNote[] }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  // State, not a ref: the dialog portal mounts after this component's first effect.
  const [body, setBody] = useState<HTMLDivElement | null>(null)
  const [bodyHeight, setBodyHeight] = useState<number>()

  useEffect(() => {
    if (!body) return
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight))
    observer.observe(body)
    return () => observer.disconnect()
  }, [body])

  const note = unseen[step]
  const isLast = step === unseen.length - 1
  const offset = reduceMotion ? 0 : 8
  const duration = reduceMotion ? 0 : 0.22

  // Dismissing at any step clears every unseen release, not just the one shown.
  const dismiss = () => dispatch(dismissReleaseNotes(unseen[0].id))

  const handleTryIt = (path: string) => {
    dismiss()
    navigate(path)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className='w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl'>
        <div className='h-0.5 bg-dare-gradient' aria-hidden />
        <div className='flex flex-col items-center gap-3 border-b border-border bg-muted/40 px-6 pt-6 pb-5'>
          <Logo size='lg' animated showTagline={false} />
          <DialogTitle className='text-sm font-medium text-muted-foreground'>
            Fresh updates, just shipped
          </DialogTitle>
          <DialogDescription className='sr-only'>
            What changed in DARE since your last visit.
          </DialogDescription>
        </div>

        {/* The outer box eases to the measured height so steps of different
            length resize smoothly instead of snapping. */}
        <motion.div
          className='overflow-hidden'
          initial={false}
          animate={{ height: bodyHeight ?? 'auto' }}
          transition={{ duration, ease: 'easeInOut' }}
        >
          <div
            ref={setBody}
            className='relative max-h-[55vh] overflow-y-auto px-6 py-5'
          >
            <AnimatePresence mode='popLayout' initial={false}>
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: offset }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -offset }}
                transition={{ duration, ease: 'easeOut' }}
              >
                <ReleaseNoteEntry note={note} onTryIt={handleTryIt} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className='flex items-center justify-between gap-3 border-t border-border px-6 py-4'>
          {unseen.length > 1 ? (
            <div className='flex items-center gap-1.5'>
              {unseen.map((release, index) => (
                <button
                  key={release.id}
                  type='button'
                  aria-label={`Show release ${index + 1} of ${unseen.length}`}
                  aria-current={index === step}
                  onClick={() => setStep(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
                    index === step
                      ? 'w-5 bg-foreground'
                      : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground'
                  )}
                />
              ))}
            </div>
          ) : (
            <span />
          )}

          <div className='flex gap-2'>
            {!isLast && (
              <Button variant='ghost' size='sm' onClick={dismiss}>
                Skip
              </Button>
            )}
            <Button
              size='sm'
              onClick={isLast ? dismiss : () => setStep(step + 1)}
            >
              {isLast ? 'Got it' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
