import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FlaskConical, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteResearchProject } from '@/redux/researchSlice'
import { getResearchProjects } from '@/redux/asyncThunks/research'
import type { ResearchProject } from '@/redux/types/research'
import ResearchProjectCard from './ResearchProjectCard'
import DeleteProjectDialog from './DeleteProjectDialog'

const ResearchProjects = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.research.projects)
  const loading = useAppSelector((state) => state.research.loading)

  const [deletingProject, setDeletingProject] =
    useState<ResearchProject | null>(null)

  useEffect(() => {
    dispatch(getResearchProjects())
  }, [dispatch])

  const handleConfirmDelete = () => {
    if (deletingProject) {
      dispatch(deleteResearchProject(deletingProject.id))
    }
    setDeletingProject(null)
  }

  return (
    <div className='flex h-full flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between'
      >
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-sky-50 p-2 dark:bg-sky-900/20'>
            <FlaskConical className='h-6 w-6 text-sky-600 dark:text-sky-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Research</h1>
            <p className='text-sm text-muted-foreground'>
              Your research projects — each a workspace for one line of inquiry.
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/research/new')} className='shrink-0'>
          <Plus className='h-4 w-4' /> New project
        </Button>
      </motion.div>

      <div className='px-6 pb-10 pt-6'>
        {loading && projects.length === 0 ? (
          <div className='flex items-center justify-center px-6 py-20 text-sm text-muted-foreground'>
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-20 text-center'>
            <div className='mb-4 rounded-full bg-muted p-3'>
              <FlaskConical className='h-6 w-6 text-muted-foreground' />
            </div>
            <p className='text-sm font-medium'>No research projects yet</p>
            <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
              Create your first project to start gathering and reviewing
              sources.
            </p>
            <Button
              variant='outline'
              size='sm'
              className='mt-4'
              onClick={() => navigate('/research/new')}
            >
              <Plus className='h-4 w-4' /> New project
            </Button>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {projects.map((project) => (
              <ResearchProjectCard
                key={project.id}
                project={project}
                onOpen={(p) => navigate(`/research/${p.id}`)}
                onEdit={(p) => navigate(`/research/${p.id}/edit`)}
                onDelete={setDeletingProject}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteProjectDialog
        project={deletingProject}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default ResearchProjects
