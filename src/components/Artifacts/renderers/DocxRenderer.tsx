import React from 'react'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
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
const textPrimary = 'text-slate-900 dark:text-slate-100'
const textSecondary = 'text-slate-700 dark:text-slate-300'
const textMuted = 'text-slate-600 dark:text-slate-400'
const borderLight = 'border-slate-200 dark:border-slate-700'
const bgSubtle = 'bg-slate-100 dark:bg-slate-700/50'

const paragraphAlignmentMap: Record<
  DocxAlignment,
  (typeof AlignmentType)[keyof typeof AlignmentType]
> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
}

const headingLevelMap: Record<
  DocxHeadingBlock['level'],
  (typeof HeadingLevel)[keyof typeof HeadingLevel]
> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
}

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
          className={`${previewAlignmentClassNames[alignment]} leading-7 ${textSecondary}`}
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
          className={`border-l-4 border-slate-300 pl-4 italic leading-7 dark:border-slate-600 ${textMuted}`}
        >
          {block.text}
        </blockquote>
      )

    case 'table':
      return (
        <div
          key={`docx-table-${index}`}
          className={`overflow-hidden rounded-lg border ${borderLight}`}
        >
          <table className='w-full border-collapse text-left text-sm'>
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

const blocksToDocxChildren = (blocks: DocxBlock[]) => {
  const children: Array<Paragraph | Table> = []

  blocks.forEach((block) => {
    if (block.type === 'heading') {
      children.push(
        new Paragraph({
          text: block.text,
          heading: headingLevelMap[block.level],
          spacing: { after: 200 },
        })
      )
      return
    }

    if (block.type === 'paragraph') {
      children.push(
        new Paragraph({
          text: block.text,
          alignment: paragraphAlignmentMap[block.alignment || 'left'],
          spacing: { after: 200 },
        })
      )
      return
    }

    if (block.type === 'blockquote') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text,
              italics: true,
            }),
          ],
          indent: { left: 720 },
          spacing: { after: 200 },
        })
      )
      return
    }

    if (block.type === 'list') {
      block.items.forEach((item) => {
        children.push(
          new Paragraph(
            block.ordered
              ? {
                  text: item,
                  numbering: {
                    reference: 'docx-ordered-list',
                    level: 0,
                  },
                  spacing: { after: 100 },
                }
              : {
                  text: item,
                  bullet: {
                    level: 0,
                  },
                  spacing: { after: 100 },
                }
          )
        )
      })
      return
    }

    children.push(
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: block.headers.map(
              (header) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: header,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                })
            ),
          }),
          ...block.rows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      children: [new Paragraph({ text: cell })],
                    })
                ),
              })
          ),
        ],
      })
    )
  })

  return children
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const generateDocxHtml = (config: DocxDocumentConfig): string => {
  const parts: string[] = []
  parts.push(`<h1>${escapeHtml(config.title)}</h1>`)

  config.blocks.forEach((block) => {
    switch (block.type) {
      case 'heading':
        parts.push(
          `<h${block.level + 1}>${escapeHtml(block.text)}</h${block.level + 1}>`
        )
        return
      case 'paragraph': {
        const alignment = block.alignment || 'left'
        parts.push(
          `<p style="text-align:${alignment};">${escapeHtml(block.text)}</p>`
        )
        return
      }
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul'
        const items = block.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')
        parts.push(`<${tag}>${items}</${tag}>`)
        return
      }
      case 'blockquote':
        parts.push(
          `<blockquote><em>${escapeHtml(block.text)}</em></blockquote>`
        )
        return
      case 'table': {
        const head = block.headers
          .map((header) => `<th>${escapeHtml(header)}</th>`)
          .join('')
        const body = block.rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${escapeHtml(cell)}</td>`)
                .join('')}</tr>`
          )
          .join('')
        parts.push(
          `<table border="1" cellspacing="0" cellpadding="4"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
        )
      }
    }
  })

  return parts.join('\n')
}

export const generateDocxPlainText = (config: DocxDocumentConfig): string => {
  const lines: string[] = []
  lines.push(config.title)
  lines.push('='.repeat(Math.max(config.title.length, 3)))
  lines.push('')

  config.blocks.forEach((block) => {
    switch (block.type) {
      case 'heading':
        lines.push(`${'#'.repeat(block.level)} ${block.text}`)
        lines.push('')
        return
      case 'paragraph':
        lines.push(block.text)
        lines.push('')
        return
      case 'list':
        block.items.forEach((item, index) => {
          const prefix = block.ordered ? `${index + 1}. ` : '- '
          lines.push(`${prefix}${item}`)
        })
        lines.push('')
        return
      case 'blockquote':
        block.text.split('\n').forEach((line) => lines.push(`> ${line}`))
        lines.push('')
        return
      case 'table': {
        const widths = block.headers.map((header, columnIndex) =>
          Math.max(
            header.length,
            ...block.rows.map((row) => (row[columnIndex] ?? '').length)
          )
        )
        const formatRow = (cells: string[]) =>
          `| ${cells
            .map((cell, index) => (cell ?? '').padEnd(widths[index] ?? 0))
            .join(' | ')} |`
        lines.push(formatRow(block.headers))
        lines.push(
          `|${widths.map((width) => '-'.repeat(width + 2)).join('|')}|`
        )
        block.rows.forEach((row) => lines.push(formatRow(row)))
        lines.push('')
      }
    }
  })

  return lines.join('\n').trimEnd()
}

export const generateDocxBlob = async (
  config: DocxDocumentConfig
): Promise<Blob> => {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'docx-ordered-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            text: config.title,
            heading: HeadingLevel.TITLE,
            spacing: { after: 300 },
          }),
          ...blocksToDocxChildren(config.blocks),
        ],
      },
    ],
  })

  return Packer.toBlob(doc)
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({ config }) => {
  return (
    <div className='h-full overflow-auto bg-slate-100 p-6 dark:bg-slate-900'>
      <div className='mx-auto flex max-w-3xl flex-col gap-5 rounded-sm bg-white p-10 shadow-lg dark:bg-slate-800 dark:shadow-slate-950/50'>
        <h1
          className={`border-b pb-4 text-4xl font-bold ${borderLight} ${textPrimary}`}
        >
          {config.title}
        </h1>
        {config.blocks.map((block, index) => renderPreviewBlock(block, index))}
      </div>
    </div>
  )
}

export default DocxRenderer
