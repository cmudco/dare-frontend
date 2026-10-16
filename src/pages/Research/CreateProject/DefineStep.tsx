import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ProjectDraft, ProjectKind } from '@/redux/types/research'
import { PROJECT_KINDS } from '@/utils/constants/research'
import StepHeading from './StepHeading'

interface Props {
  title: string
  question: string
  kind: ProjectKind
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const DefineStep = ({ title, question, kind, onPatch }: Props) => (
  <div className='space-y-6'>
    <StepHeading
      title='What do you want to find out?'
      subtitle='Name it and ask the question. Scouts judge every source against it.'
    />

    <div className='max-w-2xl space-y-5'>
      <div className='space-y-1.5'>
        <label htmlFor='draft-title' className='text-sm font-medium'>
          Project name
        </label>
        <Input
          id='draft-title'
          value={title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder='e.g. Islamic funds in Pakistan'
        />
      </div>

      <div className='space-y-1.5'>
        <label htmlFor='draft-question' className='text-sm font-medium'>
          Question
        </label>
        <Textarea
          id='draft-question'
          value={question}
          onChange={(e) => onPatch({ question: e.target.value })}
          placeholder='e.g. How do the main Islamic funds compare on fees, risk and returns?'
          rows={3}
        />
        <p className='text-xs text-muted-foreground'>
          Plain words are fine. A clear question gets sharper findings.
        </p>
      </div>

      <fieldset className='space-y-2'>
        <legend className='text-sm font-medium'>
          What kind of question is it?
        </legend>
        <p className='text-xs text-muted-foreground'>
          Sets which sources count and how recent they need to be.
        </p>
        <div className='grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3'>
          {PROJECT_KINDS.map((option) => (
            <button
              key={option.value}
              type='button'
              aria-pressed={kind === option.value}
              onClick={() => onPatch({ kind: option.value })}
              className={cn(
                'rounded-md border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                kind === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
              )}
            >
              <span className='block text-sm font-medium'>{option.label}</span>
              <span className='block text-xs text-muted-foreground'>
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  </div>
)

export default DefineStep
