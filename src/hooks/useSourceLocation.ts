import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { clearSelectedItems } from '@/redux/fileSlice'
import { SourceLocation } from '@/redux/types/files'

const PARAM = 'in'
const FOLDER_PREFIX = 'folder-'
const NAMED_KINDS = [
  'all',
  'unfiled',
  'attention',
  'libraries',
  'shared',
] as const

type NamedKind = (typeof NAMED_KINDS)[number]

const isNamedKind = (value: string): value is NamedKind =>
  (NAMED_KINDS as readonly string[]).includes(value)

const parseLocation = (value: string | null): SourceLocation => {
  if (value && isNamedKind(value)) return { kind: value }
  if (value?.startsWith(FOLDER_PREFIX)) {
    const folderId = Number(value.slice(FOLDER_PREFIX.length))
    if (Number.isInteger(folderId)) return { kind: 'folder', folderId }
  }
  return { kind: 'home' }
}

const serializeLocation = (location: SourceLocation): string | null => {
  if (location.kind === 'home') return null
  if (location.kind === 'folder') return `${FOLDER_PREFIX}${location.folderId}`
  return location.kind
}

export const isSameLocation = (a: SourceLocation, b: SourceLocation) =>
  serializeLocation(a) === serializeLocation(b)

/** The Sources location lives in the URL so back, refresh and links work. */
export const useSourceLocation = () => {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const location = useMemo(() => parseLocation(params.get(PARAM)), [params])

  const goTo = useCallback(
    (next: SourceLocation) => {
      dispatch(clearSelectedItems())
      setParams((previous) => {
        const updated = new URLSearchParams(previous)
        const value = serializeLocation(next)
        if (value) updated.set(PARAM, value)
        else updated.delete(PARAM)
        return updated
      })
    },
    [dispatch, setParams]
  )

  return { location, goTo }
}
