import { ArtifactDownloadFormat } from '@/utils/constants/artifactDownloads'

export interface DownloadOption {
  format: ArtifactDownloadFormat
  label: string
}

export type RasterImageFormat =
  | ArtifactDownloadFormat.PNG
  | ArtifactDownloadFormat.JPEG
