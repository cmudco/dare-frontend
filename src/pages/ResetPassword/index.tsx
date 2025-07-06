import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthCard from '../../components/Auth/AuthCard'
import {
  resetPasswordInitialValues,
  resetPasswordValidationSchema,
} from './validation'
import { FormikValues } from 'formik'
import { AppDispatch } from '../../redux/store'
import { resetPassword } from '../../redux/asyncThunks/user'
import { CALLBACK_VALUES } from '@/constants/platforms'

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { token, uid } = useParams<{ token: string; uid: string }>()
  const [searchParams] = useSearchParams()

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      new_password1: values.password,
      new_password2: values.confirmPassword,
      token: token!,
      uid: uid!,
    }

    try {
      const resultAction = await dispatch(resetPassword(formData)).unwrap()
      if (resultAction) {
        const callback = searchParams.get('callback')
        if (callback === CALLBACK_VALUES.SOCRATIC_BOOKS) {
          // Redirect to SocraticBooks frontend
          const socraticBooksUrl =
            import.meta.env.VITE_SOCRATIC_BOOKS_URL || 'http://localhost:5174'
          window.location.href = `${socraticBooksUrl}/login`
        } else {
          // Default behavior - redirect to DARE login
          navigate('/login')
        }
      }
    } catch (error) {
      console.error('Password reset failed:', error)
    }
  }

  const formikConfig = {
    initialValues: resetPasswordInitialValues,
    validationSchema: resetPasswordValidationSchema,
    onSubmit: handleSubmit,
  }

  const inputs = [
    { name: 'password', label: 'Create Password', type: 'password' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
  ]

  return (
    <AuthCard
      title='Set a password'
      subtitle='Your previous password has been reset. Please set a new password for your account.'
      inputs={inputs}
      formikConfig={formikConfig}
      buttonText='Set Password'
      showBackButton
    />
  )
}

export default ResetPasswordScreen
