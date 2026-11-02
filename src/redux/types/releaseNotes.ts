import type { PaginatedResponse } from './notification'

export enum ReleaseNoteItemKind {
  NEW = 'new',
  IMPROVED = 'improved',
  FIXED = 'fixed',
}

export interface ReleaseNoteItem {
  id: number
  kind: ReleaseNoteItemKind
  title: string
  body: string
  /** In-app path for a "Try it" button; empty when the item has none. */
  linkPath: string
}

export interface ReleaseNote {
  id: number
  version: string
  title: string
  summary: string
  publishedAt: string
  items: ReleaseNoteItem[]
}

export type ReleaseNotePage = PaginatedResponse<ReleaseNote>
