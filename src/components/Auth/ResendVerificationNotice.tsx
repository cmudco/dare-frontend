import React from 'react'
import { EmailVerificationSentResponse } from '@/redux/types/auth'
import { EMAIL_DELIVERY_UNAVAILABLE_MESSAGE } from '@/utils/constants/user'

interface ResendVerificationNoticeProps {
  result: EmailVerificationSentResponse
}

const ResendVerificationNotice: React.FC<ResendVerificationNoticeProps> = ({
  result,
}) => (
  <p
    role='status'
    className='mt-3 rounded-md border border-border bg-muted px-4 py-2 text-xs font-medium text-foreground'
  >
    {result.emailDeliveryConfigured
      ? 'Verification email requested. If it does not arrive, contact your deployment administrator.'
      : EMAIL_DELIVERY_UNAVAILABLE_MESSAGE}
  </p>
)

export default ResendVerificationNotice
