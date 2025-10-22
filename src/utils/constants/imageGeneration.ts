/**
 * Image Generation Constants
 * Used for DALL-E image generation configuration and pricing
 */

export enum ImageSize {
  SQUARE = '1024x1024',
  PORTRAIT = '1024x1792',
  LANDSCAPE = '1792x1024',
}

export enum ImageQuality {
  STANDARD = 'standard',
  HD = 'hd',
}

export enum ImageStyle {
  VIVID = 'vivid',
  NATURAL = 'natural',
}

export type ImageSizeType = `${ImageSize}`
export type ImageQualityType = `${ImageQuality}`
export type ImageStyleType = `${ImageStyle}`

/**
 * DALL-E 3 Pricing Structure (in USD)
 * Source: OpenAI Pricing (as of 2024)
 */
export const DALLE_3_PRICING = {
  [ImageQuality.STANDARD]: {
    [ImageSize.SQUARE]: 0.04,
    [ImageSize.PORTRAIT]: 0.08,
    [ImageSize.LANDSCAPE]: 0.08,
  },
  [ImageQuality.HD]: {
    [ImageSize.SQUARE]: 0.08,
    [ImageSize.PORTRAIT]: 0.12,
    [ImageSize.LANDSCAPE]: 0.12,
  },
} as const

/**
 * Default Image Generation Settings
 */
export const DEFAULT_IMAGE_SETTINGS = {
  size: ImageSize.SQUARE,
  quality: ImageQuality.STANDARD,
  style: ImageStyle.VIVID,
} as const

/**
 * Image Size Display Names and Descriptions
 */
export const IMAGE_SIZE_CONFIG = {
  [ImageSize.SQUARE]: {
    label: 'Square - 1024×1024',
    description: 'Standard square format',
  },
  [ImageSize.PORTRAIT]: {
    label: 'Portrait - 1024×1792',
    description: 'Vertical orientation',
  },
  [ImageSize.LANDSCAPE]: {
    label: 'Landscape - 1792×1024',
    description: 'Horizontal orientation',
  },
} as const

/**
 * Image Quality Display Names and Descriptions
 */
export const IMAGE_QUALITY_CONFIG = {
  [ImageQuality.STANDARD]: {
    label: 'Standard',
    description: 'Balanced quality and speed',
  },
  [ImageQuality.HD]: {
    label: 'HD',
    description: 'Higher detail and fidelity',
  },
} as const

/**
 * Image Style Display Names and Descriptions
 */
export const IMAGE_STYLE_CONFIG = {
  [ImageStyle.VIVID]: {
    label: 'Vivid',
    description: 'Hyper-real and dramatic images',
  },
  [ImageStyle.NATURAL]: {
    label: 'Natural',
    description: 'More natural, less hyper-real',
  },
} as const

/**
 * Calculate cost for DALL-E 3 image generation
 */
export function calculateImageCost(
  size: ImageSizeType,
  quality: ImageQualityType
): number {
  return DALLE_3_PRICING[quality as ImageQuality][size as ImageSize]
}
