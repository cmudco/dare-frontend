import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthFormFooter from '../../components/Auth/AuthFormFooter'
import AuthCard from '../../components/Auth/AuthCard'
import ResendVerificationNotice from '../../components/Auth/ResendVerificationNotice'
import * as Yup from 'yup'
import { AppDispatch } from '../../redux/store'
import { resendVerification } from '../../redux/asyncThunks/user'
import { EmailVerificationSentResponse } from '@/redux/types/auth'
import { EMAIL_DELIVERY_UNAVAILABLE_MESSAGE } from '@/utils/constants/user'

interface EmailConfirmationState {
  email: string
  emailDeliveryConfigured: boolean
}

const EmailConfirmationScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const state = location.state as EmailConfirmationState | null
  const email = state?.email
  const [resendResult, setResendResult] =
    useState<EmailVerificationSentResponse | null>(null)
  const emailDeliveryConfigured =
    resendResult?.emailDeliveryConfigured ??
    state?.emailDeliveryConfigured ??
    false

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  const handleResendVerification = async () => {
    if (!email) return
    try {
      setResendResult(await dispatch(resendVerification({ email })).unwrap())
    } catch (err) {
      console.error('Failed to resend verification email:', err)
    }
  }

  const handleSubmit = () => {
    navigate('/login')
  }

  const formikConfig = {
    initialValues: {},
    validationSchema: Yup.object({}),
    onSubmit: handleSubmit,
  }

  return (
    <AuthCard
      title='Email Confirmation'
      subtitle={
        emailDeliveryConfigured
          ? 'Check your inbox for the verification link. If it does not arrive, request another email or contact your deployment administrator.'
          : EMAIL_DELIVERY_UNAVAILABLE_MESSAGE
      }
      inputs={[]}
      formikConfig={formikConfig}
      buttonText='Back to login'
      showBackButton={false}
      footer={
        email && (
          <>
            <AuthFormFooter
              text="Didn't receive an email?"
              routeText='Resend'
              onClick={handleResendVerification}
            />
            {resendResult && <ResendVerificationNotice result={resendResult} />}
          </>
        )
      }
    />
  )
}

export default EmailConfirmationScreen
