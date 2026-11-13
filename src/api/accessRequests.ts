import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'
import {
  SignupOptions,
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

export const getSignupOptionsAPI = (): Promise<SignupOptions> =>
  baseRequest<SignupOptions>({
    url: 'users/api/signup-options/',
    method: METHOD.GET,
    includeAuthToken: false,
  })
