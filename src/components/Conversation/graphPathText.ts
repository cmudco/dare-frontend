import type { GraphWalkStep } from '@/redux/types/conversation'

export const chunkStepLabel = (step: GraphWalkStep) =>
  `${step.label.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ')}${
    step.page != null ? `, p. ${step.page}` : ''
  }`

/** The stated relationship arriving at this step, or '' when there is none. */
export const relationPhrase = (step: GraphWalkStep) => {
  if (!step.relation || step.relation === 'points_to') return ''
  return step.relation.replace(/_/g, ' ')
}

/** Citation ids an answer actually used, such as S3 in "[S3]". */
export const citedIdsIn = (answer: string | null | undefined) =>
  new Set(
    Array.from((answer ?? '').matchAll(/\[(S\d+)\]/g), (match) => match[1])
  )
