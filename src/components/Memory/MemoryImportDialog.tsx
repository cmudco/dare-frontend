import { useMemo, useState } from 'react'
import { Clipboard, Loader2, Upload } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { getMemoryItems, importMemory } from '@/redux/asyncThunks/memory'
import { AppDispatch } from '@/redux/store'
import { MemoryImportItem } from '@/redux/types/memory'
import { Button, type ButtonProps } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'

const MEMORY_IMPORT_PROMPT = `Export all of my stored memories and durable context you have learned about me. Preserve my words verbatim where possible, especially instructions, preferences, corrections, and rules I asked you to follow.

Return valid JSON only. Do not use markdown, code fences, comments, or explanation.

Return a JSON array. Each item must have exactly:
{
  "content": "Memory text",
  "memoryType": "profile",
  "categories": ["preferences"]
}

Allowed memoryType values:
- "behavior" for instructions, rules, communication style, always/never preferences
- "profile" for identity, career, education, personal details, broad preferences
- "knowledge" for projects, skills, domains, technical context
- "event" only for dated events or milestones

Use these categories where relevant:
- "instructions"
- "identity"
- "career"
- "projects"
- "preferences"

Extraction rules:
- Include only stable, useful memories.
- Do not invent details.
- Preserve exact wording where possible.
- One memory per object.
- For projects, use one object per meaningful project and begin content with the project name or short descriptor.
- If a date is known, include it inside content as "[YYYY-MM-DD] ...".
- If no date is known, do not invent one.
- Exclude secrets, passwords, API keys, tokens, credentials, payment details, private keys, and sensitive account data.`

interface MemoryImportDialogProps {
  importing: boolean
  triggerClassName?: string
  triggerLabel?: string
  triggerSize?: ButtonProps['size']
  triggerVariant?: ButtonProps['variant']
}

interface UnknownObject {
  [key: string]: unknown
}

interface ParsedMemoryItems {
  items: MemoryImportItem[]
  error: string | null
}

const isUnknownObject = (value: unknown): value is UnknownObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const parseCategories = (value: unknown, itemIndex: number): string[] => {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error(`Item ${itemIndex + 1} categories must be an array.`)
  }

  return value.map((category, categoryIndex) => {
    if (typeof category !== 'string' || category.trim().length === 0) {
      throw new Error(
        `Item ${itemIndex + 1} category ${categoryIndex + 1} must be text.`
      )
    }
    return category.trim()
  })
}

const parseMemoryImportItems = (input: string): MemoryImportItem[] => {
  const parsed = JSON.parse(input) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('Paste a JSON array of memory items.')
  }

  if (parsed.length === 0) {
    throw new Error('Add at least one memory item.')
  }

  return parsed.map((item, index) => {
    if (!isUnknownObject(item)) {
      throw new Error(`Item ${index + 1} must be an object.`)
    }

    if (typeof item.content !== 'string' || item.content.trim().length === 0) {
      throw new Error(`Item ${index + 1} needs non-empty content.`)
    }

    if (item.memoryType !== undefined && typeof item.memoryType !== 'string') {
      throw new Error(`Item ${index + 1} memoryType must be text.`)
    }

    return {
      memoryType:
        typeof item.memoryType === 'string' && item.memoryType.trim().length > 0
          ? item.memoryType.trim()
          : 'profile',
      content: item.content.trim(),
      categories: parseCategories(item.categories, index),
    }
  })
}

const MemoryImportDialog = ({
  importing,
  triggerClassName,
  triggerLabel = 'Import',
  triggerSize = 'default',
  triggerVariant = 'outline',
}: MemoryImportDialogProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pastedJson, setPastedJson] = useState('')

  const parsedPreview = useMemo<ParsedMemoryItems>(() => {
    if (pastedJson.trim().length === 0) {
      return { items: [], error: null }
    }

    try {
      return { items: parseMemoryImportItems(pastedJson), error: null }
    } catch (error) {
      return {
        items: [],
        error: error instanceof Error ? error.message : 'Invalid JSON.',
      }
    }
  }, [pastedJson])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen && !importing) {
      setPastedJson('')
    }
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MEMORY_IMPORT_PROMPT)
      toast({
        title: 'Prompt copied',
        description: 'Paste it into the source AI and return here with JSON.',
      })
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Select the prompt text and copy it manually.',
        variant: 'destructive',
      })
    }
  }

  const handleImport = async () => {
    if (parsedPreview.error || parsedPreview.items.length === 0) {
      return
    }

    const result = await dispatch(importMemory({ items: parsedPreview.items }))
    if (importMemory.fulfilled.match(result)) {
      toast({
        title: 'Memories imported',
        description: result.payload.message,
      })
      dispatch(getMemoryItems())
      setPastedJson('')
      setOpen(false)
      return
    }

    toast({
      title: 'Import failed',
      description: (result.payload as string) || 'Unable to import memories.',
      variant: 'destructive',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          disabled={importing}
          className={triggerClassName}
        >
          {importing ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Upload className='h-4 w-4' />
          )}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Import Memories</DialogTitle>
          <DialogDescription>
            Copy the prompt into another AI, then paste the JSON response here.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-sm font-medium text-foreground'>
                Prompt
              </span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCopyPrompt}
              >
                <Clipboard className='h-4 w-4' />
                Copy
              </Button>
            </div>
            <Textarea
              readOnly
              value={MEMORY_IMPORT_PROMPT}
              className='min-h-44 resize-none font-mono text-xs'
            />
          </div>

          <div className='space-y-2'>
            <span className='text-sm font-medium text-foreground'>JSON</span>
            <Textarea
              value={pastedJson}
              onChange={(event) => setPastedJson(event.target.value)}
              placeholder='[{"content":"The user prefers concise technical answers.","memoryType":"profile","categories":["communication"]}]'
              className='min-h-40 resize-y font-mono text-xs'
            />
            {parsedPreview.error && (
              <p className='text-sm text-destructive'>{parsedPreview.error}</p>
            )}
          </div>

          {parsedPreview.items.length > 0 && (
            <div className='rounded-md border border-border bg-muted/20 p-3'>
              <div className='mb-3 text-sm font-medium text-foreground'>
                Preview ({parsedPreview.items.length})
              </div>
              <div className='max-h-48 space-y-3 overflow-y-auto pr-1'>
                {parsedPreview.items.slice(0, 5).map((item, index) => (
                  <div key={`${item.content}-${index}`} className='space-y-1'>
                    <div className='text-sm text-foreground'>
                      {item.content}
                    </div>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                      <span>{item.memoryType}</span>
                      {item.categories.map((category) => (
                        <span
                          key={`${item.content}-${category}`}
                          className='rounded-full bg-muted px-2 py-0.5'
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {parsedPreview.items.length > 5 && (
                  <div className='text-xs text-muted-foreground'>
                    {parsedPreview.items.length - 5} more memories
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleImport}
            disabled={
              importing ||
              parsedPreview.items.length === 0 ||
              Boolean(parsedPreview.error)
            }
          >
            {importing && <Loader2 className='h-4 w-4 animate-spin' />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MemoryImportDialog
