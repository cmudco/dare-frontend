import { useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '@/redux/hooks'
import ResearchWorkspaceView from '../ResearchWorkspaceView'

// Authenticated, full-canvas workspace for a single research project.
// Reuses the shared workspace view (the same one as the public preview),
// wiring the selected project's title and a back-to-projects action.
const ResearchWorkspace = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const project = useAppSelector((state) =>
    state.research.projects.find((p) => String(p.id) === projectId)
  )

  return (
    <ResearchWorkspaceView
      projectTitle={project?.title}
      projectMeta={project?.field}
      enabledTools={project?.enabledTools}
      onBack={() => navigate('/research')}
    />
  )
}

export default ResearchWorkspace
