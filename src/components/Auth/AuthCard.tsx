import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, FormikConfig, FormikValues } from 'formik'
import TextInput from '../ui/TextInput'
import { RootState } from '../../redux/store'
import { useSelector } from 'react-redux'
import Loader from '../Loader'
import { Button } from '../ui/button'
import { Logo } from '@/components/Logo'

interface InputField {
  name: string
  label: string
  type: string
}

interface AuthCardProps<T extends FormikValues> {
  title: string
  subtitle?: string
  inputs: InputField[]
  formikConfig: FormikConfig<T>
  buttonText: string
  showBackButton?: boolean
  showForgotPassword?: boolean
  showprivacyPolicy?: boolean
  footer?: React.ReactNode
  children?: React.ReactNode
  roleSelect?: React.ReactNode
  onResendVerification?: (values: T) => void
}

const AuthCard = <T extends FormikValues>({
  title,
  subtitle,
  inputs,
  formikConfig,
  buttonText,
  showBackButton = false,
  showForgotPassword = false,
  showprivacyPolicy = false,
  footer,
  children,
  roleSelect,
  onResendVerification,
}: AuthCardProps<T>) => {
  const navigate = useNavigate()
  const error = useSelector((state: RootState) => state.user.error)
  const loading = useSelector((state: RootState) => state.user.loading)

  const showResendButton =
    onResendVerification &&
    error &&
    error.toLowerCase().includes('e-mail is not verified')

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='gradient-border relative mx-auto flex w-[80vw] flex-col items-center justify-center gap-3 rounded-2xl border-6 bg-card p-8 shadow-md md:w-[60vw] lg:w-[50vw] xl:w-[40vw]'>
        {showBackButton && (
          <div
            className='absolute top-5 left-9 mt-4 flex w-full cursor-pointer items-center gap-1 text-left text-xs'
            onClick={() => navigate('/login')}
          >
            <ArrowLeftIcon className='h-5 w-5' />
            <span className='hidden lg:block'>Back to login</span>
          </div>
        )}

        <div className='relative -top-10 flex h-[60px] items-center'>
          <Logo size='lg' orientation='vertical' showTagline />
        </div>

        <h1 className='text-center text-2xl font-black text-foreground'>
          {title}
        </h1>
        {subtitle && <p className='w-[80%] text-start text-sm'>{subtitle}</p>}

        {children}

        <Formik {...formikConfig}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className='w-[80%] md:w-[70%] lg:w-[70%]'>
              {inputs.map((input) => (
                <TextInput
                  key={input.name}
                  name={input.name}
                  label={input.label}
                  type={input.type}
                  value={values[input.name] || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    errors[input.name] && touched[input.name]
                      ? String(errors[input.name])
                      : ''
                  }
                />
              ))}

              {roleSelect}

              {showForgotPassword && (
                <div className='mb-4 flex justify-end text-sm'>
                  <Link to='/forgot-password' className='font-medium text-dare'>
                    Forgot Password?
                  </Link>
                </div>
              )}

              {buttonText && (
                <Button
                  type='submit'
                  variant='default'
                  className='text-md mt-3 flex w-full items-center justify-center rounded-md px-4 py-2 font-medium'
                >
                  {loading ? <Loader /> : buttonText}
                </Button>
              )}

              {error && (
                <div className='mt-3'>
                  <p className='text-center text-xs font-medium text-destructive'>
                    {error}
                  </p>
                  {showResendButton && (
                    <div className='flex justify-center'>
                      <Button
                        type='button'
                        onClick={() =>
                          onResendVerification && onResendVerification(values)
                        }
                        disabled={loading}
                        className='mt-3 w-max rounded-md bg-secondary text-xs font-medium text-secondary-foreground shadow-xs hover:bg-secondary/80'
                      >
                        Resend Verification Email?
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Form>
          )}
        </Formik>

        {footer && <div className='mt-4'>{footer}</div>}
        <div className='h-[50px]'></div>

        {showprivacyPolicy && (
          <p className='absolute -bottom-10 text-center text-sm text-muted-foreground'>
            By signing up, you are agreeing to DARE's Terms of Service and
            Privacy Policy.
          </p>
        )}
      </div>
    </div>
  )
}

export default AuthCard
