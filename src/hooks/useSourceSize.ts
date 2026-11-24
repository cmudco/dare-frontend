import { useEffect, useState } from 'react'
import { getSourceSizeAPI } from '@/api/projects'
import type { SourceSize } from '@/redux/types/project'
import { useDebounce } from './useDebounce'

export type SourceSizeState =
  | { status: 'idle' | 'loading' | 'error'; size: null }
  | { status: 'ready'; size: SourceSize }

/** Live estimate of reading these files and folders in full on this model. */
export const useSourceSize = (
  fileIds: number[],
  folderIds: number[],
  modelRef: string | null
): SourceSizeState => {
  const key = useDebounce(
    JSON.stringify([[...fileIds].sort(), [...folderIds].sort(), modelRef]),
    300
  )
  const [state, setState] = useState<SourceSizeState>({
    status: 'idle',
    size: null,
  })

  useEffect(() => {
    const [files, folders, model] = JSON.parse(key) as [
      number[],
      number[],
      string | null,
    ]
    if (files.length + folders.length === 0) {
      setState({ status: 'idle', size: null })
      return
    }
    let stale = false
    setState({ status: 'loading', size: null })
    getSourceSizeAPI({ fileIds: files, folderIds: folders, modelRef: model })
      .then((size) => !stale && setState({ status: 'ready', size }))
      .catch(() => !stale && setState({ status: 'error', size: null }))
    return () => {
      stale = true
    }
  }, [key])

  return state
}
