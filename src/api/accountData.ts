/**
 * Account Data API
 *
 * Export, restore and permanent deletion of the whole account.
 */
import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import type {
  DeleteAccountResult,
  ExportScope,
  RestoreResult,
} from '@/redux/types/accountData'

/** Download the account archive. The server names the file. */
export const exportAccountDataAPI = async (
  scope: ExportScope
): Promise<{ blob: Blob; filename: string }> => {
  return await baseRequest({
    url: 'api/account-data/export/',
    method: METHOD.GET,
    params: { scope },
    responseType: 'blob',
  })
}

export const restoreAccountDataAPI = async (
  archive: File
): Promise<RestoreResult> => {
  const form = new FormData()
  form.append('archive', archive)
  return await baseRequest<RestoreResult>({
    url: 'api/account-data/restore/',
    method: METHOD.POST,
    data: form,
  })
}

export const deleteAccountAPI = async (
  confirmation: string
): Promise<DeleteAccountResult> => {
  return await baseRequest<DeleteAccountResult>({
    url: 'users/api/account/',
    method: METHOD.DELETE,
    data: { confirmation },
  })
}
