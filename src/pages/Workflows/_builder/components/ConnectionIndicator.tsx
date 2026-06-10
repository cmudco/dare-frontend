import { Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WebSocketConnectionStatus } from '@/redux/types/workflowBuilder'

interface ConnectionIndicatorProps {
  status: WebSocketConnectionStatus
}

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const Icon =
    status === 'connected' ? Wifi : status === 'connecting' ? Loader2 : WifiOff
  const iconClass = cn(
    'h-4 w-4',
    status === 'connected' && 'text-green-500',
    status === 'connecting' && 'animate-spin text-yellow-500',
    status === 'disconnected' && 'text-muted-foreground'
  )
  const label =
    status === 'connected'
      ? 'Live'
      : status === 'connecting'
        ? 'Connecting...'
        : 'Offline'

  return (
    <div className='flex items-center gap-1'>
      <Icon className={iconClass} />
      <span className='text-xs text-muted-foreground'>{label}</span>
    </div>
  )
}
