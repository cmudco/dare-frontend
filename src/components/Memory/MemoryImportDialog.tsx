import { useMemo, useState } from 'react'
import { ChevronDown, Clipboard, Loader2, Upload } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { getMemoryItems, importMemory } from '@/redux/asyncThunks/memory'
import { AppDispatch } from '@/redux/store'
import { MemoryImportItem, MemoryType } from '@/redux/types/memory'
import { getTypeBadgeColor } from '@/utils/memoryUtils'
import { Badge } from '@/components/ui/badge'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { cn } from '@/lib/utils'

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

// Mirror the backend import guardrails (memory/constants.py).
const MAX_IMPORT_ITEMS = 200
const MAX_CONTENT_LENGTH = 4000
const MAX_CATEGORIES = 10

const PREVIEW_ITEM_LIMIT = 5

const MEMORY_TYPE_VALUES = Object.values(MemoryType) as string[]

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

/**
 * Parse pasted text into a JSON value, tolerating the common ways AIs wrap
 * their output: markdown code fences and prose before/after the JSON.
 */
const parseJsonLeniently = (input: string): unknown => {
  const stripped = input
    .replace(/^[^[{]*```(?:json)?\s*/i, '')
    .replace(/\s*```[^\]}]*$/, '')
    .trim()

  try {
    return JSON.parse(stripped)
  } catch {
    const start = stripped.indexOf('[')
    const end = stripped.lastIndexOf(']')
    if (start === -1 || end <= start) {
      throw new Error('Could not find a JSON array in the pasted text.')
    }
    return JSON.parse(stripped.slice(start, end + 1))
  }
}

const normalizeMemoryType = (value: unknown): string => {
  if (typeof value !== 'string') {
    return MemoryType.PROFILE
  }
  const normalized = value.trim().toLowerCase()
  return MEMORY_TYPE_VALUES.includes(normalized)
    ? normalized
    : MemoryType.PROFILE
}

const parseCategories = (value: unknown, itemIndex: number): string[] => {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error(`Item ${itemIndex + 1} categories must be an array.`)
  }

  const categories = value
    .map((category) => (typeof category === 'string' ? category.trim() : ''))
    .filter((category) => category.length > 0)

  return categories.slice(0, MAX_CATEGORIES)
}

const parseMemoryImportItems = (input: string): MemoryImportItem[] => {
  const parsed = parseJsonLeniently(input)

  // Accept both a bare array and an { items: [...] } wrapper.
  const rawItems =
    isUnknownObject(parsed) && Array.isArray(parsed.items)
      ? parsed.items
      : parsed

  if (!Array.isArray(rawItems)) {
    throw new Error('Paste a JSON array of memory items.')
  }

  if (rawItems.length === 0) {
    throw new Error('Add at least one memory item.')
  }

  if (rawItems.length > MAX_IMPORT_ITEMS) {
    throw new Error(
      `Too many items (${rawItems.length}). Import at most ${MAX_IMPORT_ITEMS} at a time.`
    )
  }

  return rawItems.map((item, index) => {
    if (!isUnknownObject(item)) {
      throw new Error(`Item ${index + 1} must be an object.`)
    }

    if (typeof item.content !== 'string' || item.content.trim().length === 0) {
      throw new Error(`Item ${index + 1} needs non-empty content.`)
    }

    const content = item.content.trim()
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(
        `Item ${index + 1} content is too long (${content.length} characters, max ${MAX_CONTENT_LENGTH}).`
      )
    }

    return {
      memoryType: normalizeMemoryType(item.memoryType),
      content,
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
  const [promptVisible, setPromptVisible] = useState(false)
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
      setPromptVisible(false)
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
      setPromptVisible(true)
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

  const itemCount = parsedPreview.items.length

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
            Bring your memories over from ChatGPT, Claude, Gemini, or any other
            AI in two steps.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-foreground text-sm font-medium'>
                1. Copy the prompt into the other AI
              </span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCopyPrompt}
              >
                <Clipboard className='h-4 w-4' />
                Copy prompt
              </Button>
            </div>
            <Collapsible open={promptVisible} onOpenChange={setPromptVisible}>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs'
                >
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform',
                      promptVisible && 'rotate-180'
                    )}
                  />
                  {promptVisible ? 'Hide prompt' : 'Show prompt'}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Textarea
                  readOnly
                  value={MEMORY_IMPORT_PROMPT}
                  className='mt-2 min-h-44 resize-none font-mono text-xs'
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className='space-y-2'>
            <span className='text-foreground text-sm font-medium'>
              2. Paste the JSON response here
            </span>
            <Textarea
              value={pastedJson}
              onChange={(event) => setPastedJson(event.target.value)}
              placeholder='[{"content":"The user prefers concise technical answers.","memoryType":"profile","categories":["preferences"]}]'
              className='min-h-40 resize-y font-mono text-xs'
            />
            {parsedPreview.error && (
              <p className='text-destructive text-sm'>{parsedPreview.error}</p>
            )}
          </div>

          {itemCount > 0 && (
            <div className='border-border bg-muted/20 rounded-md border p-3'>
              <div className='text-foreground mb-3 text-sm font-medium'>
                Preview ({itemCount} {itemCount === 1 ? 'memory' : 'memories'})
              </div>
              <div className='max-h-48 space-y-3 overflow-y-auto pr-1'>
                {parsedPreview.items
                  .slice(0, PREVIEW_ITEM_LIMIT)
                  .map((item, index) => (
                    <div key={`${item.content}-${index}`} className='space-y-1'>
                      <div className='text-foreground text-sm'>
                        {item.content}
                      </div>
                      <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs capitalize',
                            getTypeBadgeColor(item.memoryType)
                          )}
                        >
                          {item.memoryType}
                        </Badge>
                        {item.categories.map((category) => (
                          <span
                            key={`${item.content}-${category}`}
                            className='bg-muted rounded-full px-2 py-0.5'
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                {itemCount > PREVIEW_ITEM_LIMIT && (
                  <div className='text-muted-foreground text-xs'>
                    {itemCount - PREVIEW_ITEM_LIMIT} more memories
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
              importing || itemCount === 0 || Boolean(parsedPreview.error)
            }
          >
            {importing && <Loader2 className='h-4 w-4 animate-spin' />}
            {itemCount > 0
              ? `Import ${itemCount} ${itemCount === 1 ? 'memory' : 'memories'}`
              : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MemoryImportDialog
