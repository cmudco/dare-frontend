import { ExecutionStatus } from '@/utils/constants/mcp'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  LucideIcon,
} from 'lucide-react'

interface MCPStatusBadgeProps {
  status: ExecutionStatus
}

interface StatusConfig {
  icon: LucideIcon
  label: string
  className: string
}

/**
 * MCPStatusBadge - Display execution status with icon and color
 */
const MCPStatusBadge = ({ status }: MCPStatusBadgeProps) => {
  const getConfig = (): StatusConfig => {
    switch (status) {
      case ExecutionStatus.PENDING:
        return {
          icon: Clock,
          label: 'Pending',
          className:
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
        }
      case ExecutionStatus.RUNNING:
        return {
          icon: Loader2,
          label: 'Running',
          className:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        }
      case ExecutionStatus.SUCCESS:
        return {
          icon: CheckCircle2,
          label: 'Success',
          className:
            'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        }
      case ExecutionStatus.FAILED:
      case ExecutionStatus.ERROR:
        return {
          icon: XCircle,
          label: 'Failed',
          className: 'bg-destructive/15 text-destructive',
        }
      default:
        return {
          icon: AlertCircle,
          label: 'Unknown',
          className: 'bg-muted text-muted-foreground',
        }
    }
  }

  const { icon: Icon, label, className } = getConfig()

  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon
        className={`h-3 w-3 ${status === ExecutionStatus.RUNNING ? 'animate-spin' : ''}`}
      />
      {label}
    </span>
  )
}

export default MCPStatusBadge
