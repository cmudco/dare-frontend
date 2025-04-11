import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../../components/Auth/AuthCard'
import { FormikValues } from 'formik'
import { AppDispatch } from '../../redux/store'
import { forgotPassword } from '../../redux/aynscThunks/user'
import {
  forgotPasswordInitialValues,
  forgotPasswordValidationSchema,
} from './validation'

const ForgotPasswordScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      email: values.email,
    }

    const resultAction = await dispatch(forgotPassword(formData))

    if (forgotPassword.fulfilled.match(resultAction)) {
      navigate('/forgot-password-success')
    } else {
      console.error('Password reset failed:', resultAction.payload)
    }
  }

  const formikConfig = {
    initialValues: forgotPasswordInitialValues,
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: handleSubmit,
  }

  const input = [{ name: 'email', label: 'Email', type: 'email' }]

  return (
    <AuthCard
      title='Forgot your password'
      subtitle="Don't worry, happens to all of us. Enter your email below to recover your password."
      inputs={input}
      formikConfig={formikConfig}
      buttonText='Recover Password'
      showBackButton
    />
  )
}

export default ForgotPasswordScreen
