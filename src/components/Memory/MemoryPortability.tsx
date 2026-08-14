/**
 * MemoryPortability
 *
 * Export the whole store as one bundle; import a bundle into an empty store.
 * The bundle is the layered contract itself — records with their keys,
 * states and supersession chains, plus the profile document — so the
 * roundtrip reinstates the store exactly rather than approximating it from
 * a flat list.
 */
import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { Download, Loader2, Upload } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  exportMemory,
  getMemoryItems,
  getRetiredMemoryItems,
  importMemory,
} from '@/redux/asyncThunks/memory'
import { toast } from '@/utils/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const SCHEMA = 'dare-memory-v2'

interface ParsedPreview {
  records: number
  active: number
  retired: number
  held: number
  rules: number
  hasDocument: boolean
}

const MemoryPortability = ({ memoryCount }: { memoryCount: number }) => {
  const dispatch = useAppDispatch()
  const exporting = useAppSelector((state) => state.memory.exporting)
  const importing = useAppSelector((state) => state.memory.importing)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const parsed = useMemo((): ParsedPreview | string | null => {
    if (!raw.trim()) return null
    try {
      const data = JSON.parse(raw)
      if (data?.schema !== SCHEMA) {
        return `Not a ${SCHEMA} bundle — export one from the Memory page.`
      }
      const records = Array.isArray(data.records) ? data.records : []
      return {
        records: records.length,
        active: records.filter((r: { state?: string }) => r.state === 'active')
          .length,
        retired: records.filter(
          (r: { state?: string }) => r.state === 'superseded'
        ).length,
        held: records.filter((r: { state?: string }) => r.state === 'held')
          .length,
        rules: records.filter((r: { kind?: string }) => r.kind === 'procedure')
          .length,
        hasDocument: Boolean(data.document?.trim?.()),
      }
    } catch {
      return 'That is not valid JSON.'
    }
  }, [raw])

  const handleExport = async () => {
    const result = await dispatch(exportMemory())
    if (exportMemory.fulfilled.match(result)) {
      const stamp = new Date().toISOString().slice(0, 10)
      const blob = new Blob([JSON.stringify(result.payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dare-memory-${stamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Memory bundle downloaded')
    }
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    file.text().then(setRaw)
  }

  const handleImport = async () => {
    let data: object
    try {
      data = JSON.parse(raw)
    } catch {
      return
    }
    const result = await dispatch(importMemory(data))
    if (importMemory.fulfilled.match(result)) {
      toast.success(
        `Reinstated ${result.payload.records} memories from the bundle`
      )
      setDialogOpen(false)
      setRaw('')
      dispatch(getMemoryItems())
      dispatch(getRetiredMemoryItems())
    }
  }

  const preview = typeof parsed === 'object' ? parsed : null
  const parseError = typeof parsed === 'string' ? parsed : null

  return (
    <>
      {memoryCount > 0 && (
        <Button variant='outline' onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          Export
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <Upload className='h-4 w-4' />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Import a memory bundle</DialogTitle>
            <DialogDescription>
              Paste or pick a <span className='font-mono'>{SCHEMA}</span> bundle
              exported from DARE. Import needs an empty store — export first if
              anything here matters, then Forget everything.
            </DialogDescription>
          </DialogHeader>

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
                or paste the bundle below
              </span>
            </div>
            <Textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder='{ "schema": "dare-memory-v2", … }'
              className='h-40 font-mono text-xs'
            />
            {parseError && (
              <p className='text-xs text-destructive'>{parseError}</p>
            )}
            {preview && (
              <p className='text-xs text-muted-foreground'>
                {preview.records} memories — {preview.active} active,{' '}
                {preview.retired} retired, {preview.held} held, {preview.rules}{' '}
                rules
                {preview.hasDocument ? ', plus the profile document' : ''}.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleImport} disabled={!preview || importing}>
              {importing && <Loader2 className='h-4 w-4 animate-spin' />}
              Import {preview ? `${preview.records} memories` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MemoryPortability
