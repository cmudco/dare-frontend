import { useEffect, useState } from 'react'

import { fetchFileBlobAPI } from '@/api/files'

/**
 * Load a stored file through the files API. A file's own URL can't be shown
 * for every storage backend (SyftBox files are syft:// addresses).
 */
export const useFileObjectUrl = (fileId: number) => {
  const [url, setUrl] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | undefined
    let cancelled = false
    setUrl(undefined)
    setFailed(false)
    fetchFileBlobAPI(fileId)
      .then(({ blob }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId])

  return { url, failed }
}
