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
import { Check, Copy, Download, Loader2, Upload } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  exportMemory,
  getMemoryItems,
  getRetiredMemoryItems,
  importForeignMemory,
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

/** Handed to the OTHER assistant. Asks for plain prose in the person's own
 *  voice, because the paste goes through DARE's writer — which reads
 *  sentences, not schemas — and verbatim instructions are the part worth
 *  preserving exactly. */
const FOREIGN_EXPORT_PROMPT = `Export everything durable you know about me, from your saved memories AND what you can infer from our conversation history. Include: who I am and what I work on; my preferences and how I like answers written; standing instructions and corrections I've given you (keep my exact wording for these); people, projects and tools I've mentioned; constraints like allergies, schedule rules or hard limits.

Write it as plain bullet points, each one a complete standalone sentence in my voice ("I live in…", "Always answer me in…", "My advisor Simon…"). No headings, no commentary, no session-specific chatter — only things that will still be true next month.`

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
  const [mode, setMode] = useState<'bundle' | 'foreign'>('bundle')
  const [raw, setRaw] = useState('')
  const [foreignText, setForeignText] = useState('')
  const [copied, setCopied] = useState(false)
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

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(FOREIGN_EXPORT_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleForeignImport = async () => {
    const result = await dispatch(importForeignMemory(foreignText.trim()))
    if (importForeignMemory.fulfilled.match(result)) {
      toast.success(
        `Import started — ${result.payload.queuedChunks} ${
          result.payload.queuedChunks === 1 ? 'batch is' : 'batches are'
        } being written through the memory pipeline`
      )
      setDialogOpen(false)
      setForeignText('')
      // The writer works through the queue; give the first batch a moment,
      // then show whatever has landed.
      setTimeout(() => {
        dispatch(getMemoryItems())
        dispatch(getRetiredMemoryItems())
      }, 12000)
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
            <DialogTitle>Import memories</DialogTitle>
            <DialogDescription>
              {mode === 'bundle' ? (
                <>
                  Paste or pick a <span className='font-mono'>{SCHEMA}</span>{' '}
                  bundle exported from DARE. A bundle restore needs an empty
                  store — export first if anything here matters, then Forget
                  everything.
                </>
              ) : (
                <>
                  Bring your memories over from ChatGPT, Claude, or any other
                  assistant. What you paste goes through DARE&apos;s own memory
                  pipeline — the writer and its rules decide what is kept,
                  exactly as if you had said it in chat.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='flex gap-1 rounded-lg bg-muted p-1'>
            {(
              [
                ['bundle', 'DARE bundle'],
                ['foreign', 'From another AI'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type='button'
                onClick={() => setMode(value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === value
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'foreign' && (
            <div className='space-y-3'>
              <div className='space-y-2 rounded-lg border border-border bg-muted/30 p-3'>
                <p className='text-xs font-medium'>
                  1. Ask your other assistant to export what it knows
                </p>
                <p className='text-xs text-muted-foreground'>
                  Copy this prompt, paste it there, and copy its answer back.
                </p>
                <Button variant='outline' size='sm' onClick={handleCopyPrompt}>
                  {copied ? (
                    <Check className='h-3.5 w-3.5' />
                  ) : (
                    <Copy className='h-3.5 w-3.5' />
                  )}
                  {copied ? 'Copied' : 'Copy the export prompt'}
                </Button>
              </div>
              <p className='text-xs font-medium'>2. Paste its answer here</p>
              <Textarea
                value={foreignText}
                onChange={(event) => setForeignText(event.target.value)}
                placeholder={'- I live in…\n- Always answer me in…'}
                className='h-40 text-xs'
              />
              <DialogFooter>
                <Button
                  onClick={handleForeignImport}
                  disabled={!foreignText.trim() || importing}
                >
                  {importing && <Loader2 className='h-4 w-4 animate-spin' />}
                  Import through the pipeline
                </Button>
              </DialogFooter>
            </div>
          )}

          {mode === 'bundle' && (
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
                  {preview.retired} retired, {preview.held} held,{' '}
                  {preview.rules} rules
                  {preview.hasDocument ? ', plus the profile document' : ''}.
                </p>
              )}

              <DialogFooter>
                <Button onClick={handleImport} disabled={!preview || importing}>
                  {importing && <Loader2 className='h-4 w-4 animate-spin' />}
                  Import {preview ? `${preview.records} memories` : ''}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MemoryPortability
