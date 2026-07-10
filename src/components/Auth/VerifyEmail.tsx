import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import AuthCard from './AuthCard'
import { verifyEmailRegistration } from '@/redux/asyncThunks/user'

const VerifyEmailScreen = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error, successMessage } = useAppSelector(
    (state) => state.user
  )
  const [alreadyVerified, setAlreadyVerified] = useState(false)
  const verificationRequested = useRef(false)

  useEffect(() => {
    const key = searchParams.get('key')
    // Guard against duplicate requests (StrictMode/remounts): the second POST
    // would land after the key is consumed and surface a spurious error
    if (key && !verificationRequested.current) {
      verificationRequested.current = true
      dispatch(verifyEmailRegistration({ key }))
        .unwrap()
        .then((data) => setAlreadyVerified(Boolean(data?.alreadyVerified)))
        .catch(() => {})
    }
  }, [searchParams, dispatch])

  useEffect(() => {
    if (successMessage) {
      const callbackUrl = searchParams.get('callbackurl')
      const hasToken = localStorage.getItem('token')
      const timer = setTimeout(() => {
        if (callbackUrl) {
          // Socratic Bots or external platform - always redirect to login
          // (tokens in DARE localStorage won't be accessible on other domains)
          window.location.href = `${callbackUrl}/login`
        } else if (hasToken) {
          // DARE users - auto-login if we have a token
          navigate('/dashboard')
        } else {
          // Already-verified visitors go home; fresh verifications go to login
          navigate(alreadyVerified ? '/' : '/login')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, navigate, searchParams, alreadyVerified])

  return (
    <AuthCard
      title='Email Verification'
      subtitle={
        successMessage
          ? alreadyVerified
            ? 'Your email is already verified.'
            : 'Your email has been verified successfully.'
          : 'Verifying your email...'
      }
      subtitleClassName='text-center'
      inputs={[]}
      formikConfig={{
        initialValues: {},
        onSubmit: () => {},
      }}
      buttonText=''
      showBackButton={false}
      showForgotPassword={false}
      showprivacyPolicy={false}
    >
      {loading && (
        <div className='flex flex-col items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-foreground'></div>
          <p className='mt-4 text-muted-foreground'>Verifying your email...</p>
        </div>
      )}

      {error && (
        <div className='flex justify-center gap-2 text-sm text-destructive'>
          {error}
        </div>
      )}

      {successMessage && (
        <div className='flex flex-col items-center gap-2 text-sm text-green-500'>
          <p>{successMessage}</p>
          <p className='text-center text-muted-foreground'>
            {!searchParams.get('callbackurl') && localStorage.getItem('token')
              ? 'Redirecting to dashboard...'
              : !searchParams.get('callbackurl') && alreadyVerified
                ? 'Redirecting to home page...'
                : 'Redirecting to login...'}
          </p>
        </div>
      )}
    </AuthCard>
  )
}

export default VerifyEmailScreen
