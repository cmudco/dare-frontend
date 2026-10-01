import React, { useState } from 'react'
import {
  ArrowUp,
  Brain,
  Globe,
  Loader2,
  ScrollText,
  Sparkles,
} from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import type { Project } from '@/redux/types/project'
import { ProjectMemoryScope } from '@/utils/constants/project'

interface Props {
  project: Project
  onStart: (message: string) => Promise<void>
}

const Chip = ({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <span className='inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground'>
    {icon}
    {children}
  </span>
)

/** "New chat in …" box: the first message starts a chat with the project's defaults. */
const ProjectComposer = ({ project, onStart }: Props) => {
  const [message, setMessage] = useState('')
  const [starting, setStarting] = useState(false)
  const modelName = useAppSelector(
    (state) =>
      state.conversation.pickerEntries.find(
        (entry) => entry.id === String(project.defaultModel)
      )?.name
  )

  const start = async () => {
    const text = message.trim()
    if (!text || starting) return
    setStarting(true)
    try {
      await onStart(text)
    } finally {
      setStarting(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      start()
    }
  }

  return (
    <div className='rounded-3xl border border-border bg-card shadow-xs transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/40'>
      <label htmlFor='project-composer' className='sr-only'>
        New chat in {project.name}
      </label>
      <textarea
        id='project-composer'
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`New chat in ${project.name}`}
        disabled={starting}
        className='block field-sizing-content max-h-60 min-h-14 w-full resize-none bg-transparent px-5 pt-4 text-[15px] outline-hidden placeholder:text-muted-foreground'
      />
      <div className='flex items-center gap-2 px-3 pt-1 pb-3'>
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-1.5 pl-2'>
          {modelName && (
            <Chip icon={<Sparkles className='h-3 w-3' />}>{modelName}</Chip>
          )}
          {project.instructions && (
            <Chip icon={<ScrollText className='h-3 w-3' />}>Instructions</Chip>
          )}
          {project.webSearchEnabled && (
            <Chip icon={<Globe className='h-3 w-3' />}>Web search</Chip>
          )}
          {project.memoryEnabled && (
            <Chip icon={<Brain className='h-3 w-3' />}>
              {project.memoryScope === ProjectMemoryScope.PROJECT
                ? 'Project memory'
                : 'Memory'}
            </Chip>
          )}
        </div>
        <button
          type='button'
          onClick={start}
          disabled={!message.trim() || starting}
          aria-label='Start chat'
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30'
        >
          {starting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ArrowUp className='h-4 w-4' />
          )}
        </button>
      </div>
    </div>
  )
}

export default ProjectComposer
