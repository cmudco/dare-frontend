const CODE_SEGMENT =
  /(^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^ {0,3}\2[ \t]*$|(?![\s\S]))|`+[^`\n]*`+)/gm
const DISPLAY_MATH = /\\\[([\s\S]+?)\\\]/g
const INLINE_MATH = /\\\(([\s\S]+?)\\\)/g

/**
 * Rewrite LaTeX `\[…\]` and `\(…\)` delimiters (common in OpenAI output) to
 * the `$$` form remark-math parses: on its own lines for display math, inline
 * otherwise. Code spans and fences are left as-is.
 */
const WHITESPACE = /\s/
const DIGIT = /\d/

// Pandoc's rule: `$…$` is math only when the opening `$` is followed by a
// non-space, the closing `$` follows a non-space and is not followed by a
// digit. Anything else (prices like "$5 and $10") is escaped as a literal.
const escapeCurrencyDollars = (text: string): string => {
  const singles: number[] = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '$' || text[i - 1] === '\\') continue
    if (text[i + 1] === '$') {
      i++
      continue
    }
    singles.push(i)
  }
  const literal = new Set<number>()
  for (let k = 0; k < singles.length; k++) {
    const open = singles[k]
    const close = singles[k + 1]
    const isMath =
      close !== undefined &&
      !WHITESPACE.test(text[open + 1] ?? ' ') &&
      !WHITESPACE.test(text[close - 1]) &&
      !DIGIT.test(text[close + 1] ?? '') &&
      !text.slice(open, close).includes('\n\n')
    if (isMath) k++
    else literal.add(open)
  }
  if (!literal.size) return text
  return [...text]
    .map((char, index) => (literal.has(index) ? '\\$' : char))
    .join('')
}

/**
 * Prepare model math for remark-math: rewrite LaTeX `\[…\]` / `\(…\)`
 * delimiters (common in OpenAI output) to `$$` / `$`, and escape currency
 * dollars so they never pair up as math. Code spans and fences are left as-is.
 */
export const normalizeMathDelimiters = (markdown: string): string => {
  if (
    !markdown.includes('$') &&
    !markdown.includes('\\[') &&
    !markdown.includes('\\(')
  ) {
    return markdown
  }
  return markdown
    .split(CODE_SEGMENT)
    .map((segment, index) => {
      // split() yields [prose, code, fence marker, prose, …].
      if (index % 3 === 1) return segment
      if (index % 3 === 2) return ''
      return escapeCurrencyDollars(
        segment
          .replace(DISPLAY_MATH, (_, math) => `\n$$\n${math.trim()}\n$$\n`)
          .replace(INLINE_MATH, (_, math) => `$${math.trim()}$`)
      )
    })
    .join('')
}

const SANDBOX_LINK = /\[([^\]]*)\]\(sandbox:[^)]*\)/g

/**
 * Unlink `[name](sandbox:/mnt/data/...)` references: they point inside the
 * provider's code sandbox, and the file itself is attached to the message.
 */
export const stripSandboxLinks = (markdown: string): string =>
  markdown.replace(SANDBOX_LINK, '$1')
