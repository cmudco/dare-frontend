import { createContext, useContext } from 'react'

export type NodeErrors = {
  prompt?: string
  title?: string
  description?: string
  llm?: string
}

export type ErrorsContextValue = {
  errorsByNodeId: Record<string, NodeErrors>
  clearNodeError: (nodeId: string, field?: keyof NodeErrors) => void
}

export const ErrorsContext = createContext<ErrorsContextValue>({
  errorsByNodeId: {},
  clearNodeError: () => {},
})

export const useErrorsContext = () => useContext(ErrorsContext)
