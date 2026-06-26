import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectDraft } from '@/redux/types/research'
import StepHeading from './StepHeading'

interface Props {
  title: string
  question: string
  field: string
  onPatch: (patch: Partial<ProjectDraft>) => void
}

const DefineStep = ({ title, question, field, onPatch }: Props) => (
  <div className='space-y-6'>
    <StepHeading
      title='What are you investigating?'
      subtitle='Name the project and the question that anchors it. Everything Scout does is judged against this.'
    />

    <div className='max-w-2xl space-y-5'>
      <div className='space-y-1.5'>
        <label htmlFor='draft-title' className='text-sm font-medium'>
          Project title
        </label>
        <Input
          id='draft-title'
          value={title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder='e.g. Distributed Governance in AI Research'
        />
      </div>

      <div className='space-y-1.5'>
        <label htmlFor='draft-question' className='text-sm font-medium'>
          Research question
        </label>
        <Textarea
          id='draft-question'
          value={question}
          onChange={(e) => onPatch({ question: e.target.value })}
          placeholder='The guiding question this project sets out to answer.'
          rows={3}
        />
        <p className='text-xs text-muted-foreground'>
          A clear question makes Scout&rsquo;s findings sharper and easier to
          judge.
        </p>
      </div>

      <div className='space-y-1.5'>
        <label htmlFor='draft-field' className='text-sm font-medium'>
          Field
        </label>
        <Input
          id='draft-field'
          value={field}
          onChange={(e) => onPatch({ field: e.target.value })}
          placeholder='e.g. Bioethics'
        />
      </div>
    </div>
  </div>
)

export default DefineStep
