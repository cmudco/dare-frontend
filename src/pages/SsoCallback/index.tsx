import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { getUserData, ssoLogin } from '@/redux/asyncThunks/user'
import AuthCard from '@/components/Auth/AuthCard'

const SsoCallbackScreen = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const exchangeRequested = useRef(false)

  useEffect(() => {
    // The code works once: a second request (StrictMode remount) would fail.
    if (exchangeRequested.current) return
    exchangeRequested.current = true

    const code = searchParams.get('code')
    if (!code) {
      navigate('/login?sso_error=expired', { replace: true })
      return
    }
    dispatch(ssoLogin(code))
      .unwrap()
      .then(() => dispatch(getUserData()).unwrap())
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => navigate('/login?sso_error=expired', { replace: true }))
  }, [searchParams, dispatch, navigate])

  return (
    <AuthCard
      title='Signing you in'
      subtitle='One moment…'
      subtitleClassName='text-center'
      inputs={[]}
      formikConfig={{ initialValues: {}, onSubmit: () => {} }}
      buttonText=''
    />
  )
}

export default SsoCallbackScreen
