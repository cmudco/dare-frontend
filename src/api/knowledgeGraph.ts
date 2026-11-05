import type { RetrievalTrace } from '@/redux/types/conversation'
import type {
  EntityDetail,
  EvalReport,
  GraphEstimate,
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

export const deleteGraphAPI = (id: number) =>
  baseRequest<void>({ url: `${BASE}/${id}/`, method: METHOD.DELETE })

export const getGraphViewAPI = (id: number) =>
  baseRequest<KnowledgeGraphView>({
    url: `${BASE}/${id}/view/`,
    method: METHOD.GET,
  })

export const getGraphEstimateAPI = (id: number) =>
  baseRequest<GraphEstimate>({
    url: `${BASE}/${id}/estimate/`,
    method: METHOD.GET,
  })

export const discoverLabelsAPI = (id: number) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/discover/`,
    method: METHOD.POST,
  })

export const approveBuildAPI = (id: number) =>
  baseRequest<KnowledgeGraphSummary>({
    url: `${BASE}/${id}/approve/`,
    method: METHOD.POST,
  })

export const addLabelAPI = (id: number, name: string, description: string) =>
  baseRequest<RelationLabel>({
    url: `${BASE}/${id}/labels/`,
    method: METHOD.POST,
    data: { name, description },
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
