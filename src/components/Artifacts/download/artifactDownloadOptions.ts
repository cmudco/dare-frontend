import type { ArtifactType } from '@/redux/types/artifact'
import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'
import type { DownloadOption } from './types'

export function getDownloadOptions(
  artifactType: ArtifactType,
  contentType?: string,
  filename?: string,
  content?: string
): DownloadOption[] {
  switch (artifactType) {
    case 'pptx':
      return [
        { format: ArtifactDownloadFormat.PPTX, label: 'PowerPoint (.pptx)' },
        { format: ArtifactDownloadFormat.PDF, label: 'PDF (.pdf)' },
      ]
    case 'docx':
      return [
        { format: ArtifactDownloadFormat.DOCX, label: 'Word Document (.docx)' },
        { format: ArtifactDownloadFormat.PDF, label: 'PDF (.pdf)' },
      ]
    case 'diagram':
      return [
        { format: ArtifactDownloadFormat.SVG, label: 'SVG (.svg)' },
        { format: ArtifactDownloadFormat.PNG, label: 'PNG (.png)' },
        { format: ArtifactDownloadFormat.JPEG, label: 'JPEG (.jpg)' },
        { format: ArtifactDownloadFormat.PDF, label: 'PDF (.pdf)' },
        { format: ArtifactDownloadFormat.MMD, label: 'Mermaid Source (.mmd)' },
      ]
    case 'chart':
      return [
        { format: ArtifactDownloadFormat.PNG, label: 'PNG (.png)' },
        { format: ArtifactDownloadFormat.JPEG, label: 'JPEG (.jpg)' },
        { format: ArtifactDownloadFormat.SVG, label: 'SVG (.svg)' },
        { format: ArtifactDownloadFormat.PDF, label: 'PDF (.pdf)' },
        {
          format: ArtifactDownloadFormat.CHART_JSON,
          label: 'Chart Data (.json)',
        },
      ]
    case 'image':
      return [
        {
          format: ArtifactDownloadFormat.IMAGE_ORIGINAL,
          label: `Original Image (.${getImageExtension(contentType, filename, content)})`,
        },
        { format: ArtifactDownloadFormat.PNG, label: 'PNG (.png)' },
        { format: ArtifactDownloadFormat.JPEG, label: 'JPEG (.jpg)' },
      ]
    case 'react':
      return [
        { format: ArtifactDownloadFormat.JSX, label: 'React Source (.jsx)' },
      ]
    case 'code':
      return [
        { format: ArtifactDownloadFormat.TXT, label: 'Source Text (.txt)' },
      ]
    case 'document':
      return [{ format: ArtifactDownloadFormat.MD, label: 'Markdown (.md)' }]
    default:
      return []
  }
}

export function getFormatLabel(format: ArtifactDownloadFormat) {
  switch (format) {
    case ArtifactDownloadFormat.JPEG:
      return 'JPEG'
    case ArtifactDownloadFormat.PNG:
      return 'PNG'
    case ArtifactDownloadFormat.SVG:
      return 'SVG'
    case ArtifactDownloadFormat.PDF:
      return 'PDF'
    case ArtifactDownloadFormat.CHART_JSON:
      return 'JSON'
    case ArtifactDownloadFormat.MMD:
      return 'Mermaid source'
    default:
      return format.toUpperCase()
  }
}

export function getSourceExtension(artifactType: ArtifactType) {
  if (artifactType === 'react') return 'jsx'
  if (artifactType === 'document') return 'md'
  return 'txt'
}

export function getSourceMimeType(artifactType: ArtifactType) {
  if (artifactType === 'react') return 'text/jsx;charset=utf-8'
  if (artifactType === 'document') return 'text/markdown;charset=utf-8'
  return 'text/plain;charset=utf-8'
}

export function getImageExtension(
  contentType?: string,
  filename?: string,
  content?: string
) {
  const mimeExtension = getImageExtensionFromMime(contentType)
  if (mimeExtension) return mimeExtension

  const filenameExtension = getImageExtensionFromFilename(filename)
  if (filenameExtension) return filenameExtension

  const dataUrlMatch = content?.match(/^data:([^;,]+)[;,]/)
  const dataUrlExtension = getImageExtensionFromMime(dataUrlMatch?.[1])
  if (dataUrlExtension) return dataUrlExtension

  return 'png'
}

function getImageExtensionFromMime(contentType?: string) {
  const normalized = contentType?.toLowerCase().split(';')[0].trim()
  switch (normalized) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/svg+xml':
      return 'svg'
    case 'image/bmp':
      return 'bmp'
    default:
      return ''
  }
}

function getImageExtensionFromFilename(filename?: string) {
  const match = filename?.toLowerCase().match(/\.([a-z0-9]+)$/)
  const extension = match?.[1]
  if (
    extension &&
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(extension)
  ) {
    return extension === 'jpeg' ? 'jpg' : extension
  }
  return ''
}
