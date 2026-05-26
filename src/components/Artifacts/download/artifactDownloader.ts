import type { ArtifactType } from '@/redux/types/artifact'
import type { DocxDocumentConfig } from '@/redux/types/dareToolResults'
import { downloadArtifactAPI } from '@/api/artifacts'
import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'
import {
  getSourceExtension,
  getSourceMimeType,
} from './artifactDownloadOptions'
import { generateChartSvg } from './chartExport'
import { generateMermaidSvg } from './diagramExport'
import { triggerBrowserDownload } from './fileDownload'
import { convertImageToBlob, getOriginalImageBlob } from './imageExport'
import { generatePptxFromSvgArtifact } from './pptxExport'
import {
  convertSvgToImageBlob,
  generateRasterPdfFromSvg,
  generateSvgPdfBlob,
} from './svgExport'
import { generateDocxBlob } from '../renderers/DocxRenderer'

interface DownloadArtifactParams {
  artifactId: number
  artifactType: ArtifactType
  content: string
  contentType?: string
  conversationId?: string
  filename?: string
  format: ArtifactDownloadFormat
  sanitizedTitle: string
}

export async function downloadArtifact(params: DownloadArtifactParams) {
  const {
    artifactId,
    artifactType,
    content,
    contentType,
    conversationId,
    filename,
    format,
    sanitizedTitle,
  } = params

  if (artifactType === 'docx' && format === ArtifactDownloadFormat.DOCX) {
    const config = JSON.parse(content) as DocxDocumentConfig
    const blob = await generateDocxBlob(config)
    triggerBrowserDownload(blob, `${sanitizedTitle}.docx`)
    return
  }

  if (isBackendDownload(artifactType, format)) {
    const response = await downloadArtifactAPI(
      artifactId,
      format,
      conversationId
    )
    triggerBrowserDownload(
      response.blob,
      response.filename || `${sanitizedTitle}.${format}`
    )
    return
  }

  if (artifactType === 'diagram') {
    await downloadDiagramArtifact(content, format, sanitizedTitle)
    return
  }

  if (artifactType === 'image') {
    await downloadImageArtifact(
      content,
      format,
      sanitizedTitle,
      contentType,
      filename
    )
    return
  }

  if (artifactType === 'chart') {
    await downloadChartArtifact(content, format, sanitizedTitle)
    return
  }

  const extension = getSourceExtension(artifactType)
  triggerBrowserDownload(
    new Blob([content], { type: getSourceMimeType(artifactType) }),
    `${sanitizedTitle}.${extension}`
  )
}

function isBackendDownload(
  artifactType: ArtifactType,
  format: ArtifactDownloadFormat
): format is ArtifactDownloadFormat.PPTX | ArtifactDownloadFormat.PDF {
  return (
    (artifactType === 'pptx' &&
      (format === ArtifactDownloadFormat.PPTX ||
        format === ArtifactDownloadFormat.PDF)) ||
    (artifactType === 'docx' && format === ArtifactDownloadFormat.PDF)
  )
}

async function downloadDiagramArtifact(
  content: string,
  format: ArtifactDownloadFormat,
  sanitizedTitle: string
) {
  if (format === ArtifactDownloadFormat.MMD) {
    triggerBrowserDownload(
      new Blob([content], { type: 'text/plain;charset=utf-8' }),
      `${sanitizedTitle}.mmd`
    )
    return
  }

  const svg = await generateMermaidSvg(content, {
    rasterSafe: format !== ArtifactDownloadFormat.SVG,
  })

  if (format === ArtifactDownloadFormat.SVG) {
    triggerBrowserDownload(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${sanitizedTitle}.svg`
    )
  } else if (format === ArtifactDownloadFormat.PPTX) {
    const blob = await generatePptxFromSvgArtifact(svg, sanitizedTitle)
    triggerBrowserDownload(blob, `${sanitizedTitle}.pptx`)
  } else if (format === ArtifactDownloadFormat.PDF) {
    const blob = await generateRasterPdfFromSvg(svg)
    triggerBrowserDownload(blob, `${sanitizedTitle}.pdf`)
  } else if (isRasterImageFormat(format)) {
    const blob = await convertSvgToImageBlob(svg, format)
    triggerBrowserDownload(blob, getRasterFilename(sanitizedTitle, format))
  }
}

async function downloadImageArtifact(
  content: string,
  format: ArtifactDownloadFormat,
  sanitizedTitle: string,
  contentType?: string,
  filename?: string
) {
  if (format === ArtifactDownloadFormat.IMAGE_ORIGINAL) {
    const { blob, extension } = await getOriginalImageBlob(
      content,
      contentType,
      filename
    )
    triggerBrowserDownload(blob, `${sanitizedTitle}.${extension}`)
    return
  }

  if (isRasterImageFormat(format)) {
    const blob = await convertImageToBlob(content, format)
    triggerBrowserDownload(blob, getRasterFilename(sanitizedTitle, format))
  }
}

async function downloadChartArtifact(
  content: string,
  format: ArtifactDownloadFormat,
  sanitizedTitle: string
) {
  if (format === ArtifactDownloadFormat.CHART_JSON) {
    triggerBrowserDownload(
      new Blob([content], { type: 'application/json;charset=utf-8' }),
      `${sanitizedTitle}.json`
    )
    return
  }

  const svg = generateChartSvg(content)
  if (format === ArtifactDownloadFormat.SVG) {
    triggerBrowserDownload(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${sanitizedTitle}.svg`
    )
  } else if (format === ArtifactDownloadFormat.PPTX) {
    const blob = await generatePptxFromSvgArtifact(svg, sanitizedTitle)
    triggerBrowserDownload(blob, `${sanitizedTitle}.pptx`)
  } else if (format === ArtifactDownloadFormat.PDF) {
    const blob = await generateSvgPdfBlob(svg)
    triggerBrowserDownload(blob, `${sanitizedTitle}.pdf`)
  } else if (isRasterImageFormat(format)) {
    const blob = await convertSvgToImageBlob(svg, format)
    triggerBrowserDownload(blob, getRasterFilename(sanitizedTitle, format))
  }
}

function isRasterImageFormat(
  format: ArtifactDownloadFormat
): format is ArtifactDownloadFormat.PNG | ArtifactDownloadFormat.JPEG {
  return (
    format === ArtifactDownloadFormat.PNG ||
    format === ArtifactDownloadFormat.JPEG
  )
}

function getRasterFilename(title: string, format: ArtifactDownloadFormat) {
  return `${title}.${format === ArtifactDownloadFormat.JPEG ? 'jpg' : 'png'}`
}
