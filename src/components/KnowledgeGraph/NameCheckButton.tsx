import { useState } from 'react'
import { Loader2, UserCheck } from 'lucide-react'

import { recheckNamesAPI } from '@/api/knowledgeGraph'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { KnowledgeGraphSummary } from '@/redux/types/knowledgeGraph'
import { toast } from '@/utils/toast'

interface NameCheckButtonProps {
  graph: KnowledgeGraphSummary
  /** Another job is running, so a re-check can't start. */
  disabled: boolean
  onStarted: () => void
}

const plural = (count: number, word: string) =>
  `${count.toLocaleString()} ${word}${count === 1 ? '' : 's'}`

/** Re-scores the graph's names, then shows what changed. */
const NameCheckButton = ({
  graph,
  disabled,
  onStarted,
}: NameCheckButtonProps) => {
  const [confirming, setConfirming] = useState(false)
  const [starting, setStarting] = useState(false)
  const checking = graph.status === 'checking_names'
  const result = graph.nameCheck

  const start = async () => {
    setStarting(true)
    try {
      await recheckNamesAPI(graph.id)
      setConfirming(false)
      onStarted()
    } catch {
      toast.error("Re-checking names didn't start. Try again.")
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
      <Button
        variant='outline'
        size='sm'
        disabled={disabled || checking}
        onClick={() => setConfirming(true)}
      >
        {checking ? (
          <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
        ) : (
          <UserCheck className='mr-1.5 h-3.5 w-3.5' />
        )}
        {checking ? 'Re-checking names…' : 'Re-check names'}
      </Button>
      {result && !checking && (
        <p className='text-xs text-muted-foreground' aria-live='polite'>
          Last check: {plural(result.merged, 'merge')},{' '}
          {plural(result.separated, 'name')} separated,{' '}
          {plural(result.review, 'pair')} for review.
        </p>
      )}
      <Dialog
        open={confirming}
        onOpenChange={(next) => !next && setConfirming(false)}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Re-check names?</DialogTitle>
            <DialogDescription>
              Scores every pair of names in these documents again. Clear
              matches, such as Fredk Brown and Frederick Brown, merge. Names a
              rule joined that no longer match, such as a bare &quot;Paul&quot;
              when several Pauls appear, are separated. Unclear pairs wait for
              the model check at the next relationships read. Merges and
              separations you made stay, and other graphs over these documents
              see the same names. Free; takes up to a minute.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button disabled={starting} onClick={() => void start()}>
              {starting && (
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              )}
              Re-check names
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NameCheckButton
