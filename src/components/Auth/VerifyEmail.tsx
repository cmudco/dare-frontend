import { useEffect } from 'react'
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

  useEffect(() => {
    const key = searchParams.get('key')
    if (key) {
      dispatch(verifyEmailRegistration({ key }))
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
        } else {
          // DARE users - auto-login if we have a token
          navigate(hasToken ? '/dashboard' : '/login')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, navigate, searchParams])

  return (
    <AuthCard
      title='Email Verification'
      subtitle={
        successMessage
          ? 'Your email has been verified successfully.'
          : 'Verifying your email...'
      }
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
          <p className='text-muted-foreground'>
            {!searchParams.get('callbackurl') && localStorage.getItem('token')
              ? 'Redirecting to dashboard...'
              : 'Redirecting to login...'}
          </p>
        </div>
      )}
    </AuthCard>
  )
}

export default VerifyEmailScreen
