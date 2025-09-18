import { useToastStore } from '@/stores/ui/toastStore'

type ToastFn = (message: string, durationMs?: number) => void

export const toast: {
  success: ToastFn
  error: ToastFn
  info: ToastFn
} = {
  success: (message: string, durationMs?: number) =>
    useToastStore
      .getState()
      .addToast({ type: 'success', message, duration: durationMs }),
  error: (message: string, durationMs?: number) =>
    useToastStore
      .getState()
      .addToast({ type: 'error', message, duration: durationMs }),
  info: (message: string, durationMs?: number) =>
    useToastStore
      .getState()
      .addToast({ type: 'info', message, duration: durationMs }),
}
