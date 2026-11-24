import { useEffect, useState } from 'react'
import { getSourceSizeAPI } from '@/api/projects'
import type { SourceSize } from '@/redux/types/project'
import { useDebounce } from './useDebounce'

export type SourceSizeState =
  | { status: 'idle' | 'loading' | 'error'; size: null }
  | { status: 'ready'; size: SourceSize; refreshing: boolean }

type Measured =
  | { status: 'idle' | 'loading' | 'error'; size: null }
  | { status: 'ready'; size: SourceSize; key: string }

/** Live estimate of reading these files and folders in full on this model. */
export const useSourceSize = (
  fileIds: number[],
  folderIds: number[],
  modelRef: string | null
): SourceSizeState => {
  const currentKey = JSON.stringify([
    [...fileIds].sort(),
    [...folderIds].sort(),
    modelRef,
  ])
  const key = useDebounce(currentKey, 300)
  const [measured, setMeasured] = useState<Measured>({
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
      setMeasured({ status: 'idle', size: null })
      return
    }
    let stale = false
    // Keep the last answer while re-measuring so the note holds its place;
    // `refreshing` tells callers that number is for an older selection.
    setMeasured((current) =>
      current.status === 'ready' ? current : { status: 'loading', size: null }
    )
    getSourceSizeAPI({ fileIds: files, folderIds: folders, modelRef: model })
      .then((size) => !stale && setMeasured({ status: 'ready', size, key }))
      .catch(() => !stale && setMeasured({ status: 'error', size: null }))
    return () => {
      stale = true
    }
  }, [key])

  if (measured.status !== 'ready') return measured
  return {
    status: 'ready',
    size: measured.size,
    refreshing: measured.key !== currentKey,
  }
}
