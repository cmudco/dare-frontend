import { useState } from 'react'
import { ChevronDown, ListPlus, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PROJECT_SCOPE_FIELDS } from '@/utils/constants/research'
import type { ProjectDraft } from '@/redux/types/research'
import StandardsPicker from '../components/learning/StandardsPicker'
import DocumentEditor from './DocumentEditor'
import StepHeading from './StepHeading'
import {
  MEMORY_MAX_CHARS,
  memorySize,
  memoryValue,
  setMemoryValue,
} from './memoryDocument'
import {
  SOUL_MAX_CHARS,
  SOUL_PERSONAS,
  SOUL_SECTIONS,
  applyPersona,
  isStructuredSoul,
  restructureSoul,
  sectionBullets,
  setSectionBullets,
} from './soulDocument'

interface Props {
  soul: string
  memory: string
  /** Already-saved researcher-wide standards, to say what is pre-filled. */
  savedStandardsCount: number
  onPatch: (patch: Partial<ProjectDraft>) => void
}

type FileKey = 'soul' | 'memory'

const Card = ({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) => (
  <section className='rounded-xl border border-border p-5'>
    <h3 className='text-sm font-semibold'>{title}</h3>
    <p className='mt-1 mb-4 text-xs leading-relaxed text-muted-foreground'>
      {hint}
    </p>
    {children}
  </section>
)

/**
 * The project's two Hermes files, written as documents. SOUL.md is who the
 * agent is (voice and evidence standards); MEMORY.md is what is true about
 * this project (scope, population, decisions). The controls on the left only
 * write into whichever file is open, and both files are saved as shown.
 */
const StandardsStep = ({
  soul,
  memory,
  savedStandardsCount,
  onPatch,
}: Props) => {
  const [active, setActive] = useState<FileKey>('soul')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const setSoul = (soulContent: string) => onPatch({ soulContent })
  const setMemory = (memoryContent: string) => onPatch({ memoryContent })
  const structured = isStructuredSoul(soul)
  const evidence = sectionBullets(soul, SOUL_SECTIONS.evidence)

  return (
    <div className='space-y-8'>
      <StepHeading
        title='Write the agent’s SOUL.md and MEMORY.md'
        subtitle='Two files Hermes reads before every Scout, Critic and chat run. SOUL.md is who the agent is; MEMORY.md is what is true about this project. Both are saved exactly as written.'
      />

      <div className='grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]'>
        {active === 'soul' ? (
          <div className='space-y-5'>
            <Card
              title='Start from a voice'
              hint='Rewrites Identity, Style, Avoid and Defaults. Your evidence standards stay as they are.'
            >
              <div className='space-y-2'>
                {SOUL_PERSONAS.map((persona) => (
                  <button
                    key={persona.key}
                    type='button'
                    onClick={() =>
                      setSoul(
                        structured
                          ? applyPersona(soul, persona)
                          : restructureSoul(soul, persona)
                      )
                    }
                    className='w-full rounded-lg border border-border px-3.5 py-2.5 text-left transition-colors hover:bg-accent'
                  >
                    <span className='block text-sm font-medium'>
                      {persona.name}
                    </span>
                    <span className='block text-xs text-muted-foreground'>
                      {persona.summary}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <section className='rounded-xl border border-border'>
              <button
                type='button'
                aria-expanded={quickAddOpen}
                onClick={() => setQuickAddOpen((open) => !open)}
                className='flex w-full items-center gap-3 px-5 py-4 text-left'
              >
                <ListPlus className='h-4 w-4 text-muted-foreground' />
                <span className='flex-1'>
                  <span className='block text-sm font-semibold'>
                    Quick-add evidence standards
                  </span>
                  <span className='block text-xs text-muted-foreground'>
                    {evidence.length} in the file
                    {savedStandardsCount > 0 &&
                      ` · ${savedStandardsCount} carried from your other projects`}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    quickAddOpen && 'rotate-180'
                  )}
                />
              </button>
              {quickAddOpen && (
                <div className='border-t border-border px-5 py-4'>
                  <StandardsPicker
                    value={evidence}
                    onChange={(next) =>
                      setSoul(
                        setSectionBullets(soul, SOUL_SECTIONS.evidence, next)
                      )
                    }
                  />
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className='space-y-5'>
            <Card
              title='Scope this project'
              hint='Each field writes one entry into MEMORY.md. Add decisions, the working thesis or anything else this project should never forget straight into the file.'
            >
              <div className='space-y-3'>
                {PROJECT_SCOPE_FIELDS.map((field) => (
                  <label key={field.key} className='block'>
                    <span className='mb-1 block text-xs font-medium'>
                      {field.label}
                    </span>
                    <Input
                      value={memoryValue(memory, field.label)}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setMemory(
                          setMemoryValue(memory, field.label, e.target.value)
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </Card>
            <p className='px-1 text-xs leading-relaxed text-muted-foreground'>
              MEMORY.md stays in this project. It never follows you into another
              one — that is what SOUL.md’s evidence standards are for.
            </p>
          </div>
        )}

        <DocumentEditor
          active={active}
          onSelect={(key) => setActive(key as FileKey)}
          notice={
            active === 'soul' &&
            !structured &&
            soul.trim() && (
              <div className='flex flex-wrap items-center gap-3 border-b border-border bg-muted/40 px-5 py-3 text-xs'>
                <span className='flex-1 text-muted-foreground'>
                  This SOUL.md predates the template. Restructure it into
                  Identity, Style, Evidence standards, Avoid and Defaults —
                  every rule you wrote is kept.
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    setSoul(restructureSoul(soul, SOUL_PERSONAS[0]))
                  }
                >
                  <Wand2 className='h-3.5 w-3.5' /> Restructure
                </Button>
              </div>
            )
          }
          files={[
            {
              key: 'soul',
              name: 'SOUL.md',
              caption:
                'Who the agent is — identity, style, evidence standards, what to avoid. Read first, on every run.',
              value: soul,
              onChange: setSoul,
              placeholder: '# Identity\n\nYou are…',
              size: soul.length,
              limit: SOUL_MAX_CHARS,
              limitNote: 'Hermes cuts everything past the limit',
            },
            {
              key: 'memory',
              name: 'MEMORY.md',
              caption:
                'What is true about this project — one entry per bullet. Only bullet lines are saved.',
              value: memory,
              onChange: setMemory,
              placeholder:
                '- Population or setting: …\n- Exclude: …\n- Working thesis: …',
              size: memorySize(memory),
              limit: MEMORY_MAX_CHARS,
              limitNote: 'keep it to the facts the agent must not forget',
            },
          ]}
        />
      </div>
    </div>
  )
}

export default StandardsStep
