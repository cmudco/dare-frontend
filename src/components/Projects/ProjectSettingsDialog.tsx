import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { useAppSelector } from '@/redux/hooks'
import type { Project, ProjectUpdate } from '@/redux/types/project'
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_INSTRUCTIONS_MAX_LENGTH,
  ProjectMemoryScope,
} from '@/utils/constants/project'
import { persistableModels } from './projectModels'
import ProjectNameField from './ProjectNameField'

export type ProjectSettingsSection = 'instructions' | 'defaults' | 'memory'

// The control each rail shortcut lands on when the dialog opens.
const SECTION_TARGET: Record<ProjectSettingsSection, string> = {
  instructions: 'settings-project-instructions',
  defaults: 'settings-project-model',
  memory: 'settings-project-memory',
}

const HIGHLIGHT_MS = 1600

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Section to scroll to and focus on open; omit to open at the top. */
  section?: ProjectSettingsSection
  project: Project
  onSave: (update: ProjectUpdate) => Promise<void>
  onDelete: () => void
}

const NONE = 'none'

type Draft = Required<
  Pick<
    ProjectUpdate,
    | 'name'
    | 'icon'
    | 'description'
    | 'prompt'
    | 'instructions'
    | 'defaultModel'
    | 'webSearchEnabled'
    | 'artifactsEnabled'
    | 'memoryEnabled'
    | 'memoryScope'
  >
>

const draftFrom = (project: Project): Draft => ({
  name: project.name,
  icon: project.icon,
  description: project.description,
  prompt: project.prompt,
  instructions: project.instructions,
  defaultModel: project.defaultModel,
  webSearchEnabled: project.webSearchEnabled,
  artifactsEnabled: project.artifactsEnabled,
  memoryEnabled: project.memoryEnabled,
  memoryScope: project.memoryScope,
})

const changedFields = (draft: Draft, project: Project): ProjectUpdate => {
  const original = draftFrom(project)
  return Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) => original[key as keyof Draft] !== value
    )
  )
}

const MEMORY_HELP: Record<ProjectMemoryScope, string> = {
  [ProjectMemoryScope.ALL]:
    'Chats in this project can recall anything DARE remembers about you.',
  [ProjectMemoryScope.PROJECT]:
    'Chats in this project only recall what was learned in this project. Your profile still applies.',
}

