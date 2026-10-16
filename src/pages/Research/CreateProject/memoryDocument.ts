// The project's MEMORY.md as one Markdown list: one bullet per memory entry.
// DARE stores each entry as a project-memory row and renders them into the
// Hermes profile's MEMORY.md, so only bullet lines are entries — the editor
// shows exactly what will be saved.

/** Hermes's `memory.memory_char_limit`; MEMORY.md is meant to stay small. */
export const MEMORY_MAX_CHARS = 2_200

const BULLET = /^\s*(?:[-*]|\d+\.)\s+/

export const memoryEntries = (doc: string) =>
  doc
    .split('\n')
    .filter((line) => BULLET.test(line))
    .map((line) => line.replace(BULLET, ''))
    .filter((text) => text.trim())

/** Size as Hermes counts it: entries joined by its § separator. */
export const memorySize = (doc: string) =>
  memoryEntries(doc)
    .map((e) => e.trim())
    .join('\n§\n').length

export const buildMemory = (entries: string[]) =>
  entries.map((entry) => `- ${entry}`).join('\n') + (entries.length ? '\n' : '')

/** The value of a "- Label: value" entry. */
export const memoryValue = (doc: string, label: string) => {
  const prefix = `${label}:`
  const entry = memoryEntries(doc).find((e) => e.startsWith(prefix))
  // Keep trailing spaces: this value backs a text input mid-typing.
  return entry ? entry.slice(prefix.length).replace(/^ /, '') : ''
}

/** Set, replace or (when empty) remove a "- Label: value" entry in place. */
export const setMemoryValue = (doc: string, label: string, value: string) => {
  const prefix = `${label}:`
  const lines = doc.split('\n')
  const index = lines.findIndex(
    (line) => BULLET.test(line) && line.replace(BULLET, '').startsWith(prefix)
  )
  if (!value.trim()) {
    if (index !== -1) lines.splice(index, 1)
    return lines.join('\n')
  }
  const line = `- ${label}: ${value}`
  if (index !== -1) {
    lines[index] = line
    return lines.join('\n')
  }
  const body = doc.replace(/\s+$/, '')
  return `${body ? `${body}\n` : ''}${line}\n`
}
