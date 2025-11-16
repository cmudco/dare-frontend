import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatWorkflowRunLabel } from '@/utils/workflowUtils'
import { WorkflowRun } from '@/redux/types/workflow'

interface VersionDropdownProps {
  /**
   * List of available workflow runs to display as versions
   */
  versionRuns: WorkflowRun[]

  /**
   * Currently selected run ID
   */
  selectedRunId: number | undefined

  /**
   * Callback when user selects a different version
   */
  onRunChange: (runIdStr: string) => void

  /**
   * Whether to show the dropdown (controlled externally based on mode)
   */
  show: boolean
}

/**
 * Version dropdown for switching between completed workflow runs.
 *
 * USAGE:
 * - Only visible when not running and not in manual mode
 * - Shows completed/failed runs in reverse chronological order
 * - Allows viewing historical execution results
 *
 * INTEGRATION:
 * This component is designed to work seamlessly with `useWorkflowRunVersion` hook:
 *
 * @example
 * ```tsx
 * const versionState = useWorkflowRunVersion(nodeId)
 *
 * return (
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Chat Output</CardTitle>
 *       <VersionDropdown {...versionState} />
 *     </CardHeader>
 *   </Card>
 * )
 * ```
 */
export function VersionDropdown({
  versionRuns,
  selectedRunId,
  onRunChange,
  show,
}: VersionDropdownProps) {
  // Don't render if hidden or no selection available
  if (!show || !selectedRunId) return null

  return (
    <div className='flex items-center gap-2'>
      <span className='text-xs text-muted-foreground'>Version:</span>
      <Select value={selectedRunId.toString()} onValueChange={onRunChange}>
        <SelectTrigger className='h-7 w-full text-xs'>
          <SelectValue placeholder='Select version' />
        </SelectTrigger>
        <SelectContent>
          {versionRuns.map((run, index) => (
            <SelectItem
              key={run.id}
              value={run.id.toString()}
              className='text-xs'
            >
              {formatWorkflowRunLabel(run, versionRuns.length - index)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