const SettingsForm = ({
  project,
  section,
  onSave,
  onDelete,
  onClose,
}: Omit<Props, 'open' | 'onOpenChange'> & { onClose: () => void }) => {
  const [highlighted, setHighlighted] = useState(section)
  useEffect(() => {
    if (!highlighted) return
    const timer = setTimeout(() => setHighlighted(undefined), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [highlighted])
  const sectionClass = (key: ProjectSettingsSection, base: string) =>
    `${base} -mx-2 rounded-lg px-2 py-1 transition-colors duration-500 ${
      highlighted === key ? 'bg-primary/10' : 'bg-transparent'
    }`

  const prompts = useAppSelector((state) => state.prompt.prompts)
  const pickerEntries = useAppSelector(
    (state) => state.conversation.pickerEntries
  )
  const enableMemory = useFeatureFlag('enableMemory')
  const [draft, setDraft] = useState<Draft>(() => draftFrom(project))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editing a prompt versions it, so the library lists every version; offer the newest.
  const latestPrompts = useMemo(() => {
    const replaced = new Set(prompts.map((prompt) => prompt.parent))
    return prompts.filter((prompt) => !replaced.has(prompt.id))
  }, [prompts])
  const models = useMemo(
    () => persistableModels(pickerEntries),
    [pickerEntries]
  )

  const update = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setError(null)
  }

  const changes = changedFields(draft, project)
  const dirty = Object.keys(changes).length > 0

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setError('Give the project a name.')
      return
    }
    setSaving(true)
    try {
      await onSave(changes)
      onClose()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' && rejection
          ? rejection
          : 'Could not save settings. Try again.'
      )
      setSaving(false)
    }
  }

  const linkedPrompt = latestPrompts.find(
    (prompt) => prompt.id === draft.prompt
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle>Project settings</DialogTitle>
      </DialogHeader>

      <div className='-mx-6 flex max-h-[65vh] flex-col gap-6 overflow-y-auto px-6 py-1'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='settings-project-name'>Project name</Label>
          <ProjectNameField
            id='settings-project-name'
            name={draft.name}
            icon={draft.icon}
            onNameChange={(name) => update({ name })}
            onIconChange={(icon) => update({ icon })}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='settings-project-description'>Description</Label>
          <Input
            id='settings-project-description'
            value={draft.description}
            maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
            placeholder='What is this project about?'
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>

        <div className={sectionClass('instructions', 'flex flex-col gap-1.5')}>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='settings-project-instructions'>Instructions</Label>
            <Select
              value={draft.prompt === null ? '' : String(draft.prompt)}
              onValueChange={(value) => {
                const chosen = latestPrompts.find(
                  (prompt) => String(prompt.id) === value
                )
                update(
                  chosen
                    ? { prompt: chosen.id, instructions: chosen.content }
                    : { prompt: null, instructions: '' }
                )
              }}
            >
              <SelectTrigger
                aria-label='Start from a saved prompt'
                className='h-8 w-auto max-w-[220px] gap-1 border-none bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:text-foreground'
              >
                <SelectValue placeholder='Use a saved prompt' />
              </SelectTrigger>
              <SelectContent align='end'>
                {draft.prompt !== null && (
                  <SelectItem value={NONE}>Clear instructions</SelectItem>
                )}
                {latestPrompts.map((prompt) => (
                  <SelectItem key={prompt.id} value={String(prompt.id)}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className='text-xs text-muted-foreground'>
            Set context and how DARE responds in this project. New chats start
            with these instructions.
          </p>
          <Textarea
            id='settings-project-instructions'
            rows={6}
            value={draft.instructions}
            maxLength={PROJECT_INSTRUCTIONS_MAX_LENGTH}
            placeholder='e.g. "Review like an NSF panelist. Cite the RFP section for every requirement. Keep answers short and specific."'
            onChange={(e) => update({ instructions: e.target.value })}
            className='resize-y'
          />
          <p className='flex items-center gap-1 text-xs text-muted-foreground'>
            {linkedPrompt
              ? `Saved in your Prompts library as “${linkedPrompt.title}”. Edits save a new version.`
              : 'Saved to your Prompts library so you can reuse it.'}
            <Link
              to='/prompts'
              className='inline-flex items-center hover:text-foreground'
              aria-label='Open Prompts library'
            >
              <ArrowUpRight className='h-3 w-3' />
            </Link>
          </p>
        </div>

        <div className={sectionClass('defaults', 'flex flex-col gap-3')}>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='settings-project-model'>Model</Label>
            <Select
              value={
                draft.defaultModel === null ? NONE : String(draft.defaultModel)
              }
              onValueChange={(value) =>
                update({ defaultModel: value === NONE ? null : Number(value) })
              }
            >
              <SelectTrigger id='settings-project-model'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Choose in each chat</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col divide-y divide-border rounded-lg border border-border'>
            {(
              [
                ['webSearchEnabled', 'Web search', 'Look things up on the web'],
                [
                  'artifactsEnabled',
                  'Artifacts',
                  'Produce documents, slides and long-form output',
                ],
                ...(enableMemory
                  ? ([
                      [
                        'memoryEnabled',
                        'Memory',
                        'Recall and learn facts across chats',
                      ],
                    ] as const)
                  : []),
              ] as const
            ).map(([field, label, hint]) => (
              <div
                key={field}
                className='flex items-center justify-between gap-3 px-3 py-2.5'
              >
                <div>
                  <Label htmlFor={`settings-${field}`}>{label}</Label>
                  <p className='text-xs text-muted-foreground'>{hint}</p>
                </div>
                <Switch
                  id={`settings-${field}`}
                  checked={draft[field]}
                  onCheckedChange={(checked) => update({ [field]: checked })}
                />
              </div>
            ))}
          </div>
          <p className='text-xs text-muted-foreground'>
            New chats start with these settings; each chat can still change
            them.
          </p>
        </div>

        {enableMemory && (
          <div className={sectionClass('memory', 'flex flex-col gap-1.5')}>
            <Label htmlFor='settings-project-memory'>Memory</Label>
            <Select
              value={draft.memoryScope}
              onValueChange={(value) =>
                update({
                  memoryScope:
                    value === ProjectMemoryScope.PROJECT
                      ? ProjectMemoryScope.PROJECT
                      : ProjectMemoryScope.ALL,
                })
              }
            >
              <SelectTrigger id='settings-project-memory'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectMemoryScope.ALL}>
                  Default memory
                </SelectItem>
                <SelectItem value={ProjectMemoryScope.PROJECT}>
                  Project-only memory
                </SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              {MEMORY_HELP[draft.memoryScope]}
            </p>
          </div>
        )}

        <div>
          <Button
            type='button'
            variant='outline'
            onClick={onDelete}
            className='border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive'
          >
            Delete project
          </Button>
        </div>
      </div>

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant='outline' onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !dirty}>
          {saving && <Loader2 className='h-4 w-4 animate-spin' />}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

const ProjectSettingsDialog = ({ open, onOpenChange, ...rest }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className='max-w-lg rounded-2xl'
      onOpenAutoFocus={(event) => {
        const target =
          rest.section && document.getElementById(SECTION_TARGET[rest.section])
        if (!target) return
        event.preventDefault()
        target.scrollIntoView({ block: 'center' })
        target.focus({ preventScroll: true })
      }}
    >
      <SettingsForm {...rest} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)

export default ProjectSettingsDialog
