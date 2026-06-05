import { ResearchEvidenceLabel } from '@/utils/constants/research'

export interface SignalMeta {
  label: string
  badge: 'green' | 'red' | 'blue' | 'yellow' | 'gray'
  dot: string
}

export const getSignalMeta = (signal: ResearchEvidenceLabel): SignalMeta => {
  switch (signal) {
    case ResearchEvidenceLabel.SUPPORTING:
      return {
        label: 'Supporting',
        badge: 'green',
        dot: 'bg-green-500',
      }
    case ResearchEvidenceLabel.DISPUTING:
      return {
        label: 'Disputing',
        badge: 'red',
        dot: 'bg-red-500',
      }
    case ResearchEvidenceLabel.PARTIAL:
      return {
        label: 'Partial',
        badge: 'yellow',
        dot: 'bg-yellow-500',
      }
    case ResearchEvidenceLabel.TANGENTIAL:
      return {
        label: 'Tangential',
        badge: 'blue',
        dot: 'bg-sky-500',
      }
    case ResearchEvidenceLabel.WEAK:
      return {
        label: 'Weak',
        badge: 'yellow',
        dot: 'bg-amber-500',
      }
    case ResearchEvidenceLabel.UNVERIFIABLE:
      return {
        label: 'Unverifiable',
        badge: 'gray',
        dot: 'bg-muted-foreground',
      }
  }
}

export const getToolLabel = (tool?: string): string => {
  switch (tool) {
    case 'pubmed':
      return 'PubMed'
    case 'scite':
      return 'Scite'
    case 'consensus':
      return 'Consensus'
    case 'web':
      return 'Web search'
    case 'upload':
      return 'Uploaded source'
    case 'manual':
      return 'Manual staging'
    default:
      return tool || 'Unknown source'
  }
}
