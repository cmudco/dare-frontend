import type { Project } from '@/redux/types/project'
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '@/utils/constants/file'
import { isAllowedFileType } from '@/utils/files'

export const projectSourceCount = (project: Project) =>
  project.fileIds.length + project.folderIds.length + project.libraryIds.length

const MEDIA_MIME = /^(image|video|audio)\//

/** Why a dropped file cannot become a project source, or null when it can. */
export const projectUploadProblem = (file: File): string | null => {
  if (file.size === 0) return `“${file.name}” is empty.`
  if (file.size > MAX_FILE_SIZE)
    return `“${file.name}” is over ${MAX_FILE_SIZE_MB} MB.`
  if (MEDIA_MIME.test(file.type))
    return `“${file.name}” is media; projects search documents only.`
  if (!isAllowedFileType(file)) return `“${file.name}” is not a supported type.`
  return null
}

const compactTokens = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** "42K", "1.2M": a token count at a glance. */
export const formatCompactTokens = (tokens: number) =>
  compactTokens.format(tokens)

/** "~42K tokens" — estimates are rough, so they read as approximate. */
export const formatTokenEstimate = (tokens: number) =>
  `~${compactTokens.format(tokens)} tokens`

/** Counted by the model's own tokenizer: "42K tokens"; otherwise an estimate. */
export const formatTokenCount = (tokens: number, estimated: boolean) =>
  estimated
    ? `${formatTokenEstimate(tokens)}, estimated`
    : `${compactTokens.format(tokens)} tokens`
