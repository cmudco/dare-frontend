import { baseRequest } from '@/utils/requests'
import { METHOD } from '@/utils/constants/requests'

/**
 * Request an OTP for SyftBox authentication (e.g. sent via email/SMS per backend).
 */
export const requestSyftboxOtpAPI = async (): Promise<void> => {
  await baseRequest<void>({
    url: 'syftbox/api/auth/request-otp/',
    method: METHOD.POST,
    data: {},
  })
}

/**
 * Verify OTP and complete SyftBox connection for the current user.
 * Backend expects JSON `{ code: "<value>" }`, not `otp`.
 */
export const verifySyftboxOtpAPI = async (code: string): Promise<void> => {
  await baseRequest<void>({
    url: 'syftbox/api/auth/verify-otp/',
    method: METHOD.POST,
    data: { code },
  })
}
