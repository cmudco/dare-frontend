import type {
  Artifact,
  ArtifactSidecarTab,
  ArtifactType,
} from '@/redux/types/artifact'

const LIVE_PREVIEW_TYPES = new Set<ArtifactType>([
  'react',
  'html',
  'svg',
  'diagram',
])

/** Types whose content is source code a user can edit in the sidecar. */
export const isEditableArtifact = (artifact: Artifact): boolean =>
  LIVE_PREVIEW_TYPES.has(artifact.artifactType) ||
  artifact.artifactType === 'code'

/** Editable types that also render a live preview of their code. */
export const hasLivePreview = (artifact: Artifact): boolean =>
  LIVE_PREVIEW_TYPES.has(artifact.artifactType)

export const sidecarTabsFor = (artifact: Artifact): ArtifactSidecarTab[] => {
  if (hasLivePreview(artifact)) return ['preview', 'code', 'split', 'all']
  if (artifact.artifactType === 'code') return ['code', 'all']
  return ['preview', 'all']
}

/** The requested tab when the artifact offers it, otherwise its first tab. */
export const resolveSidecarTab = (
  artifact: Artifact,
  requested: ArtifactSidecarTab
): ArtifactSidecarTab => {
  const tabs = sidecarTabsFor(artifact)
  return tabs.includes(requested) ? requested : tabs[0]
}

export type FencePreviewKind = 'react' | 'html' | 'svg'

const FENCE_PREVIEW_KINDS: Record<string, FencePreviewKind> = {
  jsx: 'react',
  tsx: 'react',
  html: 'html',
  svg: 'svg',
}

/** Chat fences that render as something to look at, shown as artifact cards. */
export const fencePreviewKind = (language: string): FencePreviewKind | null =>
  FENCE_PREVIEW_KINDS[language.toLowerCase()] ?? null
