import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthCard from '../../components/Auth/AuthCard'
import { FormikValues } from 'formik'
import { AppDispatch } from '../../redux/store'
import { verifyCode } from '../../redux/aynscThunks/user'

import { updateUser } from '../../redux/userSlice'
import {
  verifyCodeInitialValues,
  verifyCodeValidationSchema,
} from './validation'
import { getUserDataFromAPI } from '@/api'

const VerifyCodeScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      otp: values.otp,
    }

    const resultAction = await dispatch(verifyCode(formData.otp))

    if (verifyCode.fulfilled.match(resultAction)) {
      const user = await getUserDataFromAPI()
      dispatch(updateUser(user))
      navigate('/dashboard')
    }
  }

  const formikConfig = {
    initialValues: verifyCodeInitialValues,
    validationSchema: verifyCodeValidationSchema,
    onSubmit: handleSubmit,
  }

  const inputs = [{ name: 'otp', label: 'Code', type: 'text' }]

  return (
    <AuthCard
      title='Verify Code'
      subtitle='An authentication code has been sent to your authenticator app.'
      inputs={inputs}
      formikConfig={formikConfig}
      buttonText='Verify'
      showBackButton
    />
  )
}

export default VerifyCodeScreen
