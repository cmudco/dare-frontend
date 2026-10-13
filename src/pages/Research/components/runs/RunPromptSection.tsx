import type { ReactNode } from 'react'
import type { RunPrompt } from '../../types'
import RunSection from './RunSection'

const Part = ({
  label,
  note,
  children,
}: {
  label: string
  note: string
  children: ReactNode
}) => (
  <details className='group rounded-lg border border-border'>
    <summary className='flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-sm'>
      <span className='font-medium'>{label}</span>
      <span className='text-xs text-muted-foreground'>{note}</span>
    </summary>
    <div className='border-t border-border p-3'>{children}</div>
  </details>
)

const Text = ({ value }: { value: string }) =>
  value.trim() ? (
    <pre className='max-h-96 overflow-auto text-xs break-words whitespace-pre-wrap'>
      {value}
    </pre>
  ) : (
    <p className='text-xs text-muted-foreground'>Empty.</p>
  )

const chars = (value: string) => `${value.length.toLocaleString()} chars`

// Everything the run was sent, in the order the agent reads it: the profile
// files it loaded, its brief, the earlier turns, then the input.
const RunPromptSection = ({ prompt }: { prompt: RunPrompt | null }) => (
  <RunSection title='What the agent was sent'>
    {prompt ? (
      <div className='space-y-2'>
        <Part label='SOUL.md' note={chars(prompt.files['SOUL.md'])}>
          <Text value={prompt.files['SOUL.md']} />
        </Part>
        <Part label='MEMORY.md' note={chars(prompt.files['MEMORY.md'])}>
          <Text value={prompt.files['MEMORY.md']} />
        </Part>
        <Part label='USER.md' note={chars(prompt.files['USER.md'])}>
          <Text value={prompt.files['USER.md']} />
        </Part>
        <Part label='Skills' note={`${prompt.files.skills.length} loaded`}>
          <Text value={prompt.files.skills.join('\n')} />
        </Part>
        <Part label='Instructions' note={chars(prompt.instructions)}>
          <Text value={prompt.instructions} />
        </Part>
        <Part label='History' note={`${prompt.history.length} earlier turns`}>
          {prompt.history.length ? (
            <ol className='space-y-2'>
              {prompt.history.map((turn, index) => (
                <li key={index} className='text-xs'>
                  <span className='font-medium capitalize'>{turn.role}</span>
                  <pre className='mt-0.5 break-words whitespace-pre-wrap text-muted-foreground'>
                    {turn.content}
                  </pre>
                </li>
              ))}
            </ol>
          ) : (
            <p className='text-xs text-muted-foreground'>None.</p>
          )}
        </Part>
        <Part label='Input' note={chars(prompt.input)}>
          <Text value={prompt.input} />
        </Part>
      </div>
    ) : (
      <p className='text-sm text-muted-foreground'>
        Not recorded for this run.
      </p>
    )}
  </RunSection>
)

export default RunPromptSection
