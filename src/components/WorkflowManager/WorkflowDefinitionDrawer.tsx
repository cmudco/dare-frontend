import React from 'react'

import WorkflowViewer from './WorkflowViewer'

interface WorkflowDefinitionDrawerProps {
  workflowId: string
  isOpen: boolean
  onClose: () => void
  title?: string
}

const WorkflowDefinitionDrawer: React.FC<WorkflowDefinitionDrawerProps> = ({
  workflowId,
  isOpen,
  onClose,
  title = 'Workflow Definition',
}) => {
  return (
    <WorkflowViewer
      runId={workflowId}
      isOpen={isOpen}
      onClose={onClose}
      mode='view'
      title={title}
      showActions={true}
    />
  )
}

export default WorkflowDefinitionDrawer
