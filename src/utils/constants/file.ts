export const TABLE_HEAD = [
  'File Name',
  'File Type',
  'Size',
  'Date Created',
  'Tags',
  'Status',
  'Action',
]

export const TAG_COLORS: {
  [key: string]: 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'gray'
} = {
  Archived: 'blue',
  Favorite: 'green',
  Personal: 'yellow',
  GenAI: 'blue',
  Review: 'green',
  Research: 'yellow',
  Important: 'red',
  AutoCorrecting: 'purple',
  MachineLearning: 'gray',
  Steps: 'green',
  Work: 'purple',
}

export const ALLOWED_FILE_EXTENSIONS = [
  // Documents
  '.docx',
  '.doc',
  '.pdf',
  '.txt',
  '.md',
  '.json',
  // Spreadsheets
  '.csv',
  '.xls',
  '.xlsx',
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tiff',
  '.svg',
  // Videos
  '.mp4',
  '.webm',
  '.mov',
  '.avi',
  '.mpeg',
  '.ogg',
  // Audio
  '.mp3',
  '.wav',
  '.m4a',
  '.flac',
  '.aac',
  '.wma',
  '.opus',
]

export const ALLOWED_FILE_TYPES = [
  // Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/markdown',
  'text/x-markdown',
  'application/json',
  // Spreadsheets
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
  'video/ogg',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
  'audio/aac',
  'audio/x-ms-wma',
  'audio/opus',
  'audio/ogg',
]

export const MAX_FILE_SIZE_MB = 100

export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export enum FileStatus {
  PROCESSING = 0,
  PROCESSED = 1,
  FAILED = 2,
}

export const FOLDER_TABLE_HEAD = ['Folder Name', 'Last Updated', 'Action']

export const FILE_TABLE_HEADER_TO_KEY = {
  'File Name': 'name',
  'File Type': 'fileType',
  Size: 'size',
  'Date Created': 'createdAt',
  Tags: 'tags',
  Status: 'status',
  Action: null,
} as const
