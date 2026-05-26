import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'
import { getImageExtension } from './artifactDownloadOptions'
import type { RasterImageFormat } from './types'

export async function getOriginalImageBlob(
  source: string,
  contentType?: string,
  filename?: string
) {
  const response = await fetch(resolveImageSource(source))
  if (!response.ok) {
    throw new Error(`Image request failed with status ${response.status}`)
  }

  const blob = await response.blob()
  const extension = getImageExtension(
    blob.type || contentType,
    filename,
    source
  )
  return { blob, extension }
}

export async function convertImageToBlob(
  source: string,
  format: RasterImageFormat
): Promise<Blob> {
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas rendering is unavailable')
  }

  if (format === ArtifactDownloadFormat.JPEG) {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.drawImage(image, 0, 0)

  return await canvasToBlob(canvas, format)
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (image.decode) {
        void image.decode().finally(() => resolve(image))
      } else {
        resolve(image)
      }
    }
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = resolveImageSource(source)
  })
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

function resolveImageSource(source: string) {
  if (/^(data:|blob:|https?:\/\/)/i.test(source)) {
    return source
  }

  if (source.startsWith('/')) {
    const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL
    return backendUrl ? `${backendUrl}${source}` : source
  }

  return source
}
