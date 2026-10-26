// Mirrors projects/constants.py on the backend.
export const PROJECT_NAME_MAX_LENGTH = 120
export const PROJECT_DESCRIPTION_MAX_LENGTH = 500
export const PROJECT_INSTRUCTIONS_MAX_LENGTH = 20000

export enum ProjectSourceMode {
  SEARCH = 'search',
  FULL = 'full',
}

export const PROJECT_SOURCE_MODE_LABELS: Record<ProjectSourceMode, string> = {
  [ProjectSourceMode.SEARCH]: 'Search',
  [ProjectSourceMode.FULL]: 'Full files',
}

export enum SourceSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name-asc',
  NAME_DESC = 'name-desc',
}

export const SOURCE_SORT_LABELS: Record<SourceSort, string> = {
  [SourceSort.NEWEST]: 'Newest first',
  [SourceSort.OLDEST]: 'Oldest first',
  [SourceSort.NAME_ASC]: 'Name A–Z',
  [SourceSort.NAME_DESC]: 'Name Z–A',
}

export const SOURCE_SORT_STORAGE_KEY = 'dare_project_source_sort'

export enum ProjectMemoryScope {
  ALL = 'all',
  PROJECT = 'project',
}

export enum ProjectIconKey {
  FOLDER = 'folder',
  BOOK = 'book',
  FLASK = 'flask',
  BRIEFCASE = 'briefcase',
  GRADUATION = 'graduation',
  CHART = 'chart',
  CODE = 'code',
  LIGHTBULB = 'lightbulb',
  PEN = 'pen',
  GLOBE = 'globe',
  HEART = 'heart',
  CALENDAR = 'calendar',
}
