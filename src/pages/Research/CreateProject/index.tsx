import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createResearchProject,
  updateResearchProject,
} from '@/redux/asyncThunks/research'
import {
  getProjectMemoryAPI,
  getResearcherStandardsAPI,
  getSoulFileAPI,
  saveProjectMemoryAPI,
  saveResearcherStandardsAPI,
  saveSoulFileAPI,
} from '@/api/research'
import { StandardsTemplate } from '@/utils/constants/research'
import type { ProjectDraft, ResearchProject } from '@/redux/types/research'
import DefineStep from './DefineStep'
import SourcesStep from './SourcesStep'
import ToolsStep from './ToolsStep'
import StandardsStep from './StandardsStep'
import ReviewStep from './ReviewStep'
import StepRail, { type WizardStepDef } from './StepRail'
import { buildMemory, memoryEntries } from './memoryDocument'
import {
  SOUL_PERSONAS,
  SOUL_SECTIONS,
  buildSoul,
  sectionBullets,
} from './soulDocument'

const STEPS: WizardStepDef[] = [
  { key: 'define', label: 'Define' },
  { key: 'sources', label: 'Sources', optional: true },
  { key: 'tools', label: 'Tools' },
  { key: 'standards', label: 'Standards' },
  { key: 'review', label: 'Review' },
]
const STANDARDS_STEP = 3
// One width for every step, header and footer, so margins never jump; wide
// enough for the Standards step's file editor.
const PAGE_WIDTH = 'max-w-7xl'

const buildInitialDraft = (project?: ResearchProject): ProjectDraft => ({
  title: project?.title ?? '',
  question: project?.question ?? '',
  field: project?.field ?? '',
  files: [],
  // Opt-in by design — the scholar enables tools explicitly in the Tools step.
  enabledTools: project?.enabledTools ?? [],
  standardsTemplate:
    project?.standardsTemplate ?? StandardsTemplate.RESEARCH_ETHICS,
  soulContent: null,
  memoryContent: null,
})

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, i) => item === b[i])

