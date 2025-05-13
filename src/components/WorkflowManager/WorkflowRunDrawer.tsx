import React from 'react'
import { WorkflowRunDrawerProps } from '@/redux/types/workflow'
import WorkflowViewer from './WorkflowViewer'

const WorkflowRunDrawer: React.FC<WorkflowRunDrawerProps> = ({
  runId,
  isOpen,
  onClose,
}) => {
  return (
    <WorkflowViewer
      runId={runId}
      isOpen={isOpen}
      onClose={onClose}
      mode='run'
      title='Workflow Run Details'
    />
  )
}

export default WorkflowRunDrawer
