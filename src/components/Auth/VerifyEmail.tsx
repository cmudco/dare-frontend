import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import AuthCard from './AuthCard'
import { verifyEmailRegistration } from '@/redux/aynscThunks/user'

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
      const timer = setTimeout(() => {
        navigate('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, navigate])

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
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          <p className='mt-4 text-gray-600'>Verifying your email...</p>
        </div>
      )}

      {error && (
        <div className='text-red-500 text-sm flex justify-center gap-2'>
          {error}
        </div>
      )}

      {successMessage && (
        <div className='text-green-500 text-sm flex flex-col items-center gap-2'>
          <p>{successMessage}</p>
          <p className='text-gray-600'>Redirecting to login...</p>
        </div>
      )}
    </AuthCard>
  )
}

export default VerifyEmailScreen
