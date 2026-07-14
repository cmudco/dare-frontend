/** Friendly labels for known tools; fallback humanizes the raw tool name. */
const FRIENDLY_TOOL_LABELS: Record<string, string> = {
  get_spec: 'Reading template requirements',
  create_document: 'Rendering document',
  list_quills: 'Browsing templates',
}

export const friendlyToolLabel = (toolName: string): string => {
  const known = FRIENDLY_TOOL_LABELS[toolName]
  if (known) return known
  const humanized = toolName.replace(/[_-]+/g, ' ').trim()
  return humanized.charAt(0).toUpperCase() + humanized.slice(1)
}
