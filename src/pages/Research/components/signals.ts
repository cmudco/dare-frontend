// Presentation metadata for evidence labels and provenance tools.

type BadgeVariant = 'green' | 'red' | 'blue' | 'yellow' | 'gray'

export const evidenceMeta = (
  label: string
): { label: string; badge: BadgeVariant; dot: string } => {
  switch (label) {
    case 'supporting':
      return { label: 'Supporting', badge: 'green', dot: 'bg-green-500' }
    case 'disputing':
      return { label: 'Disputing', badge: 'red', dot: 'bg-red-500' }
    case 'partial':
      return { label: 'Partial', badge: 'yellow', dot: 'bg-amber-500' }
    case 'tangential':
      return { label: 'Tangential', badge: 'blue', dot: 'bg-sky-500' }
    case 'unverifiable':
      return {
        label: 'Unverifiable',
        badge: 'gray',
        dot: 'bg-muted-foreground',
      }
    default:
      return {
        label: label || 'Unlabelled',
        badge: 'gray',
        dot: 'bg-muted-foreground',
      }
  }
}

/** Title-case a provenance tool slug, e.g. 'web' -> 'Web', 'consensus' -> 'Consensus'. */
export const toolLabel = (tool: string): string =>
  tool ? tool.charAt(0).toUpperCase() + tool.slice(1) : 'Unknown'
