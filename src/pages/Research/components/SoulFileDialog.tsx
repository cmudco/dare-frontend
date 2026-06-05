import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type {
  ResearchSoulFile,
  ResearchSoulFileDraft,
  ResearchSoulFileTemplateMetadata,
} from '@/redux/types/research'
import { StandardsTemplate } from '@/utils/constants/research'

interface Props {
  open: boolean
  soulFile: ResearchSoulFile | null
  templates: ResearchSoulFileTemplateMetadata[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (draft: ResearchSoulFileDraft) => void
}

const emptyDraft: ResearchSoulFileDraft = {
  title: '',
  description: '',
  templateKey: StandardsTemplate.RESEARCH_ETHICS,
  body: '',
  isDefault: false,
}

const SoulFileDialog = ({
  open,
  soulFile,
  templates,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: Props) => {
  const fallbackTemplate = useMemo(
    () =>
      templates.find(
        (template) => template.key === StandardsTemplate.RESEARCH_ETHICS
      ) ?? templates[0],
    [templates]
  )
  const [draft, setDraft] = useState<ResearchSoulFileDraft>(emptyDraft)

  useEffect(() => {
    if (!open) return

    if (soulFile) {
      setDraft({
        title: soulFile.title,
        description: soulFile.description,
        templateKey: soulFile.templateKey,
        body: soulFile.currentVersion?.body ?? '',
        isDefault: soulFile.isDefault,
      })
      return
    }

    setDraft({
      ...emptyDraft,
      title: fallbackTemplate?.name ?? '',
      description: fallbackTemplate?.description ?? '',
      templateKey: fallbackTemplate?.key ?? StandardsTemplate.RESEARCH_ETHICS,
      body: fallbackTemplate?.body ?? '',
    })
  }, [fallbackTemplate, open, soulFile])

  const handleTemplateChange = (templateKey: StandardsTemplate) => {
    const template = templates.find((item) => item.key === templateKey)
    setDraft((current) => ({
      ...current,
      title: current.title || template?.name || '',
      description: template?.description ?? current.description,
      templateKey,
      body: template?.body ?? current.body,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[86vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {soulFile ? 'Edit soul file' : 'New soul file'}
          </DialogTitle>
          <DialogDescription>
            Saving creates a new immutable version. Existing staged and approved
            items keep the version they already used.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='soul-title'>Title</Label>
            <Input
              id='soul-title'
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder='Research Ethics'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='soul-template'>Template</Label>
            <Select
              value={draft.templateKey}
              onValueChange={(value) =>
                handleTemplateChange(value as StandardsTemplate)
              }
            >
              <SelectTrigger id='soul-template'>
                <SelectValue placeholder='Choose template' />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.key} value={template.key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='soul-description'>Description</Label>
            <Input
              id='soul-description'
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder='How this standard should guide the project'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='soul-body'>Standards</Label>
            <Textarea
              id='soul-body'
              value={draft.body}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              rows={12}
              placeholder='Write the standards that should govern project work.'
            />
          </div>

          <label className='flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2'>
            <span>
              <span className='block text-sm font-medium'>
                Default soul file
              </span>
              <span className='block text-xs text-muted-foreground'>
                New projects can use this when no project-specific file is
                selected.
              </span>
            </span>
            <Switch
              checked={draft.isDefault}
              onCheckedChange={(checked) =>
                setDraft((current) => ({
                  ...current,
                  isDefault: checked,
                }))
              }
            />
          </label>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || draft.title.trim().length === 0}
            onClick={() =>
              onConfirm({
                ...draft,
                title: draft.title.trim(),
                description: draft.description?.trim() ?? '',
              })
            }
          >
            {soulFile ? 'Save new version' : 'Create soul file'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SoulFileDialog
