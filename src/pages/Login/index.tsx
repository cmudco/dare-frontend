import React, { useEffect, useState } from 'react'
import AuthCard from '../../components/Auth/AuthCard'
import AuthFormFooter from '../../components/Auth/AuthFormFooter'
import {
  LoginFormValues,
  loginInitialValues,
  loginValidationSchema,
} from './validation'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'
import { toggleMode } from '../../redux/themeSlice'
import { useNavigate } from 'react-router-dom'
import {
  getUserData,
  userLogin,
  resendVerification,
} from '../../redux/asyncThunks/user'
import { resetError } from '../../redux/userSlice'
import { useAppSelector } from '../../redux/hooks'
import { Button } from '../../components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const LoginScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAppSelector((state) => state.user)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    dispatch(resetError())
  }, [dispatch])

  useEffect(() => {
    const checkAndShowToast = () => {
      const sessionExpiredToast = localStorage.getItem('sessionExpiredToast')

      if (sessionExpiredToast) {
        try {
          const toastData = JSON.parse(sessionExpiredToast)

          const currentTime = Date.now()
          const timeDiff = currentTime - toastData.timestamp
          const isRecent = timeDiff < 30000

          if (isRecent) {
            toast({
              title: toastData.title,
              description: toastData.description,
              variant: toastData.variant,
              permanent: true, // Make session expired toast permanent
            })
          }

          localStorage.removeItem('sessionExpiredToast')
        } catch (error) {
          console.error('Error parsing session expired toast:', error)
          localStorage.removeItem('sessionExpiredToast')
        }
      }
    }

    checkAndShowToast()

    const timeoutId = setTimeout(() => {
      checkAndShowToast()
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(userLogin(values)).unwrap()
      await dispatch(getUserData()).unwrap()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleResendVerification = async (values: LoginFormValues) => {
    try {
      const resultAction = await dispatch(resendVerification(values))
      if (resendVerification.rejected.match(resultAction)) {
        return
      }
      setResendSuccess(true)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    }
  }

  const toggleTheme = () => {
    dispatch(toggleMode())
  }

  const formikConfig = {
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  }

  const inputs = [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
  ]

  return (
    <>
      <div className='fixed top-6 right-6 z-10'>
        <Button variant='outline' size='icon' onClick={toggleTheme}>
          <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </div>
      <AuthCard<LoginFormValues>
        title='Welcome to the Dietrich Analysis Research Education (DARE) Platform'
        inputs={inputs}
        formikConfig={formikConfig}
        buttonText='Sign In'
        showForgotPassword
        onResendVerification={handleResendVerification}
        footer={
          <>
            <AuthFormFooter
              text="Don't have an account?"
              route='/register'
              routeText='Sign up'
            />

            {resendSuccess && (
              <div className='mt-3 w-max rounded-md bg-green-500 px-4 py-2 text-xs font-medium text-white shadow-xs'>
                Verification email resent successfully. Please check your inbox.
              </div>
            )}
          </>
        }
      />
    </>
  )
}

export default LoginScreen
