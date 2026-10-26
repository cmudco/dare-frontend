import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type { ReleaseNote, ReleaseNotePage } from '@/redux/types/releaseNotes'

export const getUnseenReleaseNotesAPI = async (): Promise<ReleaseNote[]> =>
  await baseRequest<ReleaseNote[]>({
    url: 'api/release-notes/unseen/',
    method: METHOD.GET,
    includeAuthToken: true,
  })

export const getReleaseNotesAPI = async (
  page: number
): Promise<ReleaseNotePage> =>
  await baseRequest<ReleaseNotePage>({
    url: `api/release-notes/?page=${page}`,
    method: METHOD.GET,
    includeAuthToken: true,
  })

export const markReleaseNoteSeenAPI = async (id: number): Promise<void> =>
  await baseRequest<void>({
    url: `api/release-notes/${id}/seen/`,
    method: METHOD.POST,
    includeAuthToken: true,
  })
