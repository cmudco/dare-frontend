/**
 * Returns true when the string begins with an HTML tag — used to distinguish
 * legacy HTML-stored prompts from newer raw-markdown ones.
 */
export const isHtmlContent = (s: string): boolean =>
  /<[a-zA-Z][^>]*>/.test(s.trim().slice(0, 200))

/**
 * Returns true when the string contains no markdown syntax.
 * Plain text / ASCII-art diagrams must be rendered verbatim inside a <pre>
 * block; feeding them to a markdown renderer collapses spaces and treats
 * `|` as table delimiters, which destroys the visual structure.
 */
export const isPlainTextContent = (s: string): boolean =>
  !/^#{1,6}\s|\*{1,2}[^*\n]+\*{1,2}|`|\[.+\]\(.+\)|^>/m.test(s)
