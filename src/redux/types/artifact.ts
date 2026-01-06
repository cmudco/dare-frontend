/**
 * Artifact Types
 *
 * TypeScript types for the Artifacts feature - long-form AI-generated
 * content (documents, code, analysis) displayed in a dedicated sidecar panel.
 *
 * NOTE: All IDs match database types (integers). Redux store uses string keys
 * for object indexing, but the actual Artifact.id is a number.
 */

export type ArtifactType = 'document' | 'code' | 'diagram'

export type ArtifactStatus =
  | 'planning'
  | 'generating'
  | 'paused'
  | 'completed'
  | 'error'

export interface Artifact {
  id: number // Primary key from database (integer)
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
  // Versioning fields
  parentArtifactId?: number | null
  artifactGroupId?: number | null
  versionHistory?: Array<{ id: number; version: number; createdAt: string }>
  createdAt?: string
  updatedAt?: string
}

export interface ArtifactCheckpoint {
  id: number
  artifactId: number
  contentSnapshot: string
  currentSection: number
  iterationCount: number
  createdAt: string
}

// WebSocket message types (Server → Client)
// Note: WebSocket messages often send IDs as strings, convert at boundary
export interface ArtifactInitMessage {
  type: 'artifact_init'
  artifactId: number
  title: string
  outline: string
  estimatedSections: number
}

export interface ArtifactModifyInitMessage {
  type: 'artifact_modify_init'
  artifactId: number // NEW artifact ID
  parentArtifactId: number // Original artifact ID
  artifactGroupId: number
  title: string
  outline: string // New sections outline only
  fullOutline: string // Complete outline
  estimatedSections: number // Number of NEW sections to add (legacy)
  totalEstimatedSections: number // Total sections (parent + new)
  currentSection: number // Inherited from parent
  existingContent: string // Content from parent
  newVersion: number // The new version number after modification
}

export interface ArtifactStreamMessage {
  type: 'artifact_stream'
  artifactId: number
  chunk: string
  section: number
  progress: number // 0.0 - 1.0
}

export interface ArtifactPauseMessage {
  type: 'artifact_pause'
  artifactId: number
  currentSection: number
  sectionsRemaining: number
}

export interface ArtifactCompleteMessage {
  type: 'artifact_complete'
  artifactId: number
  totalWords: number
}

export interface ArtifactErrorMessage {
  type: 'artifact_error'
  artifactId?: number
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
// NOTE: Record keys are strings (String(id)) for object indexing
export interface ArtifactState {
  artifacts: Record<string, Artifact> // Map of String(artifactId) -> Artifact
  activeArtifactId: number | null
  sidecarOpen: boolean
  artifactsEnabled: boolean // Toggle in chat input
  // Async operation state
  pausingArtifactId: number | null // Currently pausing artifact
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
// Backend returns array directly from list_artifacts endpoint
export type ArtifactListResponse = Artifact[]

export interface ArtifactDetailResponse extends Artifact {
  checkpoints?: ArtifactCheckpoint[]
}
