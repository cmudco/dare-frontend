import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CITATION_STYLES, STANDARD_CATALOG } from '@/utils/constants/research'

interface Props {
  value: string[]
  onChange: (next: string[]) => void
}

const CATALOG_RULES: string[] = STANDARD_CATALOG.flatMap((group) =>
  group.options.map((option) => option.rule)
)
const CITATION_PREFIX = 'Format citations in '
const citationRule = (style: string) => `${CITATION_PREFIX}${style}.`

/**
 * The scholar's researcher-wide standards: quick picks written as the rule the
 * agent follows, a citation style, and their own rules in their own words.
 */
const StandardsPicker = ({ value, onChange }: Props) => {
  const [draft, setDraft] = useState('')
  const citation = value.find((rule) => rule.startsWith(CITATION_PREFIX))
  const custom = value.filter(
    (rule) => !CATALOG_RULES.includes(rule) && rule !== citation
  )

  const toggle = (rule: string) =>
    onChange(
      value.includes(rule) ? value.filter((r) => r !== rule) : [...value, rule]
    )

  const setCitation = (style: string) => {
    const rest = value.filter((rule) => !rule.startsWith(CITATION_PREFIX))
    onChange(style ? [...rest, citationRule(style)] : rest)
  }

  const addCustom = () => {
    const rule = draft.trim()
    if (!rule || value.includes(rule)) return
    onChange([...value, rule])
    setDraft('')
  }

  return (
    <div className='space-y-4'>
      {STANDARD_CATALOG.map((group) => (
        <div key={group.group}>
          <p className='mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
            {group.group}
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {group.options.map((option) => {
              const on = value.includes(option.rule)
              return (
                <button
                  key={option.label}
                  type='button'
                  aria-pressed={on}
                  title={option.rule}
                  onClick={() => toggle(option.rule)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    on
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <p className='mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          Citation style
        </p>
        <div className='flex flex-wrap gap-1.5'>
          {CITATION_STYLES.map((style) => {
            const on = citation === citationRule(style)
            return (
              <button
                key={style}
                type='button'
                aria-pressed={on}
                onClick={() => setCitation(on ? '' : style)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  on
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {style}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className='mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          In your own words
        </p>
        {custom.length > 0 && (
          <ul className='mb-2 space-y-1'>
            {custom.map((rule) => (
              <li
                key={rule}
                className='flex items-start gap-2 rounded-lg border border-border px-3 py-1.5 text-sm'
              >
                <span className='flex-1'>{rule}</span>
                <button
                  type='button'
                  onClick={() => toggle(rule)}
                  aria-label={`Remove “${rule}”`}
                  className='mt-0.5 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          className='flex gap-2'
          onSubmit={(e) => {
            e.preventDefault()
            addCustom()
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder='e.g. Read MDPI and Frontiers papers critically; never use one as sole support'
            aria-label='Add a standard'
          />
          <Button
            type='submit'
            size='sm'
            variant='outline'
            disabled={!draft.trim()}
          >
            <Plus className='h-4 w-4' /> Add
          </Button>
        </form>
      </div>
    </div>
  )
}

export default StandardsPicker
