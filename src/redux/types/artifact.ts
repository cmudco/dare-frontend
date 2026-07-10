/**
 * Artifact Types
 *
 * Clean artifact model based on LibreChat pattern.
 * Artifacts are generated content (charts, diagrams, files) attached to messages.
 */

// Core artifact types
export type ArtifactType =
  | 'chart'
  | 'diagram'
  | 'code'
  | 'docx'
  | 'pptx'
  | 'document'
  | 'image'
  | 'file'
  | 'react'
  | 'html'
  | 'svg'
  | 'excalidraw'

export type ArtifactStatus = 'completed' | 'error'

/**
 * Artifact - Generated content attached to a message
 */
export interface Artifact {
  id: number
  messageId?: number
  title: string
  content: string // Raw content (JSON for charts, mermaid code for diagrams, etc.)
  artifactType: ArtifactType
  status: ArtifactStatus

  // File metadata
  filename: string // e.g., "chart.json", "flowchart.mmd"
  contentType: string // MIME-like type, e.g., "application/vnd.dare.chart+json"

  // Tool that created this artifact
  sourceTool?: string // e.g., "create_chart", "create_diagram"

  // Additional metadata for the specific artifact type
  metadata?: Record<string, unknown>

  // Versioning fields
  version?: number
  parentArtifactId?: number
  artifactGroupId?: number

  // Error info
  error?: string

  // Timestamps
  createdAt?: string
  updatedAt?: string
}

/**
 * WebSocket event: artifact_created
 * Sent when a DARE tool creates an artifact
 */
export interface ArtifactCreatedEvent {
  type: 'artifact_created'
  artifactId: number
  messageId?: number
  artifactGroupId?: number
  filename: string
  title: string
  contentType: string
  content: string
  artifactType: ArtifactType
  version?: number
  metadata?: Record<string, unknown>
}

/**
 * WebSocket event: artifact_updated
 * Sent when an artifact is updated (new version created)
 */
export interface ArtifactUpdatedEvent {
  type: 'artifact_updated'
  artifactId: number
  parentArtifactId: number
  artifactGroupId: number
  messageId?: number
  filename: string
  title: string
  contentType: string
  content: string
  artifactType: ArtifactType
  version: number
  metadata?: Record<string, unknown>
}

/**
 * Redux state for artifact management
 */
export interface ArtifactState {
  artifacts: Record<string, Artifact> // Map of String(artifactId) -> Artifact
  activeArtifactId: number | null
  sidecarOpen: boolean
  sidecarWidth: number
  sidecarFullscreen: boolean
  artifactsEnabled: boolean // Toggle in chat input
}

export const initialArtifactState: ArtifactState = {
  artifacts: {},
  activeArtifactId: null,
  sidecarOpen: false,
  sidecarWidth: 640,
  sidecarFullscreen: false,
  artifactsEnabled: false,
}

// API Response types
export type ArtifactListResponse = Artifact[]
export type ArtifactDetailResponse = Artifact
