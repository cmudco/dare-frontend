export type GraphStatus =
  | 'free'
  | 'discovering'
  | 'awaiting_approval'
  | 'building'
  | 'ready'
  | 'failed'

export interface KnowledgeGraphSummary {
  id: number
  name: string
  description: string
  status: GraphStatus
  statusLabel: string
  error: string
  fileIds: number[]
  chunksTotal: number
  chunksDone: number
  tokensUsed: number
  approvedAt: string | null
  builtAt: string | null
  createdAt: string
  relationCount: number
  labelCount: number
  chunkCount: number
  hasEvalReport: boolean
}

export interface GraphNode {
  id: number
  label: string
  kind: string
  mentions: number
  files: number
  aliases: number
  relations: number
}

export interface GraphRelationEdge {
  source: number
  target: number
  label: string
  probability: number
  evidence: string
  fileName: string
  page: number | null
  count: number
}

export interface GraphLinkEdge {
  source: number
  target: number
  weight: number
}

export interface RelationLabel {
  id: number
  name: string
  description: string
  source: 'discovered' | 'user'
  relationCount: number
}

export interface GraphStats {
  documents: number
  passages: number
  entities: number
  shownEntities: number
  spellings: number
  mergedEntities: number
  crossDocumentEntities: number
  relations: number
}

export interface KnowledgeGraphView {
  nodes: GraphNode[]
  relations: GraphRelationEdge[]
  links: GraphLinkEdge[]
  labels: RelationLabel[]
  stats: GraphStats
}

export interface EntityAlias {
  key: string
  text: string
  source: 'self' | 'rule' | 'decisions' | 'manual'
  probability: number | null
}

export interface EntityMention {
  fileId: number
  fileName: string
  page: number | null
  chunkIndex: number
  text: string
  preview: string
}

export interface EntityRelationRow {
  id: number
  subjectId: number
  subject: string
  label: string
  objectId: number
  object: string
  probability: number
  evidence: string
  fileName: string
  page: number | null
}

export interface EntityDetail {
  id: number
  label: string
  kind: string
  aliases: EntityAlias[]
  mentions: EntityMention[]
  relations: EntityRelationRow[]
}

export interface GraphEstimate {
  discoveryCost: number | null
  build: {
    chunks: number
    pairs: number
    tokens: number
    cost: number
    ratePerMillion: number
  } | null
  unavailableReason: string
}

export interface EvalConfigResult {
  found: boolean
  answerCorrect: boolean
  files: string[]
  answer: string
}

export interface EvalRow {
  id: string
  question: string
  kind: string
  expected: string
  results: Record<string, EvalConfigResult>
}

export interface EvalReport {
  generatedAt: string
  configs: { id: string; label: string; description: string }[]
  summary: Record<
    string,
    { found: number; answerCorrect: number; total: number }
  >
  rows: EvalRow[]
}
