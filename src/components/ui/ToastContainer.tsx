import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { speedLines, ticks } from '@/lib/motion'
import { ToastItem, useToastStore } from '@/stores/ui/toastStore'

// As a toast lands, speed lines trail behind it; a success also throws ticks off its icon.
function playLanding(toast: HTMLDivElement, confirmed: boolean) {
  setTimeout(() => {
    const box = toast.getBoundingClientRect()
    speedLines(box.right + 4, box.top + box.height / 2, { direction: 0 })
    const icon = toast.firstElementChild?.getBoundingClientRect()
    if (confirmed && icon)
      ticks(icon.right, icon.top, { length: 6, distance: 9 })
  }, 250)
}

const ToastItemView: React.FC<{
  toast: ToastItem
  onClose: (id: string) => void
}> = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), toast.duration ?? 3000)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, onClose])

  const base = 'border-border bg-background text-foreground'
  const iconColor =
    toast.type === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : toast.type === 'error'
        ? 'text-destructive'
        : 'text-primary'

  return (
    <div
      role='status'
      aria-live='polite'
      className={`pointer-events-auto flex w-96 items-center gap-3 rounded-md border p-3 shadow-lg motion-safe:animate-toast-in ${base}`}
      onAnimationStart={(event) =>
        playLanding(event.currentTarget, toast.type === 'success')
      }
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${iconColor}`}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 className='h-5 w-5' />
        ) : toast.type === 'error' ? (
          <AlertCircle className='h-5 w-5' />
        ) : (
          <Info className='h-5 w-5' />
        )}
      </div>
      <div className='min-w-0 flex-1 text-sm leading-5 whitespace-pre-line'>
        {toast.message}
      </div>
      <button
        className='inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted'
        aria-label='Dismiss'
        onClick={() => onClose(toast.id)}
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  )
}

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className='pointer-events-none fixed inset-0 z-1000 flex items-start justify-end p-4 sm:p-6'>
      <div className='flex flex-col gap-2'>
        {toasts.map((t) => (
          <ToastItemView key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </div>,
    document.body
  )
}

export default ToastContainer
