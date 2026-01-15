/**
 * DareMermaidResult Component
 *
 * Renders mermaid diagrams from DARE tool call results.
 * Wraps the existing MermaidBlock component with consistent styling
 * for DARE tool result display.
 */

import React from 'react'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'

interface DareMermaidResultProps {
  mermaidCode: string
  title?: string
  className?: string
}

/**
 * Renders a mermaid diagram from DARE create_diagram tool result.
 * Uses the existing MermaidBlock component for actual rendering.
 */
export const DareMermaidResult: React.FC<DareMermaidResultProps> = ({
  mermaidCode,
  title,
  className = '',
}) => {
  // Extract title from mermaid content if present (usually a %% comment)
  const extractedTitle = title || extractTitleFromMermaid(mermaidCode)

  return (
    <div
      className={`not-prose my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
    >
      {/* Diagram title */}
      {extractedTitle && (
        <h4 className='mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200'>
          {extractedTitle}
        </h4>
      )}
      {/* Mermaid diagram */}
      <MermaidBlock code={mermaidCode} />
    </div>
  )
}

/**
 * Extract title from mermaid code comment (if present)
 * Looks for: %% Title or %% title
 */
function extractTitleFromMermaid(code: string): string | undefined {
  const match = code.match(/%%\s*(.+)/)
  if (match && match[1]) {
    return match[1].trim()
  }
  return undefined
}

export default DareMermaidResult
