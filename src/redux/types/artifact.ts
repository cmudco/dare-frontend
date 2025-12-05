/**
 * Artifact Types
 *
 * TypeScript types for the Artifacts feature - long-form AI-generated
 * content (documents, code, analysis) displayed in a dedicated sidecar panel.
 */

export type ArtifactType = 'document' | 'code' | 'diagram'

export type ArtifactStatus =
  | 'planning'
  | 'generating'
  | 'paused'
  | 'completed'
  | 'error'

export interface Artifact {
  id: string
  title: string
  outline: string
  content: string
  artifactType: ArtifactType
  status: ArtifactStatus
  estimatedSections: number
  currentSection: number
  progress: number // 0.0 - 1.0
  wordCount?: number
  language?: string // For code artifacts
  error?: string
  version: number // Version number, increments on modification
  isModification?: boolean // True if this is a modification of existing artifact
  createdAt?: string
  updatedAt?: string
}

export interface ArtifactCheckpoint {
  id: number
  artifactId: string
  contentSnapshot: string
  currentSection: number
  iterationCount: number
  createdAt: string
}

// WebSocket message types (Server → Client)
export interface ArtifactInitMessage {
  type: 'artifact_init'
  artifactId: string
  title: string
  outline: string
  estimatedSections: number
}

export interface ArtifactModifyInitMessage {
  type: 'artifact_modify_init'
  artifactId: string
  title: string
  outline: string // Updated outline with new sections
  estimatedSections: number // Number of NEW sections to add
  newVersion: number // The new version number after modification
}

export interface ArtifactStreamMessage {
  type: 'artifact_stream'
  artifactId: string
  chunk: string
  section: number
  progress: number // 0.0 - 1.0
}

export interface ArtifactPauseMessage {
  type: 'artifact_pause'
  artifactId: string
  currentSection: number
  sectionsRemaining: number
}

export interface ArtifactCompleteMessage {
  type: 'artifact_complete'
  artifactId: string
  totalWords: number
}

export interface ArtifactErrorMessage {
  type: 'artifact_error'
  artifactId?: string
  errorCode: string
  errorMessage: string
}

export type ArtifactWebSocketMessage =
  | ArtifactInitMessage
  | ArtifactModifyInitMessage
  | ArtifactStreamMessage
  | ArtifactPauseMessage
  | ArtifactCompleteMessage
  | ArtifactErrorMessage

// State for artifact management
export interface ArtifactState {
  artifacts: Record<string, Artifact> // Map of artifactId -> Artifact
  activeArtifactId: string | null
  sidecarOpen: boolean
  artifactsEnabled: boolean // Toggle in chat input
  // Async operation state
  pausingArtifactId: string | null // Currently pausing artifact
  statusUpdateError: string | null
}

// Initial artifact state
export const initialArtifactState: ArtifactState = {
  artifacts: {},
  activeArtifactId: null,
  sidecarOpen: false,
  artifactsEnabled: false,
  pausingArtifactId: null,
  statusUpdateError: null,
}

// API Response types
export interface ArtifactListResponse {
  results: Artifact[]
}

export interface ArtifactDetailResponse extends Artifact {
  checkpoints?: ArtifactCheckpoint[]
}
