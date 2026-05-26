import type { ArtifactType } from '@/redux/types/artifact'
import type { DocxDocumentConfig } from '@/redux/types/dareToolResults'
import {
  generateDocxHtml,
  generateDocxPlainText,
} from '../renderers/DocxRenderer'

export async function copyArtifactContent(
  artifactType: ArtifactType,
  content: string
) {
  if (artifactType !== 'docx') {
    await navigator.clipboard.writeText(content)
    return
  }

  const config = JSON.parse(content) as DocxDocumentConfig
  const plainText = generateDocxPlainText(config)
  const html = generateDocxHtml(config)
  const canWriteRichClipboard =
    typeof window !== 'undefined' &&
    typeof window.ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard.write === 'function'

  if (canWriteRichClipboard) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(plainText)
  }
}
