/**
 * Image Generation Constants
 * Sizes and quality levels accepted by OpenAI's GPT Image models.
 */

export enum ImageSize {
  SQUARE = '1024x1024',
  PORTRAIT = '1024x1536',
  LANDSCAPE = '1536x1024',
}

export enum ImageQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type ImageSizeType = `${ImageSize}`
export type ImageQualityType = `${ImageQuality}`

export const DEFAULT_IMAGE_SETTINGS = {
  size: ImageSize.SQUARE,
  quality: ImageQuality.MEDIUM,
} as const

export const IMAGE_SIZE_CONFIG = {
  [ImageSize.SQUARE]: {
    label: 'Square - 1024×1024',
    description: 'Standard square format',
  },
  [ImageSize.PORTRAIT]: {
    label: 'Portrait - 1024×1536',
    description: 'Vertical orientation',
  },
  [ImageSize.LANDSCAPE]: {
    label: 'Landscape - 1536×1024',
    description: 'Horizontal orientation',
  },
} as const

export const IMAGE_QUALITY_CONFIG = {
  [ImageQuality.LOW]: {
    label: 'Low',
    description: 'Fastest and cheapest',
  },
  [ImageQuality.MEDIUM]: {
    label: 'Medium',
    description: 'Balanced quality and cost',
  },
  [ImageQuality.HIGH]: {
    label: 'High',
    description: 'Most detail, highest cost',
  },
} as const
