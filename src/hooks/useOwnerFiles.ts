import { useState, useEffect, useMemo } from 'react'
import { getFilesByOwnerAPI } from '@/api/files'
import type { MyFile } from '@/redux/types/files'

interface UseOwnerFilesResult {
  /** All files: user files merged with owner files (no duplicates) */
  allFiles: MyFile[]
  /** Owner files only (from fileOwnerId) */
  ownerFiles: MyFile[]
  /** Whether owner files are currently loading */
  isLoading: boolean
  /** Error message if owner files fetch failed */
  error: string | null
}

/**
 * Hook to fetch and merge owner files for forked conversations/workflows.
 *
 * When a conversation or workflow is forked from another user, this hook
 * fetches the original owner's files and merges them with the current
 * user's files, avoiding duplicates.
 *
 * @param userFiles - Current user's files from Redux state
 * @param fileOwnerId - Original file owner's user ID (from forked resource)
 * @returns Merged files, loading state, and error state
 */
export function useOwnerFiles(
  userFiles: MyFile[],
  fileOwnerId: number | null | undefined
): UseOwnerFilesResult {
  const [ownerFiles, setOwnerFiles] = useState<MyFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch owner files when fileOwnerId is present
  useEffect(() => {
    if (fileOwnerId) {
      setIsLoading(true)
      setError(null)
      getFilesByOwnerAPI(fileOwnerId)
        .then((response) => {
          setOwnerFiles(response.results || [])
        })
        .catch(() => {
          setOwnerFiles([])
          setError('Failed to load shared files from original owner')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setOwnerFiles([])
      setError(null)
    }
  }, [fileOwnerId])

  // Merge user files with owner files, avoiding duplicates
  const allFiles = useMemo(() => {
    if (!fileOwnerId || ownerFiles.length === 0) {
      return userFiles
    }
    const userFileIds = new Set(userFiles.map((f) => f.id))
    const uniqueOwnerFiles = ownerFiles.filter((f) => !userFileIds.has(f.id))
    return [...userFiles, ...uniqueOwnerFiles]
  }, [userFiles, ownerFiles, fileOwnerId])

  return { allFiles, ownerFiles, isLoading, error }
}
