import { convertSvgToPngDataUrl, getSvgDimensionsFromSource } from './svgExport'

const SLIDE_WIDTH = 13.333
const SLIDE_HEIGHT = 7.5
const SLIDE_MARGIN = 0.45
const TITLE_HEIGHT = 0.45
const TITLE_Y = 0.25
const IMAGE_Y = 0.95

export async function generatePptxFromSvgArtifact(
  svg: string,
  title: string
): Promise<Blob> {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'DARE'
  pptx.company = 'DARE'
  pptx.subject = 'DARE artifact export'
  pptx.title = title
  pptx.theme = {
    headFontFace: 'Aptos',
    bodyFontFace: 'Aptos',
  }

  const slide = pptx.addSlide()
  slide.background = { color: 'FFFFFF' }
  slide.addText(title || 'Artifact', {
    x: SLIDE_MARGIN,
    y: TITLE_Y,
    w: SLIDE_WIDTH - SLIDE_MARGIN * 2,
    h: TITLE_HEIGHT,
    margin: 0,
    fontFace: 'Aptos',
    fontSize: 18,
    bold: true,
    color: '111827',
    breakLine: false,
    fit: 'shrink',
  })

  const imageData = await convertSvgToPngDataUrl(svg, 2.5)
  const imageBox = getImageBox(svg)
  slide.addImage({
    data: imageData,
    x: imageBox.x,
    y: imageBox.y,
    w: imageBox.w,
    h: imageBox.h,
    altText: title || 'DARE artifact',
  })

  const output = await pptx.write({ outputType: 'blob', compression: true })
  if (output instanceof Blob) return output
  if (output instanceof ArrayBuffer) {
    return new Blob([output], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })
  }
  if (output instanceof Uint8Array) {
    return new Blob([output], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })
  }

  return new Blob([output], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  })
}

function getImageBox(svg: string) {
  const { width, height } = getSvgDimensionsFromSource(svg)
  const maxWidth = SLIDE_WIDTH - SLIDE_MARGIN * 2
  const maxHeight = SLIDE_HEIGHT - IMAGE_Y - SLIDE_MARGIN
  const aspectRatio = width > 0 && height > 0 ? width / height : 16 / 9

  let imageWidth = maxWidth
  let imageHeight = imageWidth / aspectRatio
  if (imageHeight > maxHeight) {
    imageHeight = maxHeight
    imageWidth = imageHeight * aspectRatio
  }

  return {
    x: (SLIDE_WIDTH - imageWidth) / 2,
    y: IMAGE_Y + (maxHeight - imageHeight) / 2,
    w: imageWidth,
    h: imageHeight,
  }
}
