import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getResearchProject } from '@/redux/asyncThunks/research'
import { getMcpConnections } from '@/redux/asyncThunks/mcp'
import ResearchWorkspaceView from '../ResearchWorkspaceView'

// Authenticated, full-canvas workspace for a single research project.
// Reuses the shared workspace view (the same one as the public preview),
// fetching the selected project (a single payload for the whole workspace)
// and resolving its enabled tools against the user's MCP connections.
const ResearchWorkspace = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const project = useAppSelector((state) =>
    state.research.projects.find((p) => String(p.id) === projectId)
  )

  useEffect(() => {
    const id = Number(projectId)
    if (!Number.isNaN(id)) {
      dispatch(getResearchProject(id))
    }
    dispatch(getMcpConnections())
  }, [dispatch, projectId])

  return (
    <ResearchWorkspaceView
      projectId={project?.id}
      projectTitle={project?.title}
      projectMeta={project?.field}
      question={project?.question ?? ''}
      sourceCount={project?.sourceCount ?? 0}
      enabledTools={project?.enabledTools ?? []}
      runs={project?.runs ?? []}
      sources={project?.sources ?? []}
      soulFile={project?.soulFile ?? null}
      projectMemory={project?.projectMemory ?? []}
      memoryProposals={project?.memoryProposals ?? []}
      onBack={() => navigate('/research')}
    />
  )
}

export default ResearchWorkspace
