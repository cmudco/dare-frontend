export const TABLE_HEAD = ['File Name', 'File Type', 'Size', 'Tags', 'Action']

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
  '.docx',
  '.doc',
  '.pdf',
  '.txt',
  '.md',
  '.json',
]

export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/markdown',
  'text/x-markdown',
  'application/json',
]

export const MAX_FILE_SIZE_MB = 30

export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export enum FileStatus {
  PROCESSING = 0,
  PROCESSED = 1,
  FAILED = 2,
}
