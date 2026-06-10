import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AuthCard from '../../components/Auth/AuthCard'
import AuthFormFooter from '../../components/Auth/AuthFormFooter'
import { AppDispatch } from '../../redux/store'
import { toggleMode } from '../../redux/themeSlice'
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
    dispatch(toggleMode())
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
      <div className='fixed top-6 right-6 z-10'>
        <Button variant='outline' size='icon' onClick={toggleTheme}>
          <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
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
