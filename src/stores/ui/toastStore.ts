import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  clear: () => void
}

let counter = 0
const genId = () => `${Date.now()}_${counter++}`

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, id: genId() }] })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))
