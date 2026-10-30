import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '@/components/Auth/AuthCard'
import AuthFormFooter from '@/components/Auth/AuthFormFooter'
import { useAppDispatch } from '@/redux/hooks'
import { resendVerification } from '@/redux/asyncThunks/user'

const SignupPendingScreen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const email =
    typeof location.state?.email === 'string' ? location.state.email : undefined
  const [requested, setRequested] = useState(false)
  const [sending, setSending] = useState(false)

  const resend = async () => {
    if (!email || sending) return
    setSending(true)
    try {
      await dispatch(resendVerification({ email })).unwrap()
      setRequested(true)
    } catch {
      // The existing auth slice displays the request error in AuthCard.
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthCard
      title='Account awaiting approval'
      subtitle='Your account has been created. Follow the email verification link and wait for an administrator to approve your request. Neither step alone enables sign-in. We will email you when your account is ready.'
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
            {requested && (
              <p className='mt-3 text-sm text-muted-foreground'>
                Verification requested again. Contact your deployment
                administrator if it does not arrive.
              </p>
            )}
          </>
        ) : undefined
      }
    />
  )
}

export default SignupPendingScreen
