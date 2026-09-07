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

type DocxAlignment = 'left' | 'center' | 'right'

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
