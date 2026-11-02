import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '@/components/Auth/AuthCard'
import AuthFormFooter from '@/components/Auth/AuthFormFooter'
import ResendVerificationNotice from '@/components/Auth/ResendVerificationNotice'
import { EmailVerificationSentResponse } from '@/redux/types/auth'
import { useAppDispatch } from '@/redux/hooks'
import { resendVerification } from '@/redux/asyncThunks/user'

const SignupPendingScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const email =
    typeof location.state?.email === 'string' ? location.state.email : undefined
  const [resendResult, setResendResult] =
    useState<EmailVerificationSentResponse | null>(null)
  const emailDeliveryConfigured =
    resendResult?.emailDeliveryConfigured ??
    location.state?.emailDeliveryConfigured ??
    false
  const [sending, setSending] = useState(false)

  const resend = async () => {
    if (!email || sending) return
    setSending(true)
    try {
      setResendResult(await dispatch(resendVerification({ email })).unwrap())
    } catch {
      // The existing auth slice displays the request error in AuthCard.
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthCard
      title='Account awaiting approval'
      subtitle={
        emailDeliveryConfigured
          ? 'Your account has been created. Check your inbox for the verification link and wait for administrator approval. Both steps are required before you can sign in.'
          : 'Your account has been created and needs administrator approval and email verification. This server is not configured to send verification emails. Contact your deployment administrator for help.'
      }
      inputs={[]}
      formikConfig={{ initialValues: {}, onSubmit: () => navigate('/login') }}
      buttonText='Back to login'
      footer={
        email ? (
          <>
            <AuthFormFooter
              text="Didn't receive the verification email?"
              routeText={sending ? 'Requesting…' : 'Resend'}
              onClick={resend}
            />
            {resendResult && <ResendVerificationNotice result={resendResult} />}
          </>
        ) : undefined
      }
    />
  )
}

export default SignupPendingScreen
