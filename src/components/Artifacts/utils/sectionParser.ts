/**
 * Parse artifact outline into sections array
 *
 * Outline format from backend:
 * "1. Introduction - Overview of...\n2. Features - Detailed...\n3. ..."
 *
 * Returns array of section titles (stripped of numbers and descriptions)
 */
export function parseOutlineToSections(outline: string): string[] {
  if (!outline || !outline.trim()) {
    return []
  }

  // Split by newlines and filter empty lines
  const lines = outline
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Extract section titles
  return lines.map((line) => {
    // Remove leading number and period: "1. Introduction..." -> "Introduction..."
    const withoutNumber = line.replace(/^\d+\.\s*/, '')

    // Extract just the title (before the dash description)
    // "Introduction - Overview of the platform" -> "Introduction"
    const dashIndex = withoutNumber.indexOf(' - ')
    if (dashIndex > 0) {
      return withoutNumber.substring(0, dashIndex).trim()
    }

    return withoutNumber.trim()
  })
}

/**
 * Find the best matching heading ID in content for a section title
 *
 * Uses fuzzy matching to find h1, h2, or h3 heading that matches the section title
 */
export function findHeadingForSection(
  content: string,
  sectionTitle: string
): string | null {
  if (!content || !sectionTitle) {
    return null
  }

  // Normalize section title for comparison
  const normalizedTitle = sectionTitle.toLowerCase().trim()

  // Extract all headings from content (h1, h2, h3)
  const headingRegex = /^#{1,3}\s+(?:\d+[.:]\s*)?(.+)$/gm
  let match
  let bestMatch: { id: string; score: number } | null = null
  let headingIndex = 0

  while ((match = headingRegex.exec(content)) !== null) {
    const headingText = match[1].trim()
    const normalizedHeading = headingText.toLowerCase()

    // Calculate match score
    let score = 0

    // Exact match
    if (normalizedHeading === normalizedTitle) {
      score = 100
    }
    // Heading contains section title
    else if (normalizedHeading.includes(normalizedTitle)) {
      score = 80
    }
    // Section title contains heading
    else if (normalizedTitle.includes(normalizedHeading)) {
      score = 70
    }
    // Partial word match
    else {
      const titleWords = normalizedTitle.split(/\s+/)
      const headingWords = normalizedHeading.split(/\s+/)
      const matchedWords = titleWords.filter((word) =>
        headingWords.some((hw) => hw.includes(word) || word.includes(hw))
      )
      score = (matchedWords.length / titleWords.length) * 60
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        id: `artifact-section-${headingIndex}`,
        score,
      }
    }

    headingIndex++
  }

  return bestMatch ? bestMatch.id : null
}

/**
 * Build section map from outline for quick lookup
 *
 * Returns map of section index to section title
 */
export function buildSectionMap(outline: string): Map<number, string> {
  const sections = parseOutlineToSections(outline)
  const map = new Map<number, string>()

  sections.forEach((title, index) => {
    map.set(index, title)
  })

  return map
}
