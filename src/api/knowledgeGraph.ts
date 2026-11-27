import type { RetrievalTrace } from '@/redux/types/conversation'
import type {
  EntityDetail,
  EvalReport,
  GraphEstimate,
  GraphNamesPage,
  KnowledgeGraphSummary,
  KnowledgeGraphView,
  RelationLabel,
} from '@/redux/types/knowledgeGraph'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

const BASE = 'api/knowledge-graphs'

export const listGraphsAPI = () =>
  baseRequest<KnowledgeGraphSummary[]>({
    url: `${BASE}/`,
    method: METHOD.GET,
  })

export const createGraphAPI = (draft: {
  name: string
  description: string
  fileIds: number[]
  folderIds: number[]
}) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/`,
    method: METHOD.POST,
    data: draft,
  })

export const getGraphAPI = (id: number) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/`,
    method: METHOD.GET,
  })

export const updateGraphAPI = (
  id: number,
  changes: { name: string; fileIds: number[]; folderIds: number[] }
) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/`,
    method: METHOD.PATCH,
    data: changes,
  })

export const deleteGraphAPI = (id: number) =>
  baseRequest<void>({ url: `${BASE}/${id}/`, method: METHOD.DELETE })

/** Starts re-scoring this graph's names; poll the graph until it stops checking. */
export const recheckNamesAPI = (id: number) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/recheck-names/`,
    method: METHOD.POST,
  })

/** Sizes the backend accepts for one page of the picture. */
export const PICTURE_SIZES = [60, 150, 300]

export const getGraphViewAPI = (
  id: number,
  page: { focus: number | null; size: number; offset: number }
) =>
  baseRequest<KnowledgeGraphView>({
    url: `${BASE}/${id}/view/`,
    method: METHOD.GET,
    params: { ...page, focus: page.focus ?? undefined },
  })

export const getGraphNamesAPI = (
  id: number,
  slice: { group?: string; q?: string; offset?: number; limit: number }
) =>
  baseRequest<GraphNamesPage>({
    url: `${BASE}/${id}/names/`,
    method: METHOD.GET,
    params: slice,
  })

export const getGraphEstimateAPI = (id: number) =>
  baseRequest<GraphEstimate>({
    url: `${BASE}/${id}/estimate/`,
    method: METHOD.GET,
  })

export const discoverLabelsAPI = (id: number, goal: string) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/discover/`,
    method: METHOD.POST,
    data: { goal },
  })

/** What a build reads: everything, only the unread types, or only the added documents. */
export type BuildScope = 'all' | 'newTypes' | 'newFiles'

export const approveBuildAPI = (id: number, scope: BuildScope = 'all') =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/approve/`,
    method: METHOD.POST,
    data: {
      newOnly: scope === 'newTypes',
      newFilesOnly: scope === 'newFiles',
    },
  })

export const addLabelAPI = (
  id: number,
  name: string,
  description: string,
  twoWay: boolean
) =>
  baseRequest<RelationLabel>({
    url: `${BASE}/${id}/labels/`,
    method: METHOD.POST,
    data: { name, description, twoWay },
  })

export const deleteLabelAPI = (id: number, labelId: number) =>
  baseRequest<void>({
    url: `${BASE}/${id}/labels/${labelId}/`,
    method: METHOD.DELETE,
  })

export const getEntityAPI = (id: number, entityId: number) =>
  baseRequest<EntityDetail>({
    url: `${BASE}/${id}/clusters/${entityId}/`,
    method: METHOD.GET,
  })

export const separateAliasAPI = (id: number, entityId: number, key: string) =>
  baseRequest<EntityDetail>({
    url: `${BASE}/${id}/clusters/${entityId}/separate/`,
    method: METHOD.POST,
    data: { key },
  })

export const mergeEntityAPI = (id: number, entityId: number, otherId: number) =>
  baseRequest<EntityDetail>({
    url: `${BASE}/${id}/clusters/${entityId}/merge/`,
    method: METHOD.POST,
    data: { otherId },
  })

export const askGraphAPI = (id: number, question: string) =>
  baseRequest<{ trace: RetrievalTrace }>({
    url: `${BASE}/${id}/ask/`,
    method: METHOD.POST,
    data: { question },
  })

export const getEvalReportAPI = (id: number) =>
  baseRequest<{ report: EvalReport | null }>({
    url: `${BASE}/${id}/eval-report/`,
    method: METHOD.GET,
  })
