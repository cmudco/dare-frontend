export interface Tag {
  id: number
  /** Null for tags shared with everyone, which only admins can delete. */
  user: number | null
  label: string
  fileCount?: number
}

export interface TagState {
  tags: Tag[]
  loading: boolean
  error: string | null
}
