import { jsPDF } from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'
import type { RasterImageFormat } from './types'

export async function convertSvgToImageBlob(
  svg: string,
  format: RasterImageFormat
): Promise<Blob> {
  const canvas = await renderSvgToCanvas(svg)
  return await canvasToBlob(canvas, format)
}

export async function generateRasterPdfFromSvg(svg: string): Promise<Blob> {
  const canvas = await renderSvgToCanvas(svg, 2)
  const { width, height } = getSvgDimensionsFromSource(svg)
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height],
  })

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height)
  return pdf.output('blob')
}

export async function generateSvgPdfBlob(svg: string): Promise<Blob> {
  const parser = new DOMParser()
  const document = parser.parseFromString(svg, 'image/svg+xml')
  const svgElement = document.documentElement as unknown as SVGSVGElement
  const { width, height } = getSvgDimensions(svgElement)
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height],
  })

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width,
    height,
  })

  return pdf.output('blob')
}

export function escapeSvg(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function getSvgDimensions(svgElement: SVGSVGElement) {
  const viewBox = svgElement.getAttribute('viewBox')
  if (viewBox) {
    const [, , viewBoxWidth, viewBoxHeight] = viewBox.split(/\s+/).map(Number)
    if (viewBoxWidth > 0 && viewBoxHeight > 0) {
      return { width: viewBoxWidth, height: viewBoxHeight }
    }
  }

  const width = Number.parseFloat(svgElement.getAttribute('width') || '960')
  const height = Number.parseFloat(svgElement.getAttribute('height') || '540')
  return {
    width: Number.isFinite(width) && width > 0 ? width : 960,
    height: Number.isFinite(height) && height > 0 ? height : 540,
  }
}

async function renderSvgToCanvas(
  svg: string,
  scale = 1
): Promise<HTMLCanvasElement> {
  const normalizedSvg = normalizeSvgForRaster(svg)
  const { width, height } = getSvgDimensionsFromSource(normalizedSvg)
  const svgBlob = new Blob([normalizedSvg], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.ceil(width * scale))
    canvas.height = Math.max(1, Math.ceil(height * scale))

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas rendering is unavailable')
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

function normalizeSvgForRaster(svg: string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(svg, 'image/svg+xml')
  const svgElement = document.documentElement
  const { width, height } = getSvgDimensions(
    svgElement as unknown as SVGSVGElement
  )

  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svgElement.setAttribute('width', String(width))
  svgElement.setAttribute('height', String(height))
  if (!svgElement.getAttribute('viewBox')) {
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }

  return new XMLSerializer().serializeToString(svgElement)
}

function getSvgDimensionsFromSource(svg: string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(svg, 'image/svg+xml')
  return getSvgDimensions(document.documentElement as unknown as SVGSVGElement)
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: RasterImageFormat
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Image conversion failed'))
        }
      },
      format === ArtifactDownloadFormat.JPEG ? 'image/jpeg' : 'image/png',
      0.92
    )
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (image.decode) {
        void image.decode().finally(() => resolve(image))
      } else {
        resolve(image)
      }
    }
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = source
  })
}
