import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthCard from '../../components/Auth/AuthCard'
import AuthFormFooter from '../../components/Auth/AuthFormFooter'
import { AppDispatch, RootState } from '../../redux/store'
import { userRegister } from '../../redux/asyncThunks/user'
import {
  SignupFormValues,
  signupInitialValues,
  signupValidationSchema,
} from './validation'
import { resetError } from '../../redux/userSlice'
import { Button } from '../../components/ui/button'
import { Moon, Sun } from 'lucide-react'

const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

  useEffect(() => {
    dispatch(resetError())
  }, [dispatch])

  const handleSubmit = async (values: SignupFormValues) => {
    const formData = {
      name: values.name,
      email: values.email,
      password1: values.password1,
      password2: values.password2,
      accessCode: values.accessCode,
    }

    try {
      const resultAction = await dispatch(userRegister(formData))
      if (userRegister.rejected.match(resultAction)) {
        return
      }
      navigate('/confirmation', {
        state: { email: values.email, password: values.password1 },
      })
    } catch (err) {
      console.error(err)
    }
  }

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    dispatch({ type: 'theme/setDarkMode', payload: newTheme === 'dark' })
  }

  const formikConfig = {
    initialValues: signupInitialValues,
    validationSchema: signupValidationSchema,
    onSubmit: handleSubmit,
  }

  const inputs = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'password1', label: 'Password', type: 'password' },
    {
      name: 'password2',
      label: 'Confirm Password',
      type: 'password',
    },
    { name: 'accessCode', label: 'Access Code', type: 'text' },
  ]

  return (
    <>
      <div className='fixed right-6 top-6 z-10'>
        <Button variant='outline' size='icon' onClick={toggleTheme}>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </div>
      <AuthCard<SignupFormValues>
        title='Create Account'
        inputs={inputs}
        formikConfig={formikConfig}
        buttonText='Create Account'
        showprivacyPolicy
        footer={
          <>
            <AuthFormFooter
              text='Already have an account?'
              route='/login'
              routeText='Log in'
            />
          </>
        }
      ></AuthCard>
    </>
  )
}

export default RegistrationScreen
