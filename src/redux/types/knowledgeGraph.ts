export type GraphStatus =
  | 'preparing'
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
  goal: string
  status: GraphStatus
  statusLabel: string
  error: string
  fileIds: number[]
  /** Documents added after the last build; no relationships read from them yet. */
  unreadFileIds: number[]
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
  /** Types the last read saw in your documents that the list doesn't have. */
  proposedTypes: ProposedType[]
}

export interface ProposedType {
  name: string
  description: string
  twoWay?: boolean
  example: string
  count: number
}

export interface GraphNode {
  id: number
  label: string
  kind: string
  mentions: number
  files: number
  aliases: number
  relations: number
  /** Names it has a stated relationship with that are not in the picture. */
  elsewhere: number
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
  /** Strong links shape the layout; the rest appear when an endpoint is selected. */
  strong: boolean
}

export interface RelationExample {
  subject: string
  object: string
  evidence: string
  fileName: string
  page: number | null
  sources: number
}

export interface RelationLabel {
  id: number
  name: string
  description: string
  source: 'discovered' | 'user'
  twoWay: boolean
  relationCount: number
  pairCount: number
  read: boolean
  examples: RelationExample[]
}

export interface EntityBand {
  band: '1' | '2' | '3-5' | '6+'
  entities: number
  connected: number
  examples: string[]
}

export interface GraphStats {
  documents: number
  passages: number
  entities: number
  /** Names on this page of the picture, before any picked name is added. */
  pageEntities: number
  spellings: number
  mergedEntities: number
  crossDocumentEntities: number
  relations: number
  entityBands: EntityBand[]
}

export interface GraphEntity {
  id: number
  label: string
  kind: string
  /** Chunks the name appears in. */
  passages: number
}

/** One slice of every name in the graph, most connected first. */
export interface GraphNamesPage {
  total: number
  counts: Record<'person' | 'location' | 'organization' | 'other', number>
  /** Names that fit the kind and search asked for. */
  matches: number
  results: GraphEntity[]
}

export interface KnowledgeGraphView {
  /** The names the picture draws. */
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
  /** Documents this entity's names appear in. */
  files: number
  aliases: EntityAlias[]
  mentions: EntityMention[]
  relations: EntityRelationRow[]
}

export interface BuildEstimate {
  chunks: number
  pairs: number
  tokens: number
  cost: number
  ratePerMillion: number
}

export interface GraphEstimate {
  discoveryCost: number | null
  build: BuildEstimate | null
  /** Set when some types have been read and others have not. */
  newTypes: BuildEstimate | null
  /** Set when documents were added to a graph that was already built. */
  newFiles: BuildEstimate | null
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
