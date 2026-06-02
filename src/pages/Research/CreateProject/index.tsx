import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  addResearchProject,
  updateResearchProject,
} from '@/redux/researchSlice'
import {
  ResearchProjectStatus,
  ResearchTool,
  StandardsTemplate,
} from '@/utils/constants/research'
import type { ProjectDraft, ResearchProject } from '@/redux/types/research'
import DefineStep from './DefineStep'
import SourcesStep from './SourcesStep'
import ToolsStep from './ToolsStep'
import StandardsStep from './StandardsStep'
import ReviewStep from './ReviewStep'
import StepRail, { type WizardStepDef } from './StepRail'

const STEPS: WizardStepDef[] = [
  { key: 'define', label: 'Define' },
  { key: 'sources', label: 'Sources', optional: true },
  { key: 'tools', label: 'Tools' },
  { key: 'standards', label: 'Standards' },
  { key: 'review', label: 'Review' },
]

const buildInitialDraft = (project?: ResearchProject): ProjectDraft => ({
  title: project?.title ?? '',
  question: project?.question ?? '',
  field: project?.field ?? '',
  files: [],
  enabledTools: project?.enabledTools ?? [
    ResearchTool.PUBMED,
    ResearchTool.SCITE,
    ResearchTool.CONSENSUS,
  ],
  standardsTemplate:
    project?.standardsTemplate ?? StandardsTemplate.RESEARCH_ETHICS,
})

const CreateProject = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const isEditing = Boolean(projectId)
  const editingProject = useAppSelector((state) =>
    projectId
      ? state.research.projects.find((p) => p.id === projectId)
      : undefined
  )

  const [draft, setDraft] = useState<ProjectDraft>(() =>
    buildInitialDraft(editingProject)
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [furthestIndex, setFurthestIndex] = useState(0)

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
    setActiveIndex(index)
    setFurthestIndex((furthest) => Math.max(furthest, index))
  }

  const handleSubmit = () => {
    if (isEditing && editingProject) {
      dispatch(
        updateResearchProject({
          ...editingProject,
          title: draft.title.trim(),
          question: draft.question.trim(),
          field: draft.field.trim(),
          enabledTools: draft.enabledTools,
          standardsTemplate: draft.standardsTemplate,
          sourceCount: editingProject.sourceCount + draft.files.length,
          updatedAt: 'Updated just now',
        })
      )
      navigate(`/research/${editingProject.id}`)
      return
    }

    const id = crypto.randomUUID()
    const project: ResearchProject = {
      id,
      title: draft.title.trim(),
      question: draft.question.trim(),
      field: draft.field.trim(),
      status: ResearchProjectStatus.ACTIVE,
      enabledTools: draft.enabledTools,
      standardsTemplate: draft.standardsTemplate,
      pendingReviewCount: 0,
      approvedCount: 0,
      sourceCount: draft.files.length,
      updatedAt: 'Created just now',
      createdAt: 'Created just now',
    }
    dispatch(addResearchProject(project))
    navigate(`/research/${id}`)
  }

  const handleContinue = () => {
    if (!canContinue) return
    if (isLast) {
      handleSubmit()
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
            standardsTemplate={draft.standardsTemplate}
            onPatch={patch}
          />
        )
      default:
        return <ReviewStep draft={draft} />
    }
  }

  return (
    <div className='flex h-screen flex-col bg-background font-sans text-foreground'>
      <header className='sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4 lg:px-8'>
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
        <div className='mx-auto flex w-full max-w-5xl gap-8 px-6 py-10 lg:px-8'>
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

      <footer className='sticky bottom-0 border-t border-border bg-background/80 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 lg:px-8'>
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
            <span className='text-xs text-muted-foreground'>
              Step {activeIndex + 1} of {STEPS.length}
            </span>
            <Button onClick={handleContinue} disabled={!canContinue}>
              {isLast
                ? isEditing
                  ? 'Save changes'
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