const CreateProject = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const isEditing = Boolean(projectId)
  const editingProject = useAppSelector((state) =>
    projectId
      ? state.research.projects.find((p) => String(p.id) === projectId)
      : undefined
  )

  const [draft, setDraft] = useState<ProjectDraft>(() =>
    buildInitialDraft(editingProject)
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [furthestIndex, setFurthestIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [savedStandards, setSavedStandards] = useState<string[]>([])
  const [savedSoul, setSavedSoul] = useState<string | null>(null)
  const [savedMemory, setSavedMemory] = useState<string[]>([])
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let active = true
    getResearcherStandardsAPI()
      .then(({ standards }) => {
        if (active) setSavedStandards(standards)
      })
      .catch(() => {
        if (active) setSubmitError('Could not load your saved standards.')
      })
    return () => {
      active = false
    }
  }, [])

  // Editing: the Standards step shows the SOUL.md in force, not a template.
  useEffect(() => {
    if (!projectId) return
    let active = true
    getSoulFileAPI(Number(projectId))
      .then((soul) => {
        if (!active || !soul) return
        setSavedSoul(soul.content)
        setDraft((prev) => ({ ...prev, soulContent: soul.content }))
      })
      .catch(() => {
        if (active) setSubmitError('Could not load the current SOUL.md.')
      })
    return () => {
      active = false
    }
  }, [projectId])

  // Editing: MEMORY.md shows the project memory in force.
  useEffect(() => {
    if (!projectId) return
    let active = true
    getProjectMemoryAPI(Number(projectId))
      .then(({ entries }) => {
        if (!active) return
        setSavedMemory(entries)
        setDraft((prev) => ({ ...prev, memoryContent: buildMemory(entries) }))
      })
      .catch(() => {
        if (active) setSubmitError('Could not load the current MEMORY.md.')
      })
    return () => {
      active = false
    }
  }, [projectId])

  // Editing an unknown project id → return to the list.
  useEffect(() => {
    if (isEditing && !editingProject) {
      navigate('/research', { replace: true })
    }
  }, [isEditing, editingProject, navigate])

  const patch = (p: Partial<ProjectDraft>) =>
    setDraft((prev) => ({ ...prev, ...p }))

  const isLast = activeIndex === STEPS.length - 1
  const canContinue = activeIndex === 0 ? draft.title.trim().length > 0 : true

  const goTo = (index: number) => {
    // The first visit to Standards drafts SOUL.md from the scholar's saved
    // evidence standards and the default research voice.
    if (index === STANDARDS_STEP && draft.soulContent === null) {
      patch({
        soulContent: buildSoul({
          persona: SOUL_PERSONAS[0],
          evidenceStandards: savedStandards,
        }),
        ...(draft.memoryContent === null && { memoryContent: '' }),
      })
    }
    setActiveIndex(index)
    setFurthestIndex((furthest) => Math.max(furthest, index))
  }

  /** Evidence standards follow the scholar into every project. */
  const saveStandards = async () => {
    if (draft.soulContent === null) return
    const standards = sectionBullets(
      draft.soulContent,
      SOUL_SECTIONS.evidence
    ).map((rule) => rule.trim())
    if (!sameList(standards, savedStandards)) {
      await saveResearcherStandardsAPI(standards)
    }
  }

  const handleSubmit = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      await saveStandards()
    } catch {
      setSubmitting(false)
      setSubmitError('Could not save your standards. Nothing else was saved.')
      return
    }

    if (isEditing && editingProject) {
      const result = await dispatch(
        updateResearchProject({
          id: editingProject.id,
          changes: {
            title: draft.title.trim(),
            question: draft.question.trim(),
            field: draft.field.trim(),
            enabledTools: draft.enabledTools,
            standardsTemplate: draft.standardsTemplate,
          },
        })
      )
      if (updateResearchProject.fulfilled.match(result)) {
        try {
          if (draft.soulContent !== null && draft.soulContent !== savedSoul) {
            await saveSoulFileAPI(editingProject.id, draft.soulContent)
          }
          const entries = memoryEntries(draft.memoryContent ?? '').map((e) =>
            e.trim()
          )
          if (draft.memoryContent !== null && !sameList(entries, savedMemory)) {
            await saveProjectMemoryAPI(editingProject.id, entries)
          }
        } catch {
          setSubmitting(false)
          setSubmitError('Saved the project, but not every file. Try again.')
          return
        }
      }
      setSubmitting(false)
      if (updateResearchProject.fulfilled.match(result)) {
        navigate(`/research/${editingProject.id}`)
      }
      return
    }

    const result = await dispatch(
      createResearchProject({
        title: draft.title.trim(),
        question: draft.question.trim(),
        field: draft.field.trim(),
        enabledTools: draft.enabledTools,
        standardsTemplate: draft.standardsTemplate,
        sources: draft.files.map((f) => ({
          name: f.name,
          kind: f.kind,
          sizeLabel: f.sizeLabel,
        })),
        projectMemory: memoryEntries(draft.memoryContent ?? '').map((e) =>
          e.trim()
        ),
        ...(draft.soulContent !== null && { soulContent: draft.soulContent }),
      })
    )
    setSubmitting(false)
    if (createResearchProject.fulfilled.match(result)) {
      navigate(`/research/${result.payload.id}`)
    }
  }

  const handleContinue = () => {
    if (!canContinue || submitting) return
    if (isLast) {
      void handleSubmit()
      return
    }
    goTo(activeIndex + 1)
  }

  const renderStep = () => {
    switch (activeIndex) {
      case 0:
        return (
          <DefineStep
            title={draft.title}
            question={draft.question}
            field={draft.field}
            onPatch={patch}
          />
        )
      case 1:
        return <SourcesStep files={draft.files} onPatch={patch} />
      case 2:
        return <ToolsStep enabledTools={draft.enabledTools} onPatch={patch} />
      case 3:
        return (
          <StandardsStep
            soul={draft.soulContent ?? ''}
            memory={draft.memoryContent ?? ''}
            savedStandardsCount={savedStandards.length}
            onPatch={patch}
          />
        )
      default:
        return <ReviewStep draft={draft} />
    }
  }

  return (
    <div className='flex h-screen flex-col bg-background font-sans text-foreground'>
      <header className='sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm'>
        <div
          className={cn(
            'mx-auto flex w-full items-center justify-between gap-4 px-6 py-4 lg:px-8',
            PAGE_WIDTH
          )}
        >
          <div className='min-w-0'>
            <button
              type='button'
              onClick={() => navigate('/research')}
              className='mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              <ArrowLeft className='h-3.5 w-3.5' /> All projects
            </button>
            <h1 className='truncate text-lg font-semibold tracking-tight'>
              {isEditing ? 'Edit project' : 'New research project'}
            </h1>
          </div>
        </div>
      </header>

      <div className='flex-1 overflow-auto'>
        <div
          className={cn(
            'mx-auto flex w-full gap-8 px-6 py-10 lg:px-8',
            PAGE_WIDTH
          )}
        >
          <aside className='hidden w-52 shrink-0 lg:block'>
            <StepRail
              steps={STEPS}
              activeIndex={activeIndex}
              furthestIndex={furthestIndex}
              onJump={goTo}
            />
          </aside>
          <main className='min-w-0 flex-1'>{renderStep()}</main>
        </div>
      </div>

      <footer className='sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-sm'>
        <div
          className={cn(
            'mx-auto flex w-full items-center justify-between px-6 py-4 lg:px-8',
            PAGE_WIDTH
          )}
        >
          <Button
            variant='ghost'
            onClick={() =>
              activeIndex === 0
                ? navigate('/research')
                : setActiveIndex(activeIndex - 1)
            }
          >
            {activeIndex === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className='flex items-center gap-4'>
            {submitError && (
              <span className='text-xs text-destructive'>{submitError}</span>
            )}
            <span className='text-xs text-muted-foreground'>
              Step {activeIndex + 1} of {STEPS.length}
            </span>
            <Button
              onClick={handleContinue}
              disabled={!canContinue || submitting}
            >
              {isLast
                ? isEditing
                  ? submitting
                    ? 'Saving…'
                    : 'Save changes'
                  : submitting
                    ? 'Creating…'
                    : 'Create project'
                : 'Continue'}
              {!isLast && <ArrowRight className='h-4 w-4' />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CreateProject
