import { ReleaseNoteItemKind } from '@/redux/types/releaseNotes'

export const RELEASE_NOTE_KIND_LABEL: Record<ReleaseNoteItemKind, string> = {
  [ReleaseNoteItemKind.NEW]: 'New',
  [ReleaseNoteItemKind.IMPROVED]: 'Improved',
  [ReleaseNoteItemKind.FIXED]: 'Fixed',
}
