/**
 * OmpImportPanel
 *
 * Import an Open Memory Protocol file and read its receipt. A file is a set
 * of claims by the system that wrote it, so whatever is accepted waits as
 * held, and the receipt says what happened to every memory, refusals included.
 */
import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  getMemoryItems,
  getRetiredMemoryItems,
  importOmpMemory,
  releaseOmpImports,
} from '@/redux/asyncThunks/memory'
import type { OmpImportRun } from '@/redux/types/memory'
import { toast } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface FilePreview {
  memories: number
  origin: string
}

const memories = (count: number) =>
  `${count} ${count === 1 ? 'memory' : 'memories'}`

/** Reasons from the receipt, most common first, each with how many it covers. */
const reasonGroups = (run: OmpImportRun): [string, number][] => {
  const groups = new Map<string, number>()
  for (const entry of run.entries) {
    if (entry.reason)
      groups.set(entry.reason, (groups.get(entry.reason) ?? 0) + 1)
  }
  return [...groups.entries()].sort((a, b) => b[1] - a[1])
}

const OmpImportPanel = ({ onDone }: { onDone: () => void }) => {
  const dispatch = useAppDispatch()
  const importing = useAppSelector((state) => state.memory.importing)

  const [raw, setRaw] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const [run, setRun] = useState<OmpImportRun | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const parsed = useMemo((): FilePreview | string | null => {
    if (!raw.trim()) return null
    try {
      const data = JSON.parse(raw)
      if (!data?.manifest || !Array.isArray(data.memories)) {
        return 'That is not an Open Memory Protocol file.'
      }
      return {
        memories: data.memories.length,
        origin: String(data.manifest.origin ?? 'an unnamed system'),
      }
    } catch {
      return 'That is not valid JSON.'
    }
  }, [raw])

  const preview = typeof parsed === 'object' ? parsed : null
  const parseError = typeof parsed === 'string' ? parsed : null

  const refreshItems = () => {
    dispatch(getMemoryItems())
    dispatch(getRetiredMemoryItems())
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    file.text().then(setRaw)
  }

  const handleImport = async () => {
    setFailure(null)
    const result = await dispatch(importOmpMemory(JSON.parse(raw)))
    if (importOmpMemory.fulfilled.match(result)) {
      setRun(result.payload)
      refreshItems()
    } else {
      setFailure(String(result.payload))
    }
  }

  const handleRelease = async () => {
    if (!run) return
    const result = await dispatch(releaseOmpImports())
    if (releaseOmpImports.fulfilled.match(result)) {
      const { released, stillHeld } = result.payload
      toast.success(
        stillHeld > 0
          ? `Released ${memories(released)}; ${stillHeld} sensitive ${stillHeld === 1 ? 'one stays' : 'ones stay'} held`
          : `Released ${memories(released)}`
      )
      refreshItems()
      onDone()
    }
  }

  if (run) {
    const stored = run.counts.accepted + run.counts.transformed
    const leftOut = run.counts.rejected + run.counts.omitted
    const reasons = reasonGroups(run)
    return (
      <div className='space-y-3' data-testid='omp-receipt'>
        <div className='grid grid-cols-3 gap-2 text-center'>
          {(
            [
              [stored, 'stored as held'],
              [run.counts.unchanged, 'already here'],
              [leftOut, 'left out'],
            ] as const
          ).map(([count, label]) => (
            <div
              key={label}
              className='rounded-lg border border-border bg-muted/30 p-3'
            >
              <p className='text-lg font-medium'>{count}</p>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </div>
          ))}
        </div>
        {reasons.length > 0 && (
          <ul className='max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground'>
            {reasons.map(([reason, count]) => (
              <li key={reason} className='flex gap-2'>
                <span className='shrink-0 font-medium text-foreground'>
                  {count}
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
        {run.held > 0 && (
          <p className='text-xs text-muted-foreground'>
            Held memories are listed on this page but are not used in chat until
            you release them. Ones labelled health or third-party are always
            released one at a time.
          </p>
        )}
        <DialogFooter>
          <Button variant='outline' onClick={onDone}>
            {run.held > 0 ? 'Review them first' : 'Done'}
          </Button>
          {run.held > 0 && (
            <Button onClick={handleRelease} disabled={importing}>
              {importing && <Loader2 className='h-4 w-4 animate-spin' />}
              Release all {run.held}
            </Button>
          )}
        </DialogFooter>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileInput.current?.click()}
        >
          Choose file
        </Button>
        <input
          ref={fileInput}
          type='file'
          accept='.json,application/json'
          onChange={handleFile}
          className='hidden'
        />
        <span className='text-xs text-muted-foreground'>
          or paste the file below
        </span>
      </div>
      <Textarea
        value={raw}
        onChange={(event) => setRaw(event.target.value)}
        placeholder='{ "manifest": { … }, "memories": [ … ] }'
        className='h-40 font-mono text-xs'
      />
      {(parseError || failure) && (
        <p className='text-xs text-destructive'>{parseError || failure}</p>
      )}
      {preview && (
        <p className='text-xs text-muted-foreground'>
          {memories(preview.memories)} from{' '}
          <span className='font-mono'>{preview.origin}</span>.
        </p>
      )}
      <DialogFooter>
        <Button onClick={handleImport} disabled={!preview || importing}>
          {importing && <Loader2 className='h-4 w-4 animate-spin' />}
          Import as held
        </Button>
      </DialogFooter>
    </div>
  )
}

export default OmpImportPanel
