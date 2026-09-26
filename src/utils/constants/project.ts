// Mirrors projects/constants.py on the backend.
export const PROJECT_NAME_MAX_LENGTH = 120
export const PROJECT_DESCRIPTION_MAX_LENGTH = 500
export const PROJECT_INSTRUCTIONS_MAX_LENGTH = 20000

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

export const SIDEBAR_RECENT_PROJECTS = 5
