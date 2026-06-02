// Presentation metadata for citation signals and tool sources.
import type { CitationSignal, ToolSource } from '../types'

export const signalMeta: Record<
  CitationSignal,
  { label: string; badge: 'green' | 'red' | 'blue'; dot: string }
> = {
  supporting: { label: 'Supporting', badge: 'green', dot: 'bg-green-500' },
  disputing: { label: 'Disputing', badge: 'red', dot: 'bg-red-500' },
  tangential: { label: 'Tangential', badge: 'blue', dot: 'bg-sky-500' },
}

export const toolMeta: Record<ToolSource, string> = {
  PubMed: 'PubMed',
  Scite: 'Scite',
  Consensus: 'Consensus',
  Library: 'Library proxy',
  Upload: 'Uploaded PDF',
}
