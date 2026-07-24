import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'
import { AccountDeletionResponse } from '@/redux/types/accountDeletion'

export const deleteAccountAPI = async (
  confirmation: string
): Promise<AccountDeletionResponse> => {
  return await baseRequest<AccountDeletionResponse>({
    url: 'users/api/account/',
    method: METHOD.DELETE,
    data: { confirmation },
  })
}
