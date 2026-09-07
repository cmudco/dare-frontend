import React from 'react'
import type {
  DocxBlock,
  DocxDocumentConfig,
  DocxHeadingBlock,
} from '@/redux/types/dareToolResults'

export type { DocxDocumentConfig } from '@/redux/types/dareToolResults'

type DocxAlignment = 'left' | 'center' | 'right'

interface DocxRendererProps {
  config: DocxDocumentConfig
}

const headingClassNames: Record<DocxHeadingBlock['level'], string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium',
}

const previewAlignmentClassNames: Record<DocxAlignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// Dark-mode aware text/border classes used across preview blocks
const textPrimary = 'text-foreground'
const textSecondary = 'text-foreground/90'
const textMuted = 'text-muted-foreground'
const borderLight = 'border-border'
const bgSubtle = 'bg-muted'

const renderPreviewBlock = (
  block: DocxBlock,
  index: number
): React.ReactNode => {
  switch (block.type) {
    case 'heading':
      return (
        <h2
          key={`docx-heading-${index}`}
          className={`${headingClassNames[block.level]} ${textPrimary}`}
        >
          {block.text}
        </h2>
      )

    case 'paragraph': {
      const alignment = block.alignment || 'left'
      return (
        <p
          key={`docx-paragraph-${index}`}
          className={`${previewAlignmentClassNames[alignment]} leading-7 break-words ${textSecondary}`}
        >
          {block.text}
        </p>
      )
    }

    case 'list':
      return block.ordered ? (
        <ol
          key={`docx-list-${index}`}
          className={`list-decimal space-y-2 pl-6 ${textSecondary}`}
        >
          {block.items.map((item, itemIndex) => (
            <li key={`docx-list-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul
          key={`docx-list-${index}`}
          className={`list-disc space-y-2 pl-6 ${textSecondary}`}
        >
          {block.items.map((item, itemIndex) => (
            <li key={`docx-list-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      )

    case 'blockquote':
      return (
        <blockquote
          key={`docx-blockquote-${index}`}
          className={`border-l-4 border-border pl-4 leading-7 italic ${textMuted}`}
        >
          {block.text}
        </blockquote>
      )

    case 'table':
      return (
        <div
          key={`docx-table-${index}`}
          className={`overflow-x-auto rounded-lg border ${borderLight}`}
        >
          <table className='min-w-full border-collapse text-left text-sm'>
            <thead className={bgSubtle}>
              <tr>
                {block.headers.map((header, headerIndex) => (
                  <th
                    key={`docx-header-${index}-${headerIndex}`}
                    className={`border-b px-4 py-3 font-semibold ${borderLight} ${textPrimary}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={`docx-row-${index}-${rowIndex}`}
                  className={`border-b last:border-b-0 ${borderLight}`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`docx-cell-${index}-${rowIndex}-${cellIndex}`}
                      className={`px-4 py-3 ${textSecondary}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({ config }) => {
  return (
    <div className='h-full min-w-0 overflow-auto bg-muted p-3 sm:p-6'>
      <div className='mx-auto flex max-w-3xl flex-col gap-5 rounded-xs bg-card p-5 shadow-lg sm:p-10'>
        <h1
          className={`border-b pb-4 text-2xl font-bold break-words sm:text-4xl ${borderLight} ${textPrimary}`}
        >
          {config.title}
        </h1>
        {config.blocks.map((block, index) => renderPreviewBlock(block, index))}
      </div>
    </div>
  )
}

export default DocxRenderer
