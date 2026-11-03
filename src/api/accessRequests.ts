import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  AccessRequestInput,
  AccessRequestResponse,
} from '@/redux/types/accessRequest'

export const requestAccessAPI = (
  data: AccessRequestInput
): Promise<AccessRequestResponse> =>
  baseRequest<AccessRequestResponse>({
    url: 'users/api/access-requests/',
    method: METHOD.POST,
    includeAuthToken: false,
    data,
  })
